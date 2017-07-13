# Leak Patrol

| Simple dashboard to watch memory allocation at the time of Mark Sweep events.

## Install

```
npm i --save-dev leak-patrol
```

## Usage

Very early as in your application's entrypoint file...

```
require('leak-patrol')();
```

And then run your app.

Note: you may want to pipe stdout to /dev/null when you run your app because all logs output from leak-patrol are piped to stderr.

## Options

```
require('leak-patrol')({
    snapshotsAtMarkSweep: [ 10, 11 ], // this will take a heap snapshot at marksweep #10 and #11, useful for getting deltas
    graphDeltas: true // this will print a small graph of values showing the heapTotal delta between mark sweep events
});
```

## License

Apache 2.0
