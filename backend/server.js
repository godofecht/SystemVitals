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
  gpuTemp: 0,
  gpuMemoryTotal: 0,
  gpuMemoryUsed: 0,
  gpuUtilization: 0,
  networkIn: 0,
  networkOut: 0,
  networkInterface: '',
  networkSpeed: 0
};

// Get default network interface
let defaultInterface = '';
si.networkInterfaceDefault().then(iface => {
  defaultInterface = iface;
  console.log('Default network interface:', iface);
});

// Fast metrics update (CPU, Memory, Network) - Every 100ms
async function updateFastMetrics() {
  try {
    const [currentLoad, mem, networkConnections] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkConnections()
    ]);

    // Get network stats specifically for the default interface
    const networkStats = await si.networkStats(defaultInterface);
    console.log('Network stats:', networkStats);

    metrics = {
      ...metrics,
      timestamp: Date.now(),
      cpu: parseFloat(currentLoad.currentLoad.toFixed(1)),
      memory: parseFloat((100 * mem.active / mem.total).toFixed(1)),
      networkIn: parseFloat(((networkStats[0]?.rx_sec || 0) / 1024 / 1024).toFixed(2)),
      networkOut: parseFloat(((networkStats[0]?.tx_sec || 0) / 1024 / 1024).toFixed(2)),
      networkInterface: defaultInterface,
      networkSpeed: networkStats[0]?.speed || 0
    };

  } catch (error) {
    console.error('Error updating fast metrics:', error);
  }
}

// Slow metrics update (Temperature, GPU) - Every 2 seconds
async function updateSlowMetrics() {
  try {
    const [temp, gpuData] = await Promise.all([
      si.cpuTemperature(),
      si.graphics()
    ]);

    // Log full GPU data for debugging
    console.log('GPU Data:', JSON.stringify(gpuData, null, 2));
    
    const gpu = gpuData.controllers[0]; // Get primary GPU
    
    metrics = {
      ...metrics,
      temperature: parseFloat((temp.main || temp.max || 0).toFixed(1)),
      gpu: parseFloat((gpu?.utilizationGpu || 0).toFixed(1)), // GPU usage percentage
      gpuTemp: parseFloat((gpu?.temperatureGpu || 0).toFixed(1)),
      gpuMemoryTotal: parseFloat((gpu?.memoryTotal || 0).toFixed(1)),
      gpuMemoryUsed: parseFloat((gpu?.memoryUsed || 0).toFixed(1)),
      gpuUtilization: parseFloat((gpu?.utilizationGpu || 0).toFixed(1))
    };

    // Log GPU metrics
    console.log('GPU Metrics:', {
      usage: metrics.gpu,
      temp: metrics.gpuTemp,
      memTotal: metrics.gpuMemoryTotal,
      memUsed: metrics.gpuMemoryUsed,
      util: metrics.gpuUtilization
    });

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