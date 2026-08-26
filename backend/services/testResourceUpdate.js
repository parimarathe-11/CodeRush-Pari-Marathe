const dispatch = require("./dispatch");

console.log("================================");
console.log("   RESOURCE UPDATE TEST");
console.log("================================");


// Make sure ambulance is available
dispatch.updateAmbulanceStatus(
    "AMB001",
    "available"
);


// Restore hospital
dispatch.updateHospitalAvailability(
    "H001",
    true
);

dispatch.updateHospitalBed(
    "H001",
    "ICU",
    2
);

dispatch.updateHospitalMedicine(
    "H001",
    "blood-thinner",
    true
);


// Add emergency
const emergency =
    dispatch.addEmergency({
        id: "E-RESOURCE",
        villageId: "VILLAGE001",
        nodeId: "V001",
        severity: "critical",
        requiredSpecialist: "cardiology",
        requiredBed: "ICU",
        requiredMedicine: "blood-thinner"
    });


const before =
    dispatch.getSystemState()
        .hospitals
        .find(h => h.id === "H001");

console.log(
    "\nICU before:",
    before.beds.ICU
);


const result =
    dispatch.dispatchEmergency(
        "E-RESOURCE"
    );

console.log(
    "\nDispatch result:",
    result.success
);


const after =
    dispatch.getSystemState()
        .hospitals
        .find(h => h.id === "H001");

console.log(
    "ICU after:",
    after.beds.ICU
);


if (
    result.success &&
    after.beds.ICU < before.beds.ICU
) {
    console.log(
        "\nPASS — Hospital resource updated"
    );
} else {
    console.log("\nFAIL");
}