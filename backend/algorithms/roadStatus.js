class RoadStatus {
    constructor() {
        this.closedRoads = new Set();
    }

    closeRoad(from, to) {
        this.closedRoads.add(`${from}->${to}`);
    }

    openRoad(from, to) {
        this.closedRoads.delete(`${from}->${to}`);
    }

    isClosed(from, to) {
        return this.closedRoads.has(`${from}->${to}`);
    }

    getClosedRoads() {
        return new Set(this.closedRoads);
    }
}

module.exports = RoadStatus;