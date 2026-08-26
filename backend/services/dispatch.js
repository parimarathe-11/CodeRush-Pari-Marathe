const dijkstra = require("../algorithms/dijkstra");
const RoadStatus = require("../algorithms/roadStatus");

const {
    graph,
    villages,
    hospitals,
    ambulances,
    emergencies
} = require("../data/data");


const roadStatus = new RoadStatus();

const decisionLog = [];

let emergencyCounter = 1;


// --------------------------------------------------
// PRIORITY
// --------------------------------------------------

const emergencyPriority = {
    critical: 1,
    urgent: 2,
    normal: 3
};


function getEmergencyPriority(severity) {
    return emergencyPriority[severity] || 3;
}


// --------------------------------------------------
// EMERGENCY QUEUE
// --------------------------------------------------

function getPendingEmergencies() {

    return emergencies
        .filter(
            emergency =>
                emergency.status === "waiting"
        )
        .sort(
            (a, b) => {

                const priorityDifference =
                    getEmergencyPriority(
                        a.severity
                    ) -
                    getEmergencyPriority(
                        b.severity
                    );

                if (
                    priorityDifference !== 0
                ) {
                    return priorityDifference;
                }

                return new Date(
                    a.createdAt
                ) - new Date(
                    b.createdAt
                );
            }
        );
}


// --------------------------------------------------
// ADD EMERGENCY
// --------------------------------------------------

function addEmergency(emergency) {

    const id =
        emergency.id ||
        `E${String(
            emergencyCounter++
        ).padStart(3, "0")}`;


    const newEmergency = {

        id,

        villageId:
            emergency.villageId ||
            emergency.village ||
            "UNKNOWN",


        nodeId:
            emergency.nodeId ||
            emergency.village,


        severity:
            (
                emergency.severity ||
                emergency.urgency ||
                "normal"
            ).toLowerCase(),


        requiredSpecialist:
            emergency.requiredSpecialist ||
            emergency.specialistNeeded ||
            null,


        requiredBed:
            emergency.requiredBed ||
            "general",


        requiredMedicine:
            emergency.requiredMedicine ||
            null,


        createdAt:
            emergency.createdAt ||
            new Date().toISOString(),


        status: "waiting"
    };


    emergencies.push(
        newEmergency
    );


    return newEmergency;
}


// --------------------------------------------------
// AMBULANCES
// --------------------------------------------------

function getAvailableAmbulances() {

    return ambulances.filter(
        ambulance =>
            ambulance.status ===
            "available"
    );
}


function findNearestAmbulance(
    emergency
) {

    const available =
        getAvailableAmbulances();


    let best = null;


    for (
        const ambulance
        of available
    ) {

        const result =
            dijkstra(
                graph,
                ambulance.nodeId,
                roadStatus.getClosedRoads()
            );


        const distance =
            result.distances[
                emergency.nodeId
            ];


        if (
            distance !== undefined &&
            distance !== Infinity
        ) {

            if (
                best === null ||
                distance <
                    best.distance
            ) {

                best = {

                    ambulance,

                    distance,

                    path:
                        result.pathTo(
                            emergency.nodeId
                        )
                };
            }
        }
    }


    return best;
}


// --------------------------------------------------
// HOSPITAL ELIGIBILITY
// --------------------------------------------------

function getHospitalRejectReasons(
    hospital,
    emergency
) {

    const reasons = [];


    if (!hospital.available) {

        reasons.push(
            "hospital unavailable"
        );
    }


    if (
        emergency.requiredSpecialist &&
        !hospital.specialists.includes(
            emergency.requiredSpecialist
        )
    ) {

        reasons.push(
            `missing ${emergency.requiredSpecialist} specialist`
        );
    }


    if (
        emergency.requiredBed &&
        (
            hospital.beds[
                emergency.requiredBed
            ] === undefined ||

            hospital.beds[
                emergency.requiredBed
            ] <= 0
        )
    ) {

        reasons.push(
            `${emergency.requiredBed} bed unavailable`
        );
    }


    if (
        emergency.requiredMedicine &&
        !hospital.medicines.includes(
            emergency.requiredMedicine
        )
    ) {

        reasons.push(
            `${emergency.requiredMedicine} unavailable`
        );
    }


    return reasons;
}


function hospitalIsEligible(
    hospital,
    emergency
) {

    return (
        getHospitalRejectReasons(
            hospital,
            emergency
        ).length === 0
    );
}


