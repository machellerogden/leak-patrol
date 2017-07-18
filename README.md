# Leak Patrol

| Simple dashboard to watch memory allocation at the time of Mark Sweep events.

## Install

```
npm i -g leak-patrol
```

## Usage

```
leak-patrol ./my-app-entrypoint
```

## Taking Heap Snapshots

Leak Patrol can take heap snapshots at specified marksweep counts which allows
you to then look at memory usage deltas between these events. Here's an example:

```
LP_HEAPS_AT=5,6 leak-patrol ./my-app-entrypoint
```

The above will take a heap snapshot at the 5th and the 6th MarkSweep event.

The snapshots will be written to your current directory.

## License

Apache 2.0
