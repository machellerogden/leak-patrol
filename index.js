'use strict';

const _ = require('lodash');
const Table = require('easy-table');
const bytes = require('bytes');
const profiler = require('gc-profiler');
const memHistory = [];
const normalize = (val, max, min) => ((val - min) / (max - min));
const v8 = require('v8');
const heapSizeLimit = v8.getHeapStatistics().heap_size_limit;
const heapSizeLimitBytes = bytes(heapSizeLimit);
let markSweepCount = 0;
let openRequests = [];
let completedRequests = [];
const snapshotsAtMarkSweep = (process.env.LP_HEAPS_AT || '').split(',').reduce((a, v) => (v && a.push(+v), a), []);
const logAllRequests = !!process.env.LP_LOG_REQS;

instrumentRequest(require('http'));
instrumentRequest(require('https'));

profiler.on('gc', (info) => {
    if (info.type === "MarkSweepCompact") {
        const lastEventLoopTime = process.hrtime();
        setImmediate(() => {
            // count mark sweep
            markSweepCount++;

            process.emit('lp:marksweep', markSweepCount);

            const mem = process.memoryUsage();
            let deltas = {};
            if (memHistory.length) {
                deltas = _.mapKeys(_.assignWith(memHistory[memHistory.length - 1], mem, (lastVal, newVal) => {
                    return newVal - lastVal;
                }), (v, k) => `${k}Delta`);
            }
            memHistory.push(_.assign({}, mem));

            const completedRequestsReport = _.reduce(completedRequests, (acc, entry) => {
                const i = _.findIndex(acc, { request: entry.info });
                if (i !== -1) {
                    acc[i].count++;
                    acc[i].averageElapsedTime = (acc[i].averageElapsedTime + entry.elapsed) / 2;
                } else {
                    acc.push({
                        count: 1,
                        averageElapsedTime: entry.elapsed,
                        request: entry.info
                    });
                }
                return acc;
            }, []);

            // clear completed requests
            completedRequests = [];

            const eventLoopDelay = process.hrtime(lastEventLoopTime);

            console.error(`\n*********** ${info.type} #${markSweepCount} ***********`);

            console.error(Table.print(Object.assign({},
                info,
                {
                    pid: process.pid,
                    heapSizeLimit: heapSizeLimitBytes
                },
                _.mapValues(mem, bytes),
                _.mapValues(deltas, bytes),
                {
                    openRequestCount: openRequests.length,
                    eventLoopDelay: `${(eventLoopDelay[0] * 1e9 + eventLoopDelay[1]) / 1e6}ms`
                }
            )));

            console.error(Table.print(_.map(v8.getHeapSpaceStatistics(), (entry) => {
                return _.mapValues(entry, (v) => {
                    if (_.isNumber(v)) {
                        return bytes(v);
                    } else {
                        return v;
                    }
                });
            })));

            if (completedRequestsReport.length) {
                console.error('Requests Completed Since Last Mark Sweep:');
                console.error(Table.print(completedRequestsReport).split('\n').map((v) => v.slice(0, process.stderr.columns)).join('\n'));
            }

            if (snapshotsAtMarkSweep.indexOf(markSweepCount) != -1) {
                require('heapdump').writeSnapshot((err, filename) => {
                    if (err) {return console.error(err);}
                    console.error('dump written to', filename);
                });
            }

        });

    }
});

function instrumentRequest(httpModule){
    var original = httpModule.request;
    httpModule.request = (options, fn) => {
        const requestStartTime = process.hrtime();
        const reqId = requestStartTime.join('');
        const reqStr = `${options.method} ${options.href || (options.proto + '://' + options.host + options.path)}`;
        if (logAllRequests) {
            console.error(reqStr);
        }
        openRequests.push({
            id: reqId,
            info: reqStr
        });
        const req = original(options, (...args) => {
            const res = args[0];
            res.on('end', () => {
                const requestElapsedTime = process.hrtime(requestStartTime);
                completedRequests.push({
                    id: reqId,
                    info: reqStr,
                    elapsed: (requestElapsedTime[0] * 1e9 + requestElapsedTime[1]) / 1e6
                });
                openRequests = _.filter(openRequests, (entry) => {
                    return (entry.id !== reqId);
                });
            });
            return typeof fn === 'function' && fn(...args);
        });
        req.on('error', (e) => {
            openRequests = _.filter(openRequests, (entry) => {
                return (entry.id !== reqId);
            });
        });
        return req;
    };
}
