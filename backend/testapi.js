const BASE_URL =
    "http://localhost:3000/api";

async function request(
    method,
    path,
    body = null
) {
    const options = {
        method,
        headers: {
            "Content-Type":
                "application/json"
        }
    };

    if (body) {
        options.body =
            JSON.stringify(body);
    }

    const response =
        await fetch(
            `${BASE_URL}${path}`,
            options
        );

    const data =
        await response.json();

    console.log(
        `\n${method} ${path}`
    );

    console.log(
        JSON.stringify(
            data,
            null,
            2
        )
    );

    return {
        response,
        data
    };
}


async function run() {
    console.log(
        "================================"
    );

    console.log(
        "       CODERUSH API TEST"
    );

    console.log(
        "================================"
    );


    // Health
    await request(
        "GET",
        "/health"
    );


    // State
    await request(
        "GET",
        "/state"
    );


    // Road close
    await request(
        "POST",
        "/roads/close",
        {
            from: "V001",
            to: "V002"
        }
    );


    // Road open
    await request(
        "POST",
        "/roads/open",
        {
            from: "V001",
            to: "V002"
        }
    );


    // Hospital bed
    await request(
        "POST",
        "/hospitals/bed",
        {
            hospitalId: "H001",
            bedType: "ICU",
            count: 2
        }
    );


    // Hospital medicine
    await request(
        "POST",
        "/hospitals/medicine",
        {
            hospitalId: "H001",
            medicine: "blood-thinner",
            available: true
        }
    );


    // Ambulance
    await request(
        "POST",
        "/ambulances/status",
        {
            ambulanceId: "AMB001",
            status: "available"
        }
    );


    // Decision log
    await request(
        "GET",
        "/decisions"
    );


    console.log(
        "\n================================"
    );

    console.log(
        "       API TEST COMPLETE"
    );

    console.log(
        "================================"
    );
}


run().catch(error => {
    console.error(
        "\nAPI TEST FAILED"
    );

    console.error(error);

    process.exit(1);
});