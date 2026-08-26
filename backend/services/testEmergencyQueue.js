const EmergencyQueue =
    require("./emergencyQueue");

const queue =
    new EmergencyQueue();

console.log("================================");
console.log("   EMERGENCY PRIORITY TEST");
console.log("================================");


queue.add({
    id: "E001",
    severity: "normal"
});

queue.add({
    id: "E002",
    severity: "critical"
});

queue.add({
    id: "E003",
    severity: "urgent"
});

queue.add({
    id: "E004",
    severity: "critical"
});

queue.add({
    id: "E005",
    severity: "normal"
});


console.log("\nDispatch order:\n");


const order = [];

while (!queue.isEmpty()) {
    const item = queue.next();

    order.push(
        item.value.severity
    );

    console.log(
        item.value.id,
        "->",
        item.value.severity,
        "priority:",
        item.priority
    );
}


console.log("\nPriority order:");
console.log(order);


const criticalBeforeUrgent =
    order.indexOf("critical") <
    order.indexOf("urgent");

const urgentBeforeNormal =
    order.indexOf("urgent") <
    order.indexOf("normal");


if (
    criticalBeforeUrgent &&
    urgentBeforeNormal
) {
    console.log(
        "\nPASS — Priority ordering correct"
    );
} else {
    console.log("\nFAIL");
}