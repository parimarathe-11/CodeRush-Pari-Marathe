const dispatch = require("./dispatch");

console.log("================================");
console.log("   NO AMBULANCE TEST");
console.log("================================");


// Make every ambulance busy
const state = dispatch.getSystemState();

for (const ambulance of state.ambulances) {
    dispatch.updateAmbulanceStatus(
        ambulance.id,
        "busy"
    );
}


// Add emergency
const emergency = dispatch.addEmergency({
    id: "E-NO-AMBULANCE",
    villageId: "VILLAGE001",
    nodeId: "V001",
    severity: "critical",
    requiredSpecialist: "cardiology",
    requiredBed: "ICU",
    requiredMedicine: "blood-thinner"
});


const result =
    dispatch.dispatchEmergency(
        "E-NO-AMBULANCE"
    );

console.log("\nResult:");
console.log(result);


// Check emergency status
const updatedEmergency =
    dispatch.getSystemState()
        .emergencies
        .find(
            e => e.id === "E-NO-AMBULANCE"
        );

console.log(
    "\nEmergency status:",
    updatedEmergency.status
);


if (
    result.success === false &&
    updatedEmergency.status === "waiting"
) {
    console.log(
        "\nPASS — Emergency remains waiting"
    );
} else {
    console.log("\nFAIL");
}


// Restore ambulance
dispatch.updateAmbulanceStatus(
    "AMB001",
    "available"
);

console.log(
    "\nAMB001 restored to available."
);