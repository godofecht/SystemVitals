const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const WebSocket = require('ws');

const app = express();
const port = 3001;
const wss = new WebSocket.Server({ port: 8080 });

app.use(cors());
app.use(express.json());

// Cache for metrics
let metrics = {
  timestamp: Date.now(),
  cpu: 0,
  memory: 0,
  temperature: 0,
  gpu: 0,
  networkIn: 0,
  networkOut: 0,
  networkInterface: '',
  networkSpeed: 0
};

// Fast metrics update (CPU, Memory, Network) - Every 100ms
async function updateFastMetrics() {
  try {
    const [currentLoad, mem, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats()
    ]);

    // Just use the first network interface's stats directly
    metrics = {
      ...metrics,
      timestamp: Date.now(),
      cpu: parseFloat(currentLoad.currentLoad.toFixed(1)),
      memory: parseFloat((100 * mem.active / mem.total).toFixed(1)),
      networkIn: parseFloat((networkStats[0]?.rx_sec / 1024 / 1024).toFixed(2)),  // Back to rx_sec
      networkOut: parseFloat((networkStats[0]?.tx_sec / 1024 / 1024).toFixed(2)), // Back to tx_sec
      networkInterface: networkStats[0]?.iface || 'unknown'
    };

  } catch (error) {
    console.error('Error updating fast metrics:', error);
  }
}

// Slow metrics update (Temperature, GPU) - Every 2 seconds
async function updateSlowMetrics() {
  try {
    const [temp, gpu] = await Promise.all([
      si.cpuTemperature(),
      si.graphics()
    ]);
    
    metrics = {
      ...metrics,
      temperature: parseFloat((temp.main || temp.max || 0).toFixed(1)),
      gpu: parseFloat((gpu.controllers[0]?.memoryUsed || 0).toFixed(1))
    };
  } catch (error) {
    console.error('Error updating slow metrics:', error);
  }
}

// Set up update intervals
setInterval(updateFastMetrics, 100);  // 10 times per second
setInterval(updateSlowMetrics, 2000); // Every 2 seconds

// Broadcast metrics to all connected clients
function broadcast() {
  if (wss.clients.size > 0) {
    const data = JSON.stringify(metrics);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

// Broadcast metrics every 100ms
setInterval(broadcast, 100);

wss.on('connection', async (ws) => {
  console.log('Client connected');
  // Send initial data immediately
  ws.send(JSON.stringify(metrics));
});

app.listen(port, () => {
  console.log('Backend running on port', port);
}); 