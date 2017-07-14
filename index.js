'use strict';

const _ = require('lodash');
const Table = require('easy-table');
const bytes = require('bytes');
const profiler = require('gc-profiler');
const verticalMeter = require('vertical-meter');
const memHistory = [];
const normalize = (val, max, min) => ((val - min) / (max - min));
const v8 = require('v8');
const heapSizeLimit = v8.getHeapStatistics().heap_size_limit;
let markSweepCount = 0;
let bound = false;
const openRequests = [];

function requestLogger(httpModule){
    var original = httpModule.request;
    httpModule.request = (options, fn) => {
        const requestStartTime = process.hrtime();
        const reqId = requestStartTime.join('');
        openRequests.push(reqId);
        console.error('open-requests-count', openRequests.length);
        return original(options, (...args) => {
            const res = args[0];
            const reqStr = `${options.method} ${options.href || (options.proto + '://' + options.host + options.path)} - id: ${reqId}`;
            //setTimeout(() => {
                //const i = openRequests.indexOf(reqId);
                //if (i !== -1) {
                    //console.error('external-request-held', reqStr);
                //}
            //}, 5000);
            console.error('external-request', reqStr);
            res.on('end', () => {
                const requestElapsedTime = process.hrtime(requestStartTime);
                console.error('external-request-time-elapsed', `${reqStr} - elapsed: ${(requestElapsedTime[0] * 1e9 + requestElapsedTime[1]) / 1e6}ms`);
                const i = openRequests.indexOf(reqId);
                if (i !== -1) {
                    openRequests.splice(i, 1);
                }
            });
            return typeof fn === 'function' && fn(...args);
        });
    };
}

module.exports = function leakPatrol(options) {
    options = options || {};
    const snapshotsAtMarkSweep = options.snapshotsAtMarkSweep || [];
    const graphDeltas = options.graphDeltas || false;

    if (bound === false) {
        bound = true;
        requestLogger(require('http'));
        requestLogger(require('https'));
        profiler.on('gc', (info) => {
            if (info.type === "MarkSweepCompact") {

                // count mark sweep
                markSweepCount++;
                console.error(`*********** ${info.type} #${markSweepCount} - PID: ${process.pid} - Heap Size Limit: ${bytes(heapSizeLimit)} ***********`);

                const mem = process.memoryUsage();
                let deltas = {};
                if (memHistory.length) {
                    deltas = _.mapKeys(_.assignWith(memHistory[memHistory.length - 1], mem, (lastVal, newVal) => {
                        return newVal - lastVal;
                    }), (v, k) => `${k}Delta`);
                }
                memHistory.push(_.assign({}, mem));
                console.error(Table.print(Object.assign({}, info, _.mapValues(mem, bytes), _.mapValues(deltas, bytes))));

                if (graphDeltas) {
                    const heapTotalTrend = memHistory.map((entry) => {
                        return verticalMeter(normalize(entry.heapTotal, heapSizeLimit, -heapSizeLimit));
                    });
                    const heapUsedTrend = memHistory.map((entry) => {
                        return verticalMeter(normalize(entry.heapUsed, heapSizeLimit, -heapSizeLimit));
                    });
                    heapTotalTrend.unshift('Heap Total: ');
                    heapUsedTrend.unshift('Heap Used: ');
                    console.error.apply(console, heapTotalTrend);
                    console.error.apply(console, heapUsedTrend);
                }

                console.error(Table.print(_.map(v8.getHeapSpaceStatistics(), (entry) => {
                    return _.mapValues(entry, (v) => {
                        if (_.isNumber(v)) {
                            return bytes(v);
                        } else {
                            return v;
                        }
                    });
                })));

                const lastEventLoopTime = process.hrtime();
                setImmediate(() => {
                    const eventLoopDelay = process.hrtime(lastEventLoopTime);
                    console.error('Event Loop Delay: ', `${(eventLoopDelay[0] * 1e9 + eventLoopDelay[1]) / 1e6}ms`);
                });


                if (snapshotsAtMarkSweep.indexOf(markSweepCount) != -1) {
                    require('heapdump').writeSnapshot((err, filename) => {
                        if (err) {return console.error(err);}
                        console.log('dump written to', filename);
                    });
                }
            }
        });
    }
}
