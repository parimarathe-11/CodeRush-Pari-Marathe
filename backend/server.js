const express = require("express");
const cors = require("cors");

const dispatch =
    require("./services/dispatch");

const { runBenchmark } =
    require("./algorithms/benchmark");


const app =
    express();


const PORT =
    process.env.PORT || 3000;


// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(
    cors()
);


app.use(
    express.json()
);


// --------------------------------------------------
// HEALTH
// --------------------------------------------------

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            message:
                "CodeRush dispatch server is running"
        });
    }
);


// --------------------------------------------------
// BENCHMARK
// --------------------------------------------------

app.get(
    "/api/benchmark",
    (req, res) => {

        try {

            const results =
                runBenchmark();


            res.json({
                success: true,
                ...results
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    }
);


// --------------------------------------------------
// FRONTEND STATE
// --------------------------------------------------

app.get(
    "/api/state",
    (req, res) => {

        res.json(
            dispatch.getFrontendState()
        );
    }
);


// --------------------------------------------------
// RAW SYSTEM STATE
// OPTIONAL DEBUG ENDPOINT
// --------------------------------------------------

app.get(
    "/api/system",
    (req, res) => {

        res.json({
            success: true,
            data:
                dispatch.getSystemState()
        });
    }
);


// --------------------------------------------------
// DECISION LOG
// --------------------------------------------------

app.get(
    "/api/decisions",
    (req, res) => {

        res.json(
            dispatch.getDecisionLog()
        );
    }
);


// --------------------------------------------------
// ADD EMERGENCY
// --------------------------------------------------

app.post(
    "/api/emergency",
    (req, res) => {

        try {

            const body =
                req.body;


            const village =
                body.village ||
                body.nodeId;


            if (!village) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "village is required"
                    });
            }


            const severity =
                (
                    body.urgency ||
                    body.severity ||
                    "normal"
                ).toLowerCase();


            const allowedSeverities = [

                "critical",

                "urgent",

                "normal"
            ];


            if (
                !allowedSeverities.includes(
                    severity
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid urgency"
                    });
            }


            const emergency =
                dispatch.addEmergency({

                    ...body,

                    nodeId:
                        village,

                    village:
                        village,

                    severity,

                    urgency:
                        severity,

                    requiredSpecialist:
                        body.specialistNeeded ||
                        body.requiredSpecialist ||
                        null
                });


            return res
                .status(201)
                .json({
                    success: true,
                    emergency
                });

        } catch (error) {

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message
                });
        }
    }
);


// --------------------------------------------------
// DISPATCH
// IF emergencyId IS PROVIDED:
// DISPATCH THAT EMERGENCY
//
// OTHERWISE:
// DISPATCH HIGHEST PRIORITY
// --------------------------------------------------

app.post(
    "/api/dispatch",
    (req, res) => {

        try {

            const {
                emergencyId
            } = req.body || {};


            let result;


            if (emergencyId) {

                result =
                    dispatch.dispatchEmergency(
                        emergencyId
                    );

            } else {

                result =
                    dispatch.dispatchNextEmergency();
            }


            if (!result.success) {

                return res
                    .status(409)
                    .json(
                        result
                    );
            }


            return res.json(
                result
            );

        } catch (error) {

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message
                });
        }
    }
);


// --------------------------------------------------
// ROAD TOGGLE
// CLAUDE FRONTEND ENDPOINT
// --------------------------------------------------

app.post(
    "/api/road/toggle",
    (req, res) => {

        try {

            const {
                a,
                b,
                closed
            } = req.body;


            if (!a || !b) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "a and b are required"
                    });
            }


            dispatch.toggleRoad(
                a,
                b,
                Boolean(closed)
            );


            return res.json({

                success: true,

                road:
                    `${a} -> ${b}`,

                closed:
                    Boolean(closed)
            });

        } catch (error) {

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message
                });
        }
    }
);


// --------------------------------------------------
// AMBULANCE FREE
// --------------------------------------------------