// --------------------------------------------------
// HOSPITAL OPTIONS
// --------------------------------------------------

function findHospitalOptions(
    emergency
) {

    const options = [];


    const route =
        dijkstra(
            graph,
            emergency.nodeId,
            roadStatus.getClosedRoads()
        );


    for (
        const hospital
        of hospitals
    ) {

        if (
            !hospitalIsEligible(
                hospital,
                emergency
            )
        ) {
            continue;
        }


        const distance =
            route.distances[
                hospital.nodeId
            ];


        if (
            distance === undefined ||
            distance === Infinity
        ) {
            continue;
        }


        const travelTime =
            distance;


        const waitTime =
            hospital.waitTime || 0;


        const totalCost =
            travelTime +
            waitTime;


        options.push({

            hospital,

            travelTime,

            waitTime,

            totalCost,

            path:
                route.pathTo(
                    hospital.nodeId
                )
        });
    }


    options.sort(
        (a, b) =>
            a.totalCost -
            b.totalCost
    );


    return options;
}


// --------------------------------------------------
// HOSPITAL EVALUATION
// --------------------------------------------------

function evaluateHospitals(
    emergency
) {

    const route =
        dijkstra(
            graph,
            emergency.nodeId,
            roadStatus.getClosedRoads()
        );


    return hospitals.map(
        hospital => {

            const rejectReasons =
                getHospitalRejectReasons(
                    hospital,
                    emergency
                );


            const distance =
                route.distances[
                    hospital.nodeId
                ];


            if (
                distance === undefined ||
                distance === Infinity
            ) {

                rejectReasons.push(
                    "no reachable route"
                );
            }


            return {

                hospitalId:
                    hospital.id,

                name:
                    hospital.name,

                eligible:
                    rejectReasons.length === 0,

                rejectReasons,

                distance:
                    distance === Infinity
                        ? null
                        : distance,

                path:
                    distance === Infinity
                        ? []
                        : route.pathTo(
                            hospital.nodeId
                        )
            };
        }
    );
}


// --------------------------------------------------
// DISPATCH ONE EMERGENCY
// --------------------------------------------------

function dispatchEmergency(
    emergencyId
) {

    const emergency =
        emergencies.find(
            item =>
                item.id ===
                emergencyId
        );


    if (!emergency) {

        return {

            success: false,

            message:
                "Emergency not found"
        };
    }


    if (
        emergency.status ===
        "dispatched"
    ) {

        return {

            success: false,

            message:
                "Emergency already dispatched"
        };
    }


    const hospitalEvaluations =
        evaluateHospitals(
            emergency
        );


    const ambulance =
        findNearestAmbulance(
            emergency
        );


    if (!ambulance) {

        const decision = {

            emergency: {
                id:
                    emergency.id,

                urgency:
                    emergency.severity.toUpperCase()
            },

            status:
                "FAILED",

            reason:
                "No available ambulance",

            hospitalEvaluations
        };


        decisionLog.unshift(
            decision
        );


        return {

            success: false,

            message:
                "No available ambulance",

            decision
        };
    }


    const hospitalOptions =
        findHospitalOptions(
            emergency
        );


    if (
        hospitalOptions.length === 0
    ) {

        const decision = {

            emergency: {
                id:
                    emergency.id,

                urgency:
                    emergency.severity.toUpperCase()
            },

            status:
                "FAILED",

            reason:
                "No feasible hospital available",

            hospitalEvaluations
        };


        decisionLog.unshift(
            decision
        );


        return {

            success: false,

            message:
                "No feasible hospital available",

            decision
        };
    }


    const selected =
        hospitalOptions[0];


    ambulance.ambulance.status =
        "busy";


    const hospital =
        selected.hospital;


    hospital.beds[
        emergency.requiredBed
    ]--;


    emergency.status =
        "dispatched";


    emergency.assignedAmbulance =
        ambulance.ambulance.id;


    emergency.assignedHospital =
        hospital.id;


    const selectedEvaluation =
        hospitalEvaluations.find(
            item =>
                item.hospitalId ===
                hospital.id
        );


    const decision = {

        emergency: {

            id:
                emergency.id,

            urgency:
                emergency.severity.toUpperCase()
        },


        status:
            "DISPATCHED",


        hospitalEvaluations,


        selectedHospital: {

            id:
                hospital.id,

            name:
                hospital.name,

            distance:
                selected.travelTime,

            nodesExplored:
                Object.keys(
                    graph
                ).length,

            path:
                selected.path
        },


        ambulance: {

            id:
                ambulance.ambulance.id,

            distanceToVillage:
                ambulance.distance,

            path:
                ambulance.path
        },


        etaMinutes:
            ambulance.distance +
            selected.travelTime +
            selected.waitTime,


        timestamp:
            new Date().toISOString()
    };


    decisionLog.unshift(
        decision
    );


    return {

        success: true,

        decision
    };
}


