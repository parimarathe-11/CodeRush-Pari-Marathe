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
* **Frontend**: Vanilla JavaScript (ES6+), CSS3 (Slate/Indigo custom dashboard theme), HTML5, and custom SVG path rendering.
* **Backend**: Node.js, Express API server.
* **Algorithms (Implemented from Scratch)**:
  * **Binary Min-Heap**: Custom implementation (`priorityQueue.js`) used for Dijkstra node extraction and priority sorting in the emergency queue.
  * **Dijkstra's Algorithm**: Custom shortest-path calculation (`dijkstra.js`) supporting edge-exclusion for road closures.
  * **Intelligent Cost Allocation**: Custom multi-factor cost evaluation formula (`Travel Time + Hospital Wait Time`).

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
   * We utilized the **Antigravity** AI coding assistant to refine the dashboard layout, design CSS styles, configure routing middleware (`vercel.json`), and build automated verification scripts.
2. **Core Implementation Integrity**:
   * The **core routing engine, min-heap priority queue structure, Dijkstra's algorithm, cost function, and resource constraint evaluations** were coded and implemented from scratch by the developer. No pre-existing routing or resource allocation packages were used.
