const { execSync } = require("child_process");

const tests = [
    "algorithms/testPriorityQueue.js",
    "algorithms/testDijkstra.js",
    "algorithms/testRoadStatus.js",
    "services/testEmergencyQueue.js",
    "services/testDispatch.js",
    "services/testHospitalEligibility.js",
    "services/testNoAmbulance.js",
    "services/testResourceUpdate.js",
    "services/testDynamicRouting.js"
];

console.log("================================");
console.log("       CODERUSH TEST SUITE");
console.log("================================");


for (const test of tests) {
    console.log(`\n\nRunning: ${test}`);
    console.log("--------------------------------");

    try {
        execSync(
            `node "${test}"`,
            {
                stdio: "inherit"
            }
        );

        console.log(
            `\n${test} -> PASS`
        );
    } catch (error) {
        console.log(
            `\n${test} -> FAIL`
        );

        process.exitCode = 1;
    }
}


console.log("\n================================");
console.log("       TEST SUITE COMPLETE");
console.log("================================");