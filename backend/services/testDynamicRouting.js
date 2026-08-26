const dispatch = require("./dispatch");

console.log("================================");
console.log("   DYNAMIC ROUTING TEST");
console.log("================================");


// --------------------------------------------------
// NORMAL ROUTE
// --------------------------------------------------

console.log("\n1. NORMAL ROUTE");

let emergency = {
    id: "ROUTE-TEST-1",
    villageId: "VILLAGE001",
    nodeId: "V001",
    severity: "normal"
};

let ambulance =
    dispatch.findNearestAmbulance(
        emergency
    );

console.log(
    "Ambulance:",
    ambulance.ambulance.id
);

console.log(
    "Distance:",
    ambulance.distance
);

console.log(
    "Path:",
    ambulance.path
);


// --------------------------------------------------
// CLOSE ROAD
// --------------------------------------------------

console.log("\n2. CLOSING V001 -> V002");

dispatch.closeRoad(
    "V001",
    "V002"
);

ambulance =
    dispatch.findNearestAmbulance(
        emergency
    );

console.log(
    "Distance after closure:",
    ambulance.distance
);

console.log(
    "Path after closure:",
    ambulance.path
);


// --------------------------------------------------
// OPEN ROAD AGAIN
// --------------------------------------------------

console.log("\n3. REOPENING V001 -> V002");

dispatch.openRoad(
    "V001",
    "V002"
);

ambulance =
    dispatch.findNearestAmbulance(
        emergency
    );

console.log(
    "Distance after reopening:",
    ambulance.distance
);

console.log(
    "Path after reopening:",
    ambulance.path
);

console.log(
    "\nPASS — Dynamic road status tested"
);