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

## Example Output

Below is a sample of the types of data which leak patrol exposes...

```
*********** MarkSweepCompact #1 ***********
date             : Tue Jul 18 2017 14:14:36 GMT-0500 (CDT)
duration         : 3.299
type             : MarkSweepCompact
forced           : false
flags            : 0
pid              : 24920
heapSizeLimit    : 1.4GB
rss              : 112.83MB
heapTotal        : 88.75MB
heapUsed         : 67.29MB
external         : 1.25MB
openRequestCount : 0
eventLoopDelay   : 2.332664ms

space_name          space_size  space_used_size  space_available_size  physical_space_size
------------------  ----------  ---------------  --------------------  -------------------
new_space           32MB        14.48MB          1.26MB                32MB
old_space           33MB        31.25MB          466.99kB              33MB
code_space          9MB         7.91MB           288.84kB              9MB
map_space           3MB         2.36MB           54.42kB               3MB
large_object_space  11.75MB     11.48MB          1.31GB                11.75MB


*********** MarkSweepCompact #2 ***********
date             : Tue Jul 18 2017 14:15:04 GMT-0500 (CDT)
duration         : 11.603
type             : MarkSweepCompact
forced           : false
flags            : 0
pid              : 24920
heapSizeLimit    : 1.4GB
rss              : 81.11MB
heapTotal        : 56.92MB
heapUsed         : 44.04MB
external         : 1.36MB
rssDelta         : -31.72MB
heapTotalDelta   : -31.83MB
heapUsedDelta    : -23.25MB
externalDelta    : 115.95kB
openRequestCount : 0
eventLoopDelay   : 0.659448ms

space_name          space_size  space_used_size  space_available_size  physical_space_size
------------------  ----------  ---------------  --------------------  -------------------
new_space           3MB         1.59MB           1.36MB                3MB
old_space           35MB        28.38MB          2.65MB                35MB
code_space          9MB         6.23MB           2.52MB                9MB
map_space           3MB         1.22MB           1.73MB                3MB
large_object_space  6.92MB      6.77MB           1.34GB                6.92MB


*********** MarkSweepCompact #3 ***********
date             : Tue Jul 18 2017 14:15:16 GMT-0500 (CDT)
duration         : 20.186
type             : MarkSweepCompact
forced           : false
flags            : 0
pid              : 24920
heapSizeLimit    : 1.4GB
rss              : 81.36MB
heapTotal        : 49.92MB
heapUsed         : 43.73MB
external         : 164.65kB
rssDelta         : 252kB
heapTotalDelta   : -7MB
heapUsedDelta    : -317.94kB
externalDelta    : -1.2MB
openRequestCount : 0
eventLoopDelay   : 0.396658ms

space_name          space_size  space_used_size  space_available_size  physical_space_size
------------------  ----------  ---------------  --------------------  -------------------
new_space           1MB         102.2kB          905.3kB               1MB
old_space           32MB        29.65MB          1.25MB                32MB
code_space          7MB         6.14MB           200.13kB              7MB
map_space           3MB         1.22MB           1.73MB                3MB
large_object_space  6.92MB      6.77MB           1.35GB                6.92MB
```

## License

Apache 2.0
