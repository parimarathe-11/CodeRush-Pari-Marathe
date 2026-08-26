# ARTERY — Rural Healthcare Dispatch Console

ARTERY is an enterprise-grade, real-time emergency routing and resource allocation dashboard designed to optimize patient dispatch in rural road networks. It ensures that patients are directed to the most optimal hospital based on travel time, hospital capacity, specialist availability, medicine stock, and road closures.

---

## 🚀 Key Features
* **Custom SVG Network Map**: An interactive, zoomable, and pannable GIS-like visualization of the village road network, complete with active route lines connecting directly to hospital targets.
* **Intelligent Dispatch Pipeline**: Evaluates multiple dimensions (distance, wait times, specialists, ICU/General beds, and medicine stock) rather than simply selecting the nearest location.
* **Dynamic Road Disruption**: Real-time road closures trigger immediate shortest-path recalculation and path redirection.
* **Dynamic Priority Queue**: Automatically bubbles up `CRITICAL` and `URGENT` requests above `NORMAL` ones.
* **On-Demand Performance Benchmark**: Measures Dijkstra search times on a programmatically generated graph of **50,000 nodes and 200,000 edges** in real time directly from the dashboard.

---

## 🛠️ Architecture & Tech Stack

### Third-Party Libraries & APIs
* **Express**: Web application framework for Node.js used to expose REST API endpoints.
* **Cors**: Cross-origin resource sharing middleware used to connect the frontend client to backend services.
* *Note: No external third-party maps or search APIs are used, ensuring the application remains completely self-contained.*

### Algorithms & Core Logic (Implemented from Scratch)
* **Binary Min-Heap**: Custom implementation (`priorityQueue.js`) used for Dijkstra node extraction and priority sorting in the emergency queue.
  * *Complexity*: `insert` and `extractMin` run in $O(\log V)$ time.
* **Dijkstra's Algorithm**: Custom shortest-path calculation (`dijkstra.js`) supporting edge-exclusion for road closures.
  * *Complexity*: Runs in $O((V + E) \log V)$ time.
* **Intelligent Cost Allocation**: Custom multi-factor cost evaluation formula.
  * *Formula*: $\text{Total Cost} = \text{Travel Time} + \text{Hospital Wait Time}$.

---

## 💻 Setup & Run Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher recommended) installed.

### 1. Run the Backend API Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *The server will start running on `http://localhost:3000`.*

### 2. Run the Frontend Console
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Simply double-click the `index.html` file to open it directly in your web browser.
3. *Alternative (Recommended)*: Serve the frontend using a local HTTP server or VS Code's **Live Server** extension:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your web browser.

---

## 🧪 Testing & Verification
The project includes a robust test runner (`runTests.js`) that validates all core routing, queueing, and edge cases.

To run the automated tests:
```bash
cd backend
node runTests.js
```

### Verified Test Cases:
1. **Dijkstra Correctness**: Verifies shortest path distance and node traversal path calculations.
2. **Priority Queue Ordering**: Ensures min-heap extracts the smallest distance node.
3. **Critical Beats Normal**: Verifies that emergencies are correctly sorted by urgency.
4. **Specialist Rejection**: Verifies hospitals lacking the requested specialist are rejected.
5. **Bed Rejection**: Verifies hospitals with zero general/ICU bed capacity are rejected.
6. **Medicine Rejection**: Verifies hospitals lacking requested medications are rejected.
7. **Ambulance Unavailable**: Confirms dispatches queue gracefully if no ambulance is free.
8. **Road Closure**: Verifies dynamic path exclusion when a road is marked closed.
9. **Rerouting**: Verifies Dijkstra finds alternative routes when graph edges are disrupted.
10. **Large Graph Benchmark**: Benchmarks Dijkstra efficiency on a 50,000-node graph.

---

## 📊 System Benchmarks
* **Nodes**: 50,000
* **Edges**: 200,000
* **Algorithm**: Dijkstra's Algorithm
* **Queue**: Binary Min-Heap
* **Average Execution Time**: **~1.3 seconds** (processed locally and reported on-demand).

---

## 📝 Mandatory AI & Resource Disclosure
In compliance with the hackathon rules, we declare the following:

1. **AI Assistant Disclosure**:
   * We utilized the **ChatGPT** AI coding assistant to refine the dashboard layout, design CSS styles, configure routing middleware (`vercel.json`), and build automated verification scripts.
2. **Core Implementation Integrity**:
   * The **core routing engine, min-heap priority queue structure, Dijkstra's algorithm, cost function, and resource constraint evaluations** were coded and implemented from scratch by the developer. No pre-existing routing or resource allocation packages were used.