app.post(
    "/api/ambulance/:id/free",
    (req, res) => {

        const updated =
            dispatch.updateAmbulanceStatus(
                req.params.id,
                "available"
            );


        if (!updated) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Ambulance not found"
                });
        }


        return res.json({

            success: true,

            message:
                "Ambulance available"
        });
    }
);


// --------------------------------------------------
// HOSPITAL FULL
// --------------------------------------------------

app.post(
    "/api/hospital/:id/full",
    (req, res) => {

        const hospitalId =
            req.params.id;


        const generalUpdated =
            dispatch.updateHospitalBed(
                hospitalId,
                "general",
                0
            );


        const icuUpdated =
            dispatch.updateHospitalBed(
                hospitalId,
                "ICU",
                0
            );


        if (
            !generalUpdated &&
            !icuUpdated
        ) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Hospital not found"
                });
        }


        return res.json({

            success: true,

            message:
                "Hospital marked full"
        });
    }
);


// --------------------------------------------------
// DEPLETE HOSPITAL MEDICINE
// --------------------------------------------------

app.post(
    "/api/hospital/:id/deplete-medicine",
    (req, res) => {

        try {

            const system =
                dispatch.getSystemState();


            const hospital =
                system.hospitals.find(
                    item =>
                        item.id ===
                        req.params.id
                );


            if (!hospital) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Hospital not found"
                    });
            }


            const medicines =
                [...hospital.medicines];


            for (
                const medicine
                of medicines
            ) {

                dispatch.updateHospitalMedicine(
                    hospital.id,
                    medicine,
                    false
                );
            }


            return res.json({

                success: true,

                message:
                    "Hospital medicine depleted"
            });

        } catch (error) {

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message
                });
        }
    }
);


// --------------------------------------------------
// ORIGINAL RESOURCE ENDPOINTS
// KEPT FOR COMPATIBILITY
// --------------------------------------------------

app.post(
    "/api/ambulances/status",
    (req, res) => {

        const {
            ambulanceId,
            status
        } = req.body;


        const updated =
            dispatch.updateAmbulanceStatus(
                ambulanceId,
                status
            );


        if (!updated) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Ambulance not found"
                });
        }


        res.json({
            success: true
        });
    }
);


app.post(
    "/api/hospitals/bed",
    (req, res) => {

        const {
            hospitalId,
            bedType,
            count
        } = req.body;


        const updated =
            dispatch.updateHospitalBed(
                hospitalId,
                bedType,
                count
            );


        if (!updated) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Hospital not found"
                });
        }


        res.json({
            success: true
        });
    }
);


app.post(
    "/api/hospitals/availability",
    (req, res) => {

        const {
            hospitalId,
            available
        } = req.body;


        const updated =
            dispatch.updateHospitalAvailability(
                hospitalId,
                available
            );


        if (!updated) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Hospital not found"
                });
        }


        res.json({
            success: true
        });
    }
);


app.post(
    "/api/hospitals/medicine",
    (req, res) => {

        const {
            hospitalId,
            medicine,
            available
        } = req.body;


        const updated =
            dispatch.updateHospitalMedicine(
                hospitalId,
                medicine,
                available
            );


        if (!updated) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Hospital not found"
                });
        }


        res.json({
            success: true
        });
    }
);


// --------------------------------------------------
// 404
// --------------------------------------------------

app.use(
    (req, res) => {

        res
            .status(404)
            .json({

                success: false,

                message:
                    "API endpoint not found"
            });
    }
);


// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            error
        );


        res
            .status(500)
            .json({

                success: false,

                message:
                    "Internal server error"
            });
    }
);


// --------------------------------------------------
// START
// --------------------------------------------------

app.listen(
    PORT,
    () => {

        console.log(
            "================================"
        );

        console.log(
            "   CODERUSH DISPATCH SERVER"
        );

        console.log(
            "================================"
        );

        console.log(
            `Server running on port ${PORT}`
        );
    }
);