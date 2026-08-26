const dijkstra = require("./dijkstra");

function generateGraph(nodeCount, edgeCount) {
    const graph = {};

    for (let i = 0; i < nodeCount; i++) {
        graph[`N${i}`] = [];
    }

    const edges = new Set();

    function addEdge(a, b) {
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        const key = `${min}-${max}`;

        if (edges.has(key)) {
            return false;
        }

        const weight = Math.floor(Math.random() * 20) + 1;

        graph[`N${a}`].push({
            node: `N${b}`,
            weight
        });

        graph[`N${b}`].push({
            node: `N${a}`,
            weight
        });

        edges.add(key);
        return true;
    }

    // Guarantee connectivity
    for (let i = 0; i < nodeCount - 1; i++) {
        addEdge(i, i + 1);
    }

    // Add remaining edges
    while (edges.size < edgeCount) {
        const a = Math.floor(Math.random() * nodeCount);
        const b = Math.floor(Math.random() * nodeCount);

        if (a === b) {
            continue;
        }

        addEdge(a, b);
    }

    return graph;
}

function runBenchmark(nodeCount = 50000, edgeCount = 200000) {
    const graph = generateGraph(nodeCount, edgeCount);
    const start = process.hrtime.bigint();
    const result = dijkstra(graph, "N0");
    const end = process.hrtime.bigint();
    const executionTime = Number(end - start) / 1_000_000;

    return {
        nodes: nodeCount,
        edges: edgeCount,
        executionTime,
        pathFound: result.pathTo(`N${nodeCount - 1}`).length > 0,
        pathLength: result.pathTo(`N${nodeCount - 1}`).length
    };
}

if (require.main === module) {
    console.log("================================");
    console.log("       DIJKSTRA BENCHMARK");
    console.log("================================");
    console.log(`\nGenerating 50000 nodes...`);
    console.log(`Generating 200000 edges...`);

    const results = runBenchmark();

    console.log("\n================================");
    console.log("         BENCHMARK RESULT");
    console.log("================================");
    console.log("Nodes:", results.nodes);
    console.log("Edges:", results.edges);
    console.log("Execution time:", results.executionTime.toFixed(2), "ms");
    console.log("Path found:", results.pathFound);
    console.log("Path length:", results.pathLength);
}

module.exports = {
    runBenchmark
};