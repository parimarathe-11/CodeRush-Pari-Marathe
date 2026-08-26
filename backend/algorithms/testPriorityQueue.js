const MinHeap = require("./priorityQueue");

const queue = new MinHeap();

queue.insert("NORMAL", 3);
queue.insert("CRITICAL", 1);
queue.insert("URGENT", 2);
queue.insert("NORMAL-2", 3);

console.log(queue.extractMin());
console.log(queue.extractMin());
console.log(queue.extractMin());
console.log(queue.extractMin());
console.log(queue.extractMin());