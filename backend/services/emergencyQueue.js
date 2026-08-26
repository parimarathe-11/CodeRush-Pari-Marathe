const MinHeap = require("../algorithms/priorityQueue");

class EmergencyQueue {
    constructor() {
        this.queue = new MinHeap();
    }

    add(emergency) {
        const priority =
            this.getPriority(
                emergency.severity
            );

        this.queue.insert(
            emergency,
            priority
        );
    }

    getPriority(severity) {
        if (severity === "critical") {
            return 1;
        }

        if (severity === "urgent") {
            return 2;
        }

        return 3;
    }

    next() {
        return this.queue.extractMin();
    }

    isEmpty() {
        return this.queue.isEmpty();
    }
}

module.exports = EmergencyQueue;