const dispatch = require("./dispatch");

console.log("================================");
console.log("   COMPLETE DISPATCH TEST");
console.log("================================");

console.log("\n1. ADDING EMERGENCY");

const emergency = dispatch.addEmergency({
    id: "E001",
    villageId: "VILLAGE001",
    nodeId: "V001",
    severity: "critical",
    requiredSpecialist: "cardiology",
    requiredBed: "ICU",
    requiredMedicine: "blood-thinner"
});

console.log(emergency);

console.log("\n2. DISPATCHING EMERGENCY");

const result = dispatch.dispatchEmergency("E001");

console.log(
    JSON.stringify(result, null, 2)
);

console.log("\n3. DECISION LOG");

console.log(
    JSON.stringify(
        dispatch.getDecisionLog(),
        null,
        2
    )
);

console.log("\n4. FINAL SYSTEM STATE");

console.log(
    JSON.stringify(
        dispatch.getSystemState(),
        null,
        2
    )
);