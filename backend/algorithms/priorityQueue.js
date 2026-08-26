class MinHeap {
    constructor() {
        this.heap = [];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    insert(value, priority) {
        const node = {
            value,
            priority
        };

        this.heap.push(node);

        let index = this.heap.length - 1;

        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);

            if (
                this.heap[parentIndex].priority <=
                this.heap[index].priority
            ) {
                break;
            }

            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }

    extractMin() {
        if (this.isEmpty()) {
            return null;
        }

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];

        this.heap[0] = this.heap.pop();

        let index = 0;

        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            let smallest = index;

            if (
                left < this.heap.length &&
                this.heap[left].priority <
                    this.heap[smallest].priority
            ) {
                smallest = left;
            }

            if (
                right < this.heap.length &&
                this.heap[right].priority <
                    this.heap[smallest].priority
            ) {
                smallest = right;
            }

            if (smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }

        return min;
    }

    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}

module.exports = MinHeap;