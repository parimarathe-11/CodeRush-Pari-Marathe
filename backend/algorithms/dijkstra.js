const MinHeap = require("./priorityQueue");

function getEdgeKey(from, to) {
    return `${from}->${to}`;
}

function dijkstra(graph, startNode, closedRoads = new Set()) {
    const distances = {};
    const previous = {};

    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }

    if (!(startNode in graph)) {
        return {
            distances,
            previous,
            pathTo: () => []
        };
    }

    distances[startNode] = 0;

    const queue = new MinHeap();

    queue.insert(startNode, 0);

    while (!queue.isEmpty()) {
        const current = queue.extractMin();

        const currentNode = current.value;
        const currentDistance = current.priority;

        if (
            currentDistance >
            distances[currentNode]
        ) {
            continue;
        }

        const neighbors =
            graph[currentNode] || [];

        for (const edge of neighbors) {
            const edgeKey = getEdgeKey(
                currentNode,
                edge.node
            );

            if (closedRoads.has(edgeKey)) {
                continue;
            }

            const newDistance =
                currentDistance + edge.weight;

            if (
                newDistance <
                distances[edge.node]
            ) {
                distances[edge.node] = newDistance;

                previous[edge.node] =
                    currentNode;

                queue.insert(
                    edge.node,
                    newDistance
                );
            }
        }
    }

    function pathTo(targetNode) {
        if (
            !(targetNode in distances) ||
            distances[targetNode] === Infinity
        ) {
            return [];
        }

        const path = [];

        let current = targetNode;

        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }

        return path;
    }

    return {
        distances,
        previous,
        pathTo
    };
}

module.exports = dijkstra;
module.exports.getEdgeKey = getEdgeKey;