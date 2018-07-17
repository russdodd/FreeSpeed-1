# README
## How the code fits together

### parse intervals
starts off by calling return_intervals() which parses the command line arguments and calls combineProduceIntervals()

### combineProduceIntervals
converts the data into it's correct data types, uses convolution to find the peaks calls getSortedOrderings which constructs the candidates and scores them and then calls the interval scheduler.

### The interval scheduling class
applies the algorithm to the intervals. The algorithm is O(n*m) where n is the number of candidates and m is the total number of pieces to schedule. The algorithm creates a 2d dynamic programming array where each entry represents the max value scheduling using n number of intervals from m interval options.

### The intervals and data then are used to create the matplotlib graph.

