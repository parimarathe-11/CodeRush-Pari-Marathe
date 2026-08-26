const graph = {
    V001: [
        { node: "V002", weight: 8 },
        { node: "V003", weight: 12 }
    ],

    V002: [
        { node: "V001", weight: 8 },
        { node: "V003", weight: 5 },
        { node: "V004", weight: 10 }
    ],

    V003: [
        { node: "V001", weight: 12 },
        { node: "V002", weight: 5 },
        { node: "V004", weight: 6 },
        { node: "V005", weight: 14 }
    ],

    V004: [
        { node: "V002", weight: 10 },
        { node: "V003", weight: 6 },
        { node: "V005", weight: 7 },
        { node: "V006", weight: 9 }
    ],

    V005: [
        { node: "V003", weight: 14 },
        { node: "V004", weight: 7 },
        { node: "V006", weight: 4 }
    ],

    V006: [
        { node: "V004", weight: 9 },
        { node: "V005", weight: 4 }
    ]
};

const villages = [
    {
        id: "VILLAGE001",
        name: "Rampur",
        nodeId: "V001"
    },
    {
        id: "VILLAGE002",
        name: "Devgaon",
        nodeId: "V002"
    },
    {
        id: "VILLAGE003",
        name: "Lakshmipur",
        nodeId: "V003"
    },
    {
        id: "VILLAGE004",
        name: "Shivapur",
        nodeId: "V004"
    },
    {
        id: "VILLAGE005",
        name: "Nandgaon",
        nodeId: "V005"
    },
    {
        id: "VILLAGE006",
        name: "Kheda",
        nodeId: "V006"
    }
];

const hospitals = [
    {
        id: "H001",
        name: "Rampur Rural Hospital",
        nodeId: "V003",

        specialists: [
            "general",
            "cardiology",
            "trauma"
        ],

        beds: {
            general: 10,
            ICU: 2
        },

        medicines: [
            "antibiotics",
            "insulin",
            "blood-thinner",
            "painkillers"
        ],

        waitTime: 8,
        available: true
    },

    {
        id: "H002",
        name: "District Hospital",
        nodeId: "V005",

        specialists: [
            "general",
            "orthopedic",
            "trauma"
        ],

        beds: {
            general: 20,
            ICU: 4
        },

        medicines: [
            "antibiotics",
            "insulin",
            "painkillers"
        ],

        waitTime: 4,
        available: true
    },

    {
        id: "H003",
        name: "Community Health Center",
        nodeId: "V006",

        specialists: [
            "general",
            "pediatric"
        ],

        beds: {
            general: 8,
            ICU: 1
        },

        medicines: [
            "antibiotics",
            "painkillers"
        ],

        waitTime: 2,
        available: true
    }
];

const ambulances = [
    {
        id: "AMB001",
        nodeId: "V001",
        status: "available",
        type: "basic",
        equipment: [
            "oxygen",
            "first-aid"
        ]
    },

    {
        id: "AMB002",
        nodeId: "V002",
        status: "available",
        type: "advanced",
        equipment: [
            "oxygen",
            "ventilator",
            "first-aid"
        ]
    },

    {
        id: "AMB003",
        nodeId: "V004",
        status: "busy",
        type: "advanced",
        equipment: [
            "oxygen",
            "ventilator",
            "first-aid"
        ]
    }
];

const emergencies = [];

module.exports = {
    graph,
    villages,
    hospitals,
    ambulances,
    emergencies
};