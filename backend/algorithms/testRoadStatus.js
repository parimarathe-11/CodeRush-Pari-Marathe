const RoadStatus = require("./roadStatus");

const roads = new RoadStatus();

console.log("Initially:");
console.log(roads.isClosed("A", "B"));

roads.closeRoad("A", "B");

console.log("\nAfter closing A -> B:");
console.log(roads.isClosed("A", "B"));

roads.openRoad("A", "B");

console.log("\nAfter opening A -> B:");
console.log(roads.isClosed("A", "B"));