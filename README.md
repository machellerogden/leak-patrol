# Leak Patrol

| Simple dashboard to watch memory allocation at the time of Mark Sweep events.

## Install

```
npm i --save-dev leak-patrol
```

## Usage

```
node -r leak-patrol ./my-app-entrypoint 2>&1 >/dev/null
```

Note: In the above example, stderr is redirected to stdout and stdout is ignored
because all output from leak-patrol comes via stderr. This helps reduce the noise
if you have other logging in place. If there's additional noise in stderr you
want to filter out, I recommend you pipe to an inverse grep as follows:

```
node -r leak-patrol ./my-app-entrypoint 2>&1 >/dev/null | grep -v 'Warning'
```

## Taking Heap Snapshots

Leak Patrol can take heap snapshots at specified marksweep counts which allows
you to then look at memory usage deltas between these events. Here's an example:

```
LP_HEAPS_AT=5,6 node -r leak-patrol ./my-app-entrypoint 2>&1 >/dev/null
```

The above will take a heap snapshot at the 5th and the 6th MarkSweep event.

The snapshots will be written to your current directory.

## License

Apache 2.0
