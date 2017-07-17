# Leak Patrol

| Simple dashboard to watch memory allocation at the time of Mark Sweep events.

## Install

```
npm i --save-dev leak-patrol
```

## Usage

```
node -r leak-patrol ./my-app-entrypoint > /dev/null
```

Note: you may want to pipe stdout to /dev/null when you run your app because all logs output from leak-patrol are piped to stderr.

## License

Apache 2.0
