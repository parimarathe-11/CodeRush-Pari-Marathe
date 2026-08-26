const dispatch = require("./dispatch");

console.log("========================================");
console.log("   HOSPITAL ELIGIBILITY TESTS");
console.log("========================================");


// --------------------------------------------------
// TEST 1 — SPECIALIST UNAVAILABLE
// --------------------------------------------------

console.log("\nTEST 1: Specialist unavailable");

dispatch.addEmergency({
    id: "E-SPECIALIST",
    villageId: "VILLAGE001",
    nodeId: "V001",
    severity: "critical",
    requiredSpecialist: "neurology",
    requiredBed: "ICU",
    requiredMedicine: "blood-thinner"
});

const specialistResult =
    dispatch.findHospitalOptions(
        dispatch.getSystemState().emergencies
            .find(e => e.id === "E-SPECIALIST")
    );

console.log("Hospital options:", specialistResult.length);

if (specialistResult.length === 0) {
    console.log("PASS — No hospital has neurology");
} else {
    console.log("FAIL");
}


// --------------------------------------------------
// TEST 2 — ICU BED UNAVAILABLE
// --------------------------------------------------

console.log("\nTEST 2: ICU bed unavailable");

dispatch.updateHospitalBed(
    "H001",
    "ICU",
    0
);

const emergencyBed = dispatch.addEmergency({
    id: "E-BED",
    villageId: "VILLAGE001",
    nodeId: "V001",
    severity: "critical",
    requiredSpecialist: "cardiology",
    requiredBed: "ICU",
    requiredMedicine: "blood-thinner"
});

const bedOptions =
    dispatch.findHospitalOptions(
        emergencyBed
    );

const h001Available =
    bedOptions.some(
        option =>
            option.hospital.id === "H001"
    );

if (!h001Available) {
    console.log("PASS — H001 rejected because ICU = 0");
} else {
    console.log("FAIL");
}


// --------------------------------------------------
// TEST 3 — MEDICINE UNAVAILABLE
// --------------------------------------------------

console.log("\nTEST 3: Medicine unavailable");

dispatch.updateHospitalMedicine(
    "H001",
    "blood-thinner",
    false
);

const emergencyMedicine =
    dispatch.addEmergency({
        id: "E-MEDICINE",
        villageId: "VILLAGE001",
        nodeId: "V001",
        severity: "critical",
        requiredSpecialist: "cardiology",
        requiredBed: "ICU",
        requiredMedicine: "blood-thinner"
    });

const medicineOptions =
    dispatch.findHospitalOptions(
        emergencyMedicine
    );

const medicineHospitalAvailable =
    medicineOptions.some(
        option =>
            option.hospital.id === "H001"
    );

if (!medicineHospitalAvailable) {
    console.log(
        "PASS — H001 rejected because medicine unavailable"
    );
} else {
    console.log("FAIL");
}


// --------------------------------------------------
// TEST 4 — HOSPITAL UNAVAILABLE
// --------------------------------------------------

console.log("\nTEST 4: Hospital unavailable");

dispatch.updateHospitalAvailability(
    "H002",
    false
);

const emergencyUnavailable =
    dispatch.addEmergency({
        id: "E-UNAVAILABLE",
        villageId: "VILLAGE001",
        nodeId: "V001",
        severity: "urgent",
        requiredSpecialist: "trauma",
        requiredBed: "general",
        requiredMedicine: "antibiotics"
    });

const unavailableOptions =
    dispatch.findHospitalOptions(
        emergencyUnavailable
    );

const h002Available =
    unavailableOptions.some(
        option =>
            option.hospital.id === "H002"
    );

if (!h002Available) {
    console.log(
        "PASS — H002 rejected because hospital unavailable"
    );
} else {
    console.log("FAIL");
}


// --------------------------------------------------
// RESTORE TEST DATA
// --------------------------------------------------

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

dispatch.updateHospitalAvailability(
    "H002",
    true
);

console.log("\nTest data restored.");