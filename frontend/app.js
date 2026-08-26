const API_BASE =
    window.API_BASE ||
    "http://localhost:3000";

const SVG_NS =
    "http://www.w3.org/2000/svg";

let state = null;

let lastRoutePath = null;


/* =========================================
   MAP STATE
========================================= */

let mapBounds = null;

let mapView = null;

let isDragging = false;

let dragStart = null;

let mapListenersReady = false;


/* =========================================
   API
========================================= */

async function apiGet(path) {

    const response =
        await fetch(
            `${API_BASE}${path}`
        );

    return response.json();
}


async function apiPost(
    path,
    body = {}
) {

    const response =
        await fetch(
            `${API_BASE}${path}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(body)
            }
        );

    return response.json();
}


/* =========================================
   CONNECTION
========================================= */

function setConn(ok) {

    const dot =
        document.getElementById(
            "connDot"
        );

    const label =
        document.getElementById(
            "connLabel"
        );

    dot.classList.toggle(
        "live",
        ok
    );

    label.textContent =
        ok
            ? "backend live"
            : "backend offline — start the API on :3000";
}


/* =========================================
   MAP VIEW
========================================= */

function calculateMapBounds() {

    if (
        !state ||
        !state.nodes ||
        !state.nodes.length
    ) {
        return {
            x: 0,
            y: 0,
            width: 1000,
            height: 600
        };
    }


    const padding = 90;

    const xs =
        state.nodes.map(
            node => node.x
        );

    const ys =
        state.nodes.map(
            node => node.y
        );


    const minX =
        Math.min(...xs) -
        padding;

    const maxX =
        Math.max(...xs) +
        padding;

    const minY =
        Math.min(...ys) -
        padding;

    const maxY =
        Math.max(...ys) +
        padding;


    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}


function applyMapView() {

    const svg =
        document.getElementById(
            "mapSvg"
        );

    if (
        !svg ||
        !mapView
    ) {
        return;
    }


    svg.setAttribute(
        "viewBox",
        `${mapView.x} ${mapView.y} ${mapView.width} ${mapView.height}`
    );
}


function resetMapView() {

    if (!mapBounds) {
        return;
    }


    mapView = {
        ...mapBounds
    };


    applyMapView();
}


function zoomMap(
    factor,
    centerX,
    centerY
) {

    if (
        !mapView ||
        !mapBounds
    ) {
        return;
    }


    const minWidth =
        mapBounds.width * 0.25;

    const maxWidth =
        mapBounds.width * 2;


    let newWidth =
        mapView.width *
        factor;


    newWidth =
        Math.max(
            minWidth,
            Math.min(
                maxWidth,
                newWidth
            )
        );


    const actualFactor =
        newWidth /
        mapView.width;


    const newHeight =
        mapView.height *
        actualFactor;


    const relativeX =
        (
            centerX -
            mapView.x
        ) /
        mapView.width;


    const relativeY =
        (
            centerY -
            mapView.y
        ) /
        mapView.height;


    mapView = {

        x:
            centerX -
            newWidth *
            relativeX,

        y:
            centerY -
            newHeight *
            relativeY,

        width:
            newWidth,

        height:
            newHeight
    };


    applyMapView();
}


function getMapPoint(event) {

    const svg =
        document.getElementById(
            "mapSvg"
        );

    const rect =
        svg.getBoundingClientRect();


    return {

        x:
            mapView.x +
            (
                event.clientX -
                rect.left
            ) /
            rect.width *
            mapView.width,

        y:
            mapView.y +
            (
                event.clientY -
                rect.top
            ) /
            rect.height *
            mapView.height
    };
}


/* =========================================
   MAP INTERACTION
========================================= */

function setupMapInteraction() {

    if (mapListenersReady) {
        return;
    }


    const svg =
        document.getElementById(
            "mapSvg"
        );


    svg.addEventListener(
        "wheel",
        event => {

            event.preventDefault();

            if (!mapView) {
                return;
            }


            const point =
                getMapPoint(
                    event
                );


            const factor =
                event.deltaY < 0
                    ? 0.85
                    : 1.18;


            zoomMap(
                factor,
                point.x,
                point.y
            );
        },
        {
            passive: false
        }
    );


    svg.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.closest(
                    "[data-village]"
                )
            ) {
                return;
            }


            if (!mapView) {
                return;
            }


            isDragging = true;


            svg.setPointerCapture(
                event.pointerId
            );


            dragStart = {

                x:
                    event.clientX,

                y:
                    event.clientY,

                viewX:
                    mapView.x,

                viewY:
                    mapView.y
            };


            svg.classList.add(
                "dragging"
            );
        }
    );


    svg.addEventListener(
        "pointermove",
        event => {

            if (
                !isDragging ||
                !dragStart ||
                !mapView
            ) {
                return;
            }


            const rect =
                svg.getBoundingClientRect();


            const dx =
                event.clientX -
                dragStart.x;


            const dy =
                event.clientY -
                dragStart.y;


            mapView.x =
                dragStart.viewX -
                (
                    dx /
                    rect.width
                ) *
                mapView.width;


            mapView.y =
                dragStart.viewY -
                (
                    dy /
                    rect.height
                ) *
                mapView.height;


            applyMapView();
        }
    );


    function stopDrag(event) {

        isDragging = false;

        dragStart = null;

        svg.classList.remove(
            "dragging"
        );


        if (
            event.pointerId !== undefined &&
            svg.hasPointerCapture(
                event.pointerId
            )
        ) {
            svg.releasePointerCapture(
                event.pointerId
            );
        }
    }


    svg.addEventListener(
        "pointerup",
        stopDrag
    );


    svg.addEventListener(
        "pointercancel",
        stopDrag
    );


    svg.addEventListener(
        "dblclick",
        event => {

            event.preventDefault();

            resetMapView();
        }
    );


    document
        .getElementById("mapZoomIn")
        .addEventListener("click", () => {
            if (!mapView) return;
            zoomMap(0.8, mapView.x + mapView.width / 2, mapView.y + mapView.height / 2);
        });


    document
        .getElementById("mapZoomOut")
        .addEventListener("click", () => {
            if (!mapView) return;
            zoomMap(1.25, mapView.x + mapView.width / 2, mapView.y + mapView.height / 2);
        });


    document
        .getElementById("mapReset")
        .addEventListener("click", () => {
            resetMapView();
        });


    mapListenersReady = true;
}


/* =========================================
   MAP RENDER
========================================= */

function renderMap() {

    const svg =
        document.getElementById(
            "mapSvg"
        );


    if (
        !svg ||
        !state
    ) {
        return;
    }


    const nodeById = {};

    state.nodes.forEach(
        node => {

            nodeById[
                node.id
            ] = node;
        }
    );


    svg.innerHTML = "";


    /* ---------- ROADS ---------- */

    state.edges.forEach(
        edge => {

            const a =
                nodeById[
                    edge.from
                ];

            const b =
                nodeById[
                    edge.to
                ];


            if (!a || !b) {
                return;
            }


            const line =
                document.createElementNS(
                    SVG_NS,
                    "line"
                );


            line.setAttribute(
                "x1",
                a.x
            );

            line.setAttribute(
                "y1",
                a.y
            );

            line.setAttribute(
                "x2",
                b.x
            );

            line.setAttribute(
                "y2",
                b.y
            );

            line.setAttribute(
                "stroke",
                edge.closed
                    ? "#d92d20"
                    : "#c7ccd3"
            );

            line.setAttribute(
                "stroke-width",
                edge.closed
                    ? "3"
                    : "2"
            );

            line.setAttribute(
                "stroke-dasharray",
                edge.closed
                    ? "8 5"
                    : "none"
            );

            line.setAttribute(
                "stroke-linecap",
                "round"
            );


            svg.appendChild(
                line
            );


            if (
                edge.weight !== undefined
            ) {

                const weight =
                    document.createElementNS(
                        SVG_NS,
                        "text"
                    );


                weight.setAttribute(
                    "x",
                    (
                        a.x +
                        b.x
                    ) / 2
                );


                weight.setAttribute(
                    "y",
                    (
                        a.y +
                        b.y
                    ) / 2 - 6
                );


                weight.setAttribute(
                    "text-anchor",
                    "middle"
                );


                weight.setAttribute(
                    "class",
                    "road-weight"
                );


                weight.textContent =
                    `${edge.weight}`;


                svg.appendChild(
                    weight
                );
            }
        }
    );


    /* ---------- ACTIVE ROUTE ---------- */

    if (
        lastRoutePath &&
        lastRoutePath.length > 1
    ) {

        for (
            let i = 0;
            i <
            lastRoutePath.length - 1;
            i++
        ) {

            const a =
                nodeById[
                    lastRoutePath[i]
                ];

            const b =
                nodeById[
                    lastRoutePath[i + 1]
                ];


            if (!a || !b) {
                continue;
            }


            const route =
                document.createElementNS(
                    SVG_NS,
                    "line"
                );


            route.setAttribute(
                "x1",
                a.x
            );

            route.setAttribute(
                "y1",
                a.y
            );

            route.setAttribute(
                "x2",
                b.x
            );

            route.setAttribute(
                "y2",
                b.y
            );

            route.setAttribute(
                "stroke",
                "#2563eb"
            );

            route.setAttribute(
                "stroke-width",
                "5"
            );

            route.setAttribute(
                "stroke-linecap",
                "round"
            );


            svg.appendChild(
                route
            );
        }
    }


    /* ---------- NODES ---------- */

    state.nodes.forEach(
        node => {

            const group =
                document.createElementNS(
                    SVG_NS,
                    "g"
                );


            if (
                node.type ===
                "village"
            ) {

                group.setAttribute(
                    "data-village",
                    node.id
                );

                group.style.cursor =
                    "pointer";
            }


            const radius =
                node.type === "hospital"
                    ? 13
                    : node.type === "village"
                        ? 10
                        : 6;


            const color =
                node.type === "hospital"
                    ? "#d92d20"
                    : node.type === "village"
                        ? "#2563eb"
                        : "#9aa4b2";


            const circle =
                document.createElementNS(
                    SVG_NS,
                    "circle"
                );


            circle.setAttribute(
                "cx",
                node.x
            );

            circle.setAttribute(
                "cy",
                node.y
            );

            circle.setAttribute(
                "r",
                radius
            );

            circle.setAttribute(
                "fill",
                color
            );

            circle.setAttribute(
                "stroke",
                "#ffffff"
            );

            circle.setAttribute(
                "stroke-width",
                "2"
            );


            group.appendChild(
                circle
            );


            if (node.type === "hospital") {

                const cross =
                    document.createElementNS(
                        SVG_NS,
                        "path"
                    );


                cross.setAttribute(
                    "d",
                    `M ${node.x - 5} ${node.y} L ${node.x + 5} ${node.y} M ${node.x} ${node.y - 5} L ${node.x} ${node.y + 5}`
                );


                cross.setAttribute(
                    "stroke",
                    "#ffffff"
                );


                cross.setAttribute(
                    "stroke-width",
                    "2.5"
                );


                cross.setAttribute(
                    "stroke-linecap",
                    "round"
                );


                cross.setAttribute(
                    "pointer-events",
                    "none"
                );


                group.appendChild(
                    cross
                );
            }


            const label =
                document.createElementNS(
                    SVG_NS,
                    "text"
                );


            label.setAttribute(
                "x",
                node.x +
                radius +
                7
            );

            label.setAttribute(
                "y",
                node.y +
                4
            );

            label.setAttribute(
                "class",
                "node-label"
            );

            label.textContent =
                node.label;


            group.appendChild(
                label
            );


            if (
                node.type ===
                "village"
            ) {

                group.addEventListener(
                    "click",
                    () => {

                        document.getElementById(
                            "fVillage"
                        ).value =
                            node.id;


                        openEmergencyForm();
                    }
                );
            }


            svg.appendChild(
                group
            );
        }
    );


    /* ---------- EMERGENCY MARKERS ---------- */

    state.pendingEmergencies.forEach(
        emergency => {

            const village =
                nodeById[
                    emergency.village
                ];


            if (!village) {
                return;
            }


            const marker =
                document.createElementNS(
                    SVG_NS,
                    "circle"
                );


            marker.setAttribute(
                "cx",
                village.x
            );

            marker.setAttribute(
                "cy",
                village.y
            );

            marker.setAttribute(
                "r",
                18
            );

            marker.setAttribute(
                "fill",
                "none"
            );

            marker.setAttribute(
                "stroke",
                emergency.urgency ===
                "CRITICAL"
                    ? "#d92d20"
                    : "#b54708"
            );

            marker.setAttribute(
                "stroke-width",
                "3"
            );

            marker.setAttribute(
                "stroke-dasharray",
                "5 4"
            );


            svg.appendChild(
                marker
            );
        }
    );


    if (!mapBounds) {

        mapBounds =
            calculateMapBounds();

        resetMapView();
    }


    applyMapView();

    setupMapInteraction();
}


/* =========================================
   QUEUE
========================================= */

function renderQueue() {

    const element =
        document.getElementById(
            "queueList"
        );

    element.innerHTML = "";


    if (
        !state.pendingEmergencies.length
    ) {

        element.innerHTML =
            `
            <div class="empty-note">
                No pending emergencies.
                Add one above.
            </div>
            `;

        return;
    }


    state.pendingEmergencies.forEach(
        emergency => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "queue-item";


            row.innerHTML =
                `
                <span>
                    ${emergency.id}
                    ·
                    ${emergency.village}
                    · needs
                    <b>
                        ${emergency.specialistNeeded}
                    </b>
                </span>

                <span
                    class="
                        tag
                        ${emergency.urgency}
                    "
                >
                    ${emergency.urgency}
                </span>
                `;


            element.appendChild(
                row
            );
        }
    );
}


/* =========================================
   AMBULANCES
========================================= */

function renderAmbulances() {

    const element =
        document.getElementById(
            "ambList"
        );

    element.innerHTML = "";


    Object.values(
        state.ambulances
    ).forEach(
        ambulance => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                `amb-card ${ambulance.status}`;


            card.innerHTML =
                `
                <div class="amb-header">
                    <span class="amb-id">🚑 ${ambulance.id}</span>
                    <span class="amb-badge ${ambulance.status}">${ambulance.status}</span>
                </div>
                <div class="amb-details">
                    <span>Type: <b>${ambulance.type}</b></span>
                    <span>Node: <b>${ambulance.nodeId}</b></span>
                </div>
                ${
                    ambulance.status !==
                    "available"

                        ? `
                        <button
                            class="btn btn-mini btn-danger"
                            data-free="${ambulance.id}"
                            style="margin-top:4px; width:100%;"
                        >
                            free up
                        </button>
                        `

                        : ""
                }
                `;


            element.appendChild(
                card
            );
        }
    );


    element
        .querySelectorAll(
            "[data-free]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await apiPost(
                            `/api/ambulance/${button.dataset.free}/free`
                        );

                        await refreshState();
                    }
                );
            }
        );
}


/* =========================================
   HOSPITALS
========================================= */

function renderHospitals() {

    const element =
        document.getElementById(
            "hospitalList"
        );

    element.innerHTML = "";


    Object.values(
        state.hospitals
    ).forEach(
        hospital => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "hospital-card";


            const bedPct =
                Math.round(
                    (
                        hospital.bedsAvailable /
                        hospital.bedsTotal
                    ) * 100
                );


            card.innerHTML =
                `
                <div class="h-top">

                    <span class="h-name">
                        ${hospital.name}
                    </span>

                    <span>
                        ${hospital.bedsAvailable}/${hospital.bedsTotal}
                        beds
                    </span>

                </div>


                <div class="bar-row">

                    beds

                    <div class="bar-track">
                        <div
                            class="
                                bar-fill
                                ${bedPct < 20 ? "low" : ""}
                            "
                            style="
                                width:${bedPct}%
                            "
                        ></div>
                    </div>

                </div>


                <div class="bar-row">

                    medicine

                    <div class="bar-track">

                        <div
                            class="
                                bar-fill
                                ${
                                    hospital.medicineStock < 20
                                        ? "low"
                                        : ""
                                }
                            "
                            style="
                                width:${hospital.medicineStock}%
                            "
                        ></div>

                    </div>

                    <span>
                        ${hospital.medicineStock}%
                    </span>

                </div>


                <div class="specialist-tags">

                    ${hospital.specialists
                        .map(
                            specialist =>
                                `
                                <span class="spec-tag">
                                    ${specialist}
                                </span>
                                `
                        )
                        .join("")}

                </div>

                <div class="hospital-actions" style="margin-top:10px; display:flex; gap:6px;">
                    <button
                        class="btn btn-mini btn-danger"
                        data-full="${hospital.id}"
                        ${hospital.bedsAvailable === 0 ? "disabled" : ""}
                    >
                        mark full
                    </button>
                    <button
                        class="btn btn-mini btn-danger"
                        data-deplete="${hospital.id}"
                        ${hospital.medicineStock === 0 ? "disabled" : ""}
                    >
                        deplete meds
                    </button>
                </div>
                `;


            element.appendChild(
                card
            );
        }
    );


    element
        .querySelectorAll(
            "[data-full]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await apiPost(
                            `/api/hospital/${button.dataset.full}/full`
                        );

                        await refreshState();
                    }
                );
            }
        );


    element
        .querySelectorAll(
            "[data-deplete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await apiPost(
                            `/api/hospital/${button.dataset.deplete}/deplete-medicine`
                        );

                        await refreshState();
                    }
                );
            }
        );
}


/* =========================================
   DISRUPTIONS
========================================= */

function renderSimButtons() {

    const element =
        document.getElementById(
            "simButtons"
        );

    element.innerHTML = "";


    state.edges
        .slice(0, 6)
        .forEach(
            edge => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "sim-row";


                row.innerHTML =
                    `
                    <span>
                        🚧
                        ${edge.from}
                        →
                        ${edge.to}
                    </span>

                    <button
                        class="
                            btn
                            btn-mini
                            ${edge.closed ? "" : "btn-danger"}
                        "
                        data-road="
                            ${edge.from}|${edge.to}|${!edge.closed}
                        "
                    >
                        ${edge.closed ? "reopen" : "close"}
                    </button>
                    `;


                element.appendChild(
                    row
                );
            }
        );


    element
        .querySelectorAll(
            "[data-road]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const [
                            a,
                            b,
                            closed
                        ] =
                            button.dataset.road.split(
                                "|"
                            );


                        await apiPost(
                            "/api/road/toggle",
                            {
                                a,
                                b,

                                closed:
                                    closed === "true"
                            }
                        );


                        await refreshState();
                    }
                );
            }
        );
}


/* =========================================
   DECISION LOG
========================================= */

function renderDecisionLog() {

    const element =
        document.getElementById(
            "decisionLog"
        );

    element.innerHTML = "";


    if (
        !state.decisionLog.length
    ) {

        element.innerHTML =
            `
            <div class="empty-note">
                No dispatch decisions yet.
                Add an emergency,
                then hit Dispatch Next.
            </div>
            `;

        lastRoutePath = null;

        return;
    }


    state.decisionLog.forEach(
        decision => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "decision-card status-" +
                decision.status.toLowerCase();


            let bodyHtml = "";

            let evalHtml = "";
            if (decision.hospitalEvaluations && decision.hospitalEvaluations.length > 0) {
                evalHtml =
                    `
                    <div class="decision-section">
                        <div class="sec-title">
                            Hospital Evaluations
                        </div>
                        ${decision.hospitalEvaluations.map(hev => {
                            const isSelected = decision.selectedHospital && decision.selectedHospital.id === hev.hospitalId;
                            const classList = hev.eligible ? (isSelected ? 'eval-row selected' : 'eval-row') : 'eval-row rejected';
                            const suffix = hev.eligible ? ` (${hev.distance} min)` : ` <span class="reason-note">(${hev.rejectReasons.join(', ')})</span>`;
                            return `
                            <div class="${classList}">
                                ${hev.name}${suffix}
                            </div>
                            `;
                        }).join('')}
                    </div>
                    `;
            }


            if (
                decision.status ===
                "DISPATCHED"
            ) {

                bodyHtml =
                    `
                    <div class="decision-section">

                        <div class="sec-title">
                            Routing
                        </div>

                        <div class="stat-line">
                            <span>
                                Hospital
                            </span>

                            <b>
                                ${decision.selectedHospital.name}
                            </b>
                        </div>

                        <div class="stat-line">
                            <span>
                                Distance
                            </span>

                            <b>
                                ${decision.selectedHospital.distance}
                                min
                            </b>
                        </div>

                        <div class="stat-line">
                            <span>
                                Path
                            </span>

                            <b>
                                ${decision.selectedHospital.path.join(
                                    " → "
                                )}
                            </b>
                        </div>

                    </div>


                    <div class="decision-section">

                        <div class="stat-line">

                            <span>
                                Ambulance
                            </span>

                            <b>
                                ${decision.ambulance.id}
                            </b>

                        </div>


                        <div class="stat-line">

                            <span>
                                ETA
                            </span>

                            <b>
                                ${decision.etaMinutes}
                                min
                            </b>

                        </div>

                    </div>
                    ` + evalHtml;

            } else {

                bodyHtml =
                    `
                    <div class="decision-section">

                        ${
                            decision.reason ||
                            "No feasible dispatch found."
                        }

                    </div>
                    ` + evalHtml;
            }


            card.innerHTML =
                `
                <div class="d-head">

                    <span>
                        🚨
                        ${decision.emergency.id}
                        ·

                        <span
                            class="
                                tag
                                ${decision.emergency.urgency}
                            "
                        >
                            ${decision.emergency.urgency}
                        </span>

                    </span>


                    <span
                        class="
                            d-status
                            ${decision.status}
                        "
                    >
                        ${decision.status}
                    </span>

                </div>

                ${bodyHtml}
                `;


            element.appendChild(
                card
            );
        }
    );


    const latestSuccess =
        state.decisionLog.find(
            decision =>
                decision.status ===
                "DISPATCHED"
        );


    if (latestSuccess) {

        lastRoutePath = [
            ...latestSuccess.selectedHospital.path
        ];


        lastRoutePath.push(
            `HOSPITAL_${latestSuccess.selectedHospital.id}`
        );

    } else {

        lastRoutePath = null;
    }
}


/* =========================================
   MASTER RENDER
========================================= */

function renderAll() {

    renderQueue();

    renderAmbulances();

    renderHospitals();

    renderSimButtons();

    renderDecisionLog();

    renderMap();
}


async function refreshState() {

    try {

        state =
            await apiGet(
                "/api/state"
            );


        setConn(true);

        renderAll();

    } catch (error) {

        setConn(false);

        console.error(
            "Error refreshing state:",
            error
        );
    }
}


/* =========================================
   EMERGENCY FORM
========================================= */

function openEmergencyForm() {

    document.getElementById(
        "emergencyForm"
    ).style.display =
        "flex";
}


function populateVillageOptions() {

    const select =
        document.getElementById(
            "fVillage"
        );

    select.innerHTML = "";


    state.nodes
        .filter(
            node =>
                node.type ===
                "village"
        )
        .forEach(
            village => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    village.id;

                option.textContent =
                    village.label;


                select.appendChild(
                    option
                );
            }
        );
}


/* =========================================
   EVENTS
========================================= */

document
    .getElementById(
        "btnGenEmergency"
    )
    .addEventListener(
        "click",
        () => {

            const form =
                document.getElementById(
                    "emergencyForm"
                );


            form.style.display =
                form.style.display ===
                "none"
                    ? "flex"
                    : "none";
        }
    );


document
    .getElementById(
        "emergencyForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const village =
                document.getElementById(
                    "fVillage"
                ).value;


            const urgency =
                document.getElementById(
                    "fUrgency"
                ).value;


            const specialistNeeded =
                document.getElementById(
                    "fSpecialist"
                ).value;


            await apiPost(
                "/api/emergency",
                {
                    village,
                    urgency,
                    specialistNeeded
                }
            );


            const form =
                document.getElementById(
                    "emergencyForm"
                );

            form.reset();

            form.style.display = "none";


            await refreshState();
        }
    );


document
    .getElementById(
        "btnDispatch"
    )
    .addEventListener(
        "click",
        async () => {

            await apiPost(
                "/api/dispatch"
            );

            await refreshState();
        }
    );


document
    .getElementById(
        "btnRunBenchmark"
    )
    .addEventListener(
        "click",
        async () => {

            const btn =
                document.getElementById(
                    "btnRunBenchmark"
                );

            const resultsDiv =
                document.getElementById(
                    "benchmarkResults"
                );


            btn.disabled = true;

            btn.textContent =
                "⏳ Running benchmark...";

            resultsDiv.style.display =
                "none";


            try {

                const res =
                    await apiGet(
                        "/api/benchmark"
                    );


                document.getElementById(
                    "benchNodes"
                ).textContent =
                    res.nodes.toLocaleString();


                document.getElementById(
                    "benchEdges"
                ).textContent =
                    res.edges.toLocaleString();


                document.getElementById(
                    "benchTime"
                ).textContent =
                    `${res.executionTime.toFixed(
                        2
                    )} ms`;


                document.getElementById(
                    "benchPath"
                ).textContent =
                    res.pathFound
                        ? "Yes"
                        : "No";


                resultsDiv.style.display =
                    "block";

            } catch (error) {

                alert(
                    "Benchmark failed to run: " +
                    error.message
                );

            } finally {

                btn.disabled = false;

                btn.textContent =
                    "🚀 Run Benchmark";
            }
        }
    );


/* =========================================
   BOOT
========================================= */

let isPollingStarted = false;


async function boot() {

    try {

        await apiGet(
            "/api/health"
        );


        setConn(true);


        state =
            await apiGet(
                "/api/state"
            );


        populateVillageOptions();

        mapBounds =
            calculateMapBounds();


        resetMapView();

        renderAll();


        if (!isPollingStarted) {

            setInterval(refreshState, 5000);

            isPollingStarted = true;
        }

    } catch (error) {

        setConn(false);

        console.error(
            "Boot failed, retrying in 5s...",
            error
        );


        setTimeout(boot, 5000);
    }
}


boot();