// --------------------------------------------------
// DISPATCH NEXT
// --------------------------------------------------

function dispatchNextEmergency() {

    const pending =
        getPendingEmergencies();


    if (
        pending.length === 0
    ) {

        return {

            success: false,

            message:
                "No pending emergencies"
        };
    }


    return dispatchEmergency(
        pending[0].id
    );
}


// --------------------------------------------------
// RESOURCE UPDATES
// --------------------------------------------------

function updateAmbulanceStatus(
    ambulanceId,
    status
) {

    const ambulance =
        ambulances.find(
            item =>
                item.id ===
                ambulanceId
        );


    if (!ambulance) {
        return false;
    }


    ambulance.status =
        status;


    return true;
}


function updateHospitalBed(
    hospitalId,
    bedType,
    count
) {

    const hospital =
        hospitals.find(
            item =>
                item.id ===
                hospitalId
        );


    if (!hospital) {
        return false;
    }


    hospital.beds[
        bedType
    ] = Math.max(
        0,
        count
    );


    return true;
}


function updateHospitalAvailability(
    hospitalId,
    available
) {

    const hospital =
        hospitals.find(
            item =>
                item.id ===
                hospitalId
        );


    if (!hospital) {
        return false;
    }


    hospital.available =
        available;


    return true;
}


function updateHospitalMedicine(
    hospitalId,
    medicine,
    available
) {

    const hospital =
        hospitals.find(
            item =>
                item.id ===
                hospitalId
        );


    if (!hospital) {
        return false;
    }


    if (available) {

        if (
            !hospital.medicines.includes(
                medicine
            )
        ) {

            hospital.medicines.push(
                medicine
            );
        }

    } else {

        hospital.medicines =
            hospital.medicines.filter(
                item =>
                    item !==
                    medicine
            );
    }


    return true;
}


// --------------------------------------------------
// ROAD CONTROL
// --------------------------------------------------

function closeRoad(
    from,
    to
) {

    roadStatus.closeRoad(
        from,
        to
    );
}


function openRoad(
    from,
    to
) {

    roadStatus.openRoad(
        from,
        to
    );
}


function toggleRoad(
    from,
    to,
    closed
) {

    if (closed) {

        closeRoad(
            from,
            to
        );

    } else {

        openRoad(
            from,
            to
        );
    }
}


// --------------------------------------------------
// MAP DATA
// --------------------------------------------------

function getMapNodes() {

    // ----------------------------------------------
    // MAP LAYOUT
    //
    // Designed for a compact 900 x 420 SVG area.
    // Villages are arranged like a real road network
    // instead of one long horizontal line.
    // ----------------------------------------------

    const coordinates = {

        V001: {
            x: 120,
            y: 260
        },

        V002: {
            x: 260,
            y: 130
        },

        V003: {
            x: 400,
            y: 240
        },

        V004: {
            x: 560,
            y: 120
        },

        V005: {
            x: 680,
            y: 270
        },

        V006: {
            x: 820,
            y: 160
        }
    };


    // ----------------------------------------------
    // VILLAGES
    // ----------------------------------------------

    const villageNodes =
        villages.map(
            village => {

                const position =
                    coordinates[
                        village.nodeId
                    ];


                return {

                    id:
                        village.nodeId,

                    label:
                        village.name,

                    type:
                        "village",

                    x:
                        position.x,

                    y:
                        position.y
                };
            }
        );


    // ----------------------------------------------
    // HOSPITALS
    //
    // Hospitals share the same graph nodes as some
    // villages, so we visually offset them to prevent
    // overlap.
    // ----------------------------------------------

    const hospitalOffsets = {

        H001: {
            x: 0,
            y: 65
        },

        H002: {
            x: 0,
            y: 65
        },

        H003: {
            x: 0,
            y: 65
        }
    };


    const hospitalNodes =
        hospitals.map(
            hospital => {

                const base =
                    coordinates[
                        hospital.nodeId
                    ];


                const offset =
                    hospitalOffsets[
                        hospital.id
                    ] || {
                        x: 0,
                        y: 55
                    };


                return {

                    id:
                        `HOSPITAL_${hospital.id}`,

                    label:
                        hospital.name,

                    type:
                        "hospital",

                    x:
                        base.x +
                        offset.x,

                    y:
                        base.y +
                        offset.y
                };
            }
        );


    return [

        ...villageNodes,

        ...hospitalNodes
    ];
}

