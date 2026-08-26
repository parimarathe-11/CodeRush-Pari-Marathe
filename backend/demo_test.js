const BASE_URL = "http://localhost:3000/api";

async function apiGet(path) {
    const res = await fetch(`${BASE_URL}${path}`);
    return res.json();
}

async function apiPost(path, body = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return res.json();
}

async function runDemo() {
    console.log("==========================================");
    console.log("       CODERUSH CONSOLE DEMO TEST");
    console.log("==========================================");

    // 1. Health Check
    const health = await apiGet("/health");
    console.log("Health Check:", health.success ? "PASS" : "FAIL");

    // Resetting state to a clean baseline
    console.log("\nResetting state to baseline...");
    await apiPost("/ambulance/AMB001/free");
    await apiPost("/ambulance/AMB002/free");
    await apiPost("/ambulance/AMB003/free");
    await apiPost("/road/toggle", { a: "V001", b: "V002", closed: false });
    await apiPost("/hospitals/bed", { hospitalId: "H001", bedType: "ICU", count: 2 });
    await apiPost("/hospitals/bed", { hospitalId: "H001", bedType: "general", count: 10 });
    await apiPost("/hospitals/bed", { hospitalId: "H002", bedType: "ICU", count: 4 });
    await apiPost("/hospitals/bed", { hospitalId: "H002", bedType: "general", count: 20 });
    await apiPost("/hospitals/bed", { hospitalId: "H003", bedType: "ICU", count: 1 });
    await apiPost("/hospitals/bed", { hospitalId: "H003", bedType: "general", count: 8 });

    // 2. Demo 1: Critical Cardiology emergency dispatch
    console.log("\n--- Demo 1: Critical Cardiology Emergency Dispatch ---");
    const emergencyRes = await apiPost("/emergency", {
        village: "V001",
        urgency: "CRITICAL",
        specialistNeeded: "cardiology"
    });
    const emergencyId = emergencyRes.emergency.id;
    console.log(`Created Emergency: ${emergencyId} at V001 (CRITICAL, cardiology)`);

    const dispatchRes = await apiPost("/dispatch", { emergencyId });
    console.log("Dispatch status:", dispatchRes.success ? "SUCCESS" : "FAILED");
    if (dispatchRes.success) {
        console.log("Assigned Ambulance:", dispatchRes.decision.ambulance.id);
        console.log("Assigned Hospital:", dispatchRes.decision.selectedHospital.name);
        console.log("Travel Path:", dispatchRes.decision.selectedHospital.path.join(" -> "));
        console.log("ETA:", dispatchRes.decision.etaMinutes, "min");
    } else {
        console.log("Dispatch error message:", dispatchRes.message);
    }

    // 3. Demo 2: Road Closure & Rerouting
    console.log("\n--- Demo 2: Road Closure & Rerouting ---");
    console.log("Closing road V001 -> V002...");
    await apiPost("/road/toggle", { a: "V001", b: "V002", closed: true });
    
    // Free AMB001 to make sure we can dispatch
    await apiPost("/ambulance/AMB001/free");

    const emergency2Res = await apiPost("/emergency", {
        village: "V001",
        urgency: "NORMAL",
        specialistNeeded: "general"
    });
    const emergency2Id = emergency2Res.emergency.id;
    const dispatch2Res = await apiPost("/dispatch", { emergencyId: emergency2Id });
    if (dispatch2Res.success) {
        console.log(`Alternative Path (V001 -> V002 is closed): ${dispatch2Res.decision.selectedHospital.path.join(" -> ")}`);
    } else {
        console.log("Alternative Path dispatch failed:", dispatch2Res.message);
    }

    // Reopen road to restore normalcy
    await apiPost("/road/toggle", { a: "V001", b: "V002", closed: false });

    // 4. Demo 3: Mark Hospital Full & Deplete Meds
    console.log("\n--- Demo 3: Hospital Full Simulation ---");
    console.log("Marking Hospital H001 (Rampur) full (0 beds)...");
    await apiPost("/hospital/H001/full");
    
    // Free AMB001
    await apiPost("/ambulance/AMB001/free");

    const emergency3Res = await apiPost("/emergency", {
        village: "V001",
        urgency: "CRITICAL",
        specialistNeeded: "cardiology"
    });
    const emergency3Id = emergency3Res.emergency.id;
    const dispatch3Res = await apiPost("/dispatch", { emergencyId: emergency3Id });
    if (dispatch3Res.success) {
        console.log("New Hospital assigned:", dispatch3Res.decision.selectedHospital.name);
    } else {
        console.log("Dispatch failed as expected:", dispatch3Res.message);
        if (dispatch3Res.decision && dispatch3Res.decision.hospitalEvaluations) {
            console.log("Evaluations:");
            dispatch3Res.decision.hospitalEvaluations.forEach(hev => {
                console.log(` - ${hev.name}: Eligible? ${hev.eligible} (Reasons: ${hev.rejectReasons.join(", ")})`);
            });
        }
    }

    // 5. Demo 4: Queue Priority Ordering
    console.log("\n--- Demo 4: Queue Priority Ordering ---");
    console.log("Adding multiple emergencies: NORMAL, NORMAL, CRITICAL, URGENT...");
    await apiPost("/emergency", { village: "V001", urgency: "NORMAL", specialistNeeded: "general" });
    await apiPost("/emergency", { village: "V002", urgency: "NORMAL", specialistNeeded: "general" });
    await apiPost("/emergency", { village: "V003", urgency: "CRITICAL", specialistNeeded: "general" });
    await apiPost("/emergency", { village: "V004", urgency: "URGENT", specialistNeeded: "general" });

    const state = await apiGet("/state");
    console.log("Pending Queue Order:");
    // Find the newly added emergencies by filtering for waiting ones
    state.pendingEmergencies.slice(0, 4).forEach(item => {
        console.log(` - ${item.id} [${item.urgency}] at ${item.village}`);
    });

    // 6. Demo 5: System Benchmark
    console.log("\n--- Demo 5: 50,000-Node Performance Benchmark ---");
    console.log("Running backend benchmark...");
    const bench = await apiGet("/benchmark");
    console.log("Benchmark status:", bench.success ? "SUCCESS" : "FAILED");
    if (bench.success) {
        console.log("Nodes:", bench.nodes);
        console.log("Edges:", bench.edges);
        console.log("Execution Time:", bench.executionTime.toFixed(2), "ms");
        console.log("Path Found:", bench.pathFound);
    }

    console.log("\n==========================================");
    console.log("       DEMO SUITE RUN COMPLETE");
    console.log("==========================================");
}

runDemo().catch(console.error);
