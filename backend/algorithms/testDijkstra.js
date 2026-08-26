const {
    graph
} = require("../data/data");

const dijkstra = require("./dijkstra");

const result = dijkstra(
    graph,
    "V001"
);

console.log("DISTANCES");
console.log(result.distances);

console.log("\nPATH V001 -> V006");
console.log(
    result.pathTo("V006")
);

console.log("\nDISTANCE V001 -> V006");
console.log(
    result.distances["V006"]
);