function getMapEdges() {

    const edges = [];

    const seen =
        new Set();

    const closedRoads =
        roadStatus.getClosedRoads();


    for (
        const from
        of Object.keys(graph)
    ) {

        for (
            const connection
            of graph[from]
        ) {

            const to =
                connection.node;


            const key =
                [from, to]
                    .sort()
                    .join("|");


            // Avoid drawing the same
            // undirected road twice.
            if (
                seen.has(key)
            ) {
                continue;
            }


            seen.add(key);


            const forward =
                `${from}->${to}`;


            const reverse =
                `${to}->${from}`;


            const closed =
                closedRoads.has(
                    forward
                ) ||
                closedRoads.has(
                    reverse
                );


            edges.push({

                from,

                to,

                weight:
                    connection.weight,

                closed
            });
        }
    }


    return edges;
}


// --------------------------------------------------
// FRONTEND STATE
// --------------------------------------------------

function getFrontendState() {

    const pendingEmergencies =
        getPendingEmergencies()
            .map(
                emergency => {

                    const village =
                        villages.find(
                            item =>
                                item.nodeId ===
                                emergency.nodeId
                        );


                    return {

                        id:
                            emergency.id,

                        village:
                            emergency.nodeId,

                        villageName:
                            village
                                ? village.name
                                : emergency.nodeId,

                        urgency:
                            emergency.severity.toUpperCase(),

                        specialistNeeded:
                            emergency.requiredSpecialist ||
                            "general"
                    };
                }
            );


    const ambulanceState =
        Object.fromEntries(

            ambulances.map(
                ambulance => [

                    ambulance.id,

                    {

                        id:
                            ambulance.id,

                        label:
                            ambulance.id,

                        status:
                            ambulance.status,

                        nodeId:
                            ambulance.nodeId,

                        type:
                            ambulance.type
                    }
                ]
            )
        );


    const hospitalState =
        Object.fromEntries(

            hospitals.map(
                hospital => {

                    const bedsAvailable =
                        Object.values(
                            hospital.beds
                        ).reduce(
                            (sum, count) =>
                                sum + count,
                            0
                        );


                    const bedsTotal =
                        hospital.bedsTotal ||
                        bedsAvailable;


                    return [

                        hospital.id,

                        {

                            id:
                                hospital.id,

                            name:
                                hospital.name,

                            nodeId:
                                hospital.nodeId,

                            bedsAvailable,

                            bedsTotal,

                            medicineStock:
                                hospital.medicines.length *
                                25,

                            specialists:
                                hospital.specialists,

                            available:
                                hospital.available
                        }
                    ];
                }
            )
        );


    return {

        nodes:
            getMapNodes(),

        edges:
            getMapEdges(),

        pendingEmergencies,

        ambulances:
            ambulanceState,

        hospitals:
            hospitalState,

        decisionLog:
            [...decisionLog]
    };
}


// --------------------------------------------------
// OLD SYSTEM STATE
// --------------------------------------------------

function getSystemState() {

    return {

        villages,

        hospitals,

        ambulances,

        emergencies,

        closedRoads: [
            ...roadStatus.getClosedRoads()
        ],

        decisionLog: [
            ...decisionLog
        ]
    };
}


// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

function getDecisionLog() {
    return [...decisionLog];
}


module.exports = {

    addEmergency,

    dispatchEmergency,

    dispatchNextEmergency,

    getPendingEmergencies,

    findNearestAmbulance,

    findHospitalOptions,

    hospitalIsEligible,

    updateAmbulanceStatus,

    updateHospitalBed,

    updateHospitalAvailability,

    updateHospitalMedicine,

    closeRoad,

    openRoad,

    toggleRoad,

    getDecisionLog,

    getSystemState,

    getFrontendState
};