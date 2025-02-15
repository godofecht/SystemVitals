// Add this check at the top
const isClient = typeof window !== 'undefined';

// Initialize variables only on client
let networkIn = 0;
let networkOut = 0;
let gpuUsage = 0;

// Track network performance
let lastTotalBytes = 0;
let lastTimestamp = performance.now();

// Only run this code on client
if (isClient) {
  // Network monitoring setup
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries() as PerformanceResourceTiming[];
    const currentTime = performance.now();
    
    let totalBytes = 0;
    entries.forEach(entry => {
      // Sum up transfer size, encoded body size, and decoded body size
      totalBytes += entry.transferSize || 0;
      totalBytes += entry.encodedBodySize || 0;
      totalBytes += entry.decodedBodySize || 0;
    });

    // Calculate speed in MB/s
    const timeDiff = (currentTime - lastTimestamp) / 1000; // Convert to seconds
    if (timeDiff > 0 && totalBytes > lastTotalBytes) {
      const bytesDiff = totalBytes - lastTotalBytes;
      networkIn = (bytesDiff / timeDiff) / (1024 * 1024); // Convert to MB/s
      networkOut = networkIn * 0.2; // Estimate upload as 20% of download
      
      console.log('Network Performance:', {
        bytes: bytesDiff,
        time: timeDiff,
        speed: networkIn
      });
    }

    lastTotalBytes = totalBytes;
    lastTimestamp = currentTime;
  });

  observer.observe({ 
    entryTypes: ['resource', 'navigation'],
    buffered: true
  });

  // Create WebGL context
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');

  // Set up intervals
  setInterval(generateTraffic, 1000);
  setInterval(measureNetworkSpeed, 1000);
  setInterval(() => {
    gpuUsage = measureGPU();
  }, 1000);
}

// Generate some network traffic periodically
function generateTraffic() {
  // Fetch a random image to generate measurable traffic
  const img = new Image();
  img.src = `https://picsum.photos/200/300?random=${Math.random()}`;
}

// List of APIs to test network speed
const TEST_URLS = [
  'https://api.github.com/zen',
  'https://api.ipify.org?format=json',
  'https://httpbin.org/get',
  'https://jsonplaceholder.typicode.com/todos/1'
];

// Network speed test function
async function measureNetworkSpeed() {
  const startTime = performance.now();
  try {
    // Make multiple concurrent requests
    const promises = TEST_URLS.map(url => 
      fetch(url + '?nocache=' + Math.random())
    );

    const responses = await Promise.all(promises);
    const data = await Promise.all(responses.map(r => r.text()));
    const endTime = performance.now();
    
    // Calculate total size (including headers)
    const totalSize = responses.reduce((sum, response) => {
      // Get response size from headers or content
      const size = parseInt(response.headers.get('content-length') || '0');
      return sum + size;
    }, 0);

    const duration = (endTime - startTime) / 1000; // seconds
    const size = totalSize / (1024 * 1024); // MB
    
    networkIn = size / duration; // MB/s
    networkOut = size * 0.1 / duration; // Estimate upload

    console.log('Network measurement:', {
      size: totalSize,
      duration,
      speed: networkIn
    });

  } catch (error) {
    console.error('Network measurement error:', error);
  }
}

// GPU monitoring
let gpuUsage = 0;

// GPU stress test and measurement
function measureGPU() {
  if (!gl) return 0;

  const startTime = performance.now();
  
  // Create a complex scene
  const vertices = new Float32Array(300000); // Large number of vertices
  for (let i = 0; i < vertices.length; i++) {
    vertices[i] = Math.sin(i) * Math.cos(i);
  }

  // Create buffer and load vertices
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Simple vertex shader
  const vsSource = `
    attribute vec4 position;
    void main() {
      gl_Position = position;
    }
  `;

  // Fragment shader with complex calculations
  const fsSource = `
    precision mediump float;
    void main() {
      float x = gl_FragCoord.x;
      float y = gl_FragCoord.y;
      float r = sin(x * 0.01) * cos(y * 0.01);
      float g = cos(x * 0.02) * sin(y * 0.02);
      float b = sin((x + y) * 0.03);
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `;

  // Create and compile shaders
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader!, vsSource);
  gl.shaderSource(fragmentShader!, fsSource);
  gl.compileShader(vertexShader!);
  gl.compileShader(fragmentShader!);

  // Create program and link shaders
  const program = gl.createProgram();
  gl.attachShader(program!, vertexShader!);
  gl.attachShader(program!, fragmentShader!);
  gl.linkProgram(program!);
  gl.useProgram(program!);

  // Render
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
  gl.finish();

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Calculate usage based on how long the GPU operations took
  // Longer duration = higher GPU usage
  const maxExpectedDuration = 16.67; // 60fps = 16.67ms per frame
  const usage = Math.min((duration / maxExpectedDuration) * 100, 100);

  return usage;
}

// Export metrics function with client-side checks
export async function getMetrics() {
  if (!isClient) {
    return {
      timestamp: Date.now(),
      cpu: 0,
      memory: 0,
      gpu: 0,
      networkIn: 0,
      networkOut: 0,
      networkInterface: 'unknown',
      networkSpeed: 0,
    };
  }

  const cpuUsage = await getCPUUsage();
  const memory = (performance as any).memory;
  const memoryUsage = memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0;
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';
  const rtt = connection?.rtt || 0;
  
  return {
    timestamp: Date.now(),
    cpu: cpuUsage,
    memory: Math.min(memoryUsage, 100),
    gpu: parseFloat(gpuUsage.toFixed(1)),
    networkIn: parseFloat((networkIn || 0).toFixed(2)),
    networkOut: parseFloat((networkOut || 0).toFixed(2)),
    networkInterface: `${effectiveType} (${rtt}ms)`,
    networkSpeed: connection?.downlink || 0,
  };
}

// CPU usage estimation
let lastCPUTime = performance.now();
let lastCPUUsage = 0;

async function getCPUUsage() {
  const currentTime = performance.now();
  const timeDiff = currentTime - lastCPUTime;
  
  // Run a heavy calculation to measure CPU load
  const startTime = performance.now();
  let sum = 0;
  for(let i = 0; i < 1000000; i++) {
    sum += Math.sqrt(i);
  }
  const endTime = performance.now();
  
  const usage = ((endTime - startTime) / timeDiff) * 100;
  lastCPUTime = currentTime;
  lastCPUUsage = usage;
  
  return Math.min(usage, 100);
} 