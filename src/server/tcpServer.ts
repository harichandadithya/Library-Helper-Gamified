import net from 'net';
import { WebSocketServer, WebSocket } from 'ws';

const BASE_TCP_PORT = 5556; // Changed from 5555 to 5556
let WS_PORT = 8080; // Initial WebSocket port

function startWebSocketServer(port: number): Promise<WebSocketServer> {
  return new Promise((resolve, reject) => {
    try {
      const wss = new WebSocketServer({ port }, () => {
        console.log(`WebSocket server running on port ${port}`);
        resolve(wss);
      });

      wss.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} in use, trying ${port + 1}...`);
          resolve(startWebSocketServer(port + 1));
        } else {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Store connected WebSocket clients
const clients = new Set<WebSocket>();

function startTCPServer(port: number): Promise<net.Server> {
  return new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      console.log('HyperIMU connected from:', socket.remoteAddress);

      let buffer = '';

      socket.on('data', (data) => {
        // Log raw data immediately
        console.log('Raw incoming data:', data.toString());
        
        buffer += data.toString();

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the incomplete line in the buffer

        for (const line of lines) {
          try {
            console.log('Processing line:', line.trim());
            // Parse the sensor data
            const sensorData = parseSensorData(line.trim());
            console.log('Parsed sensor data:', JSON.stringify(sensorData, null, 2));
            
            // Broadcast to all connected WebSocket clients
            const message = JSON.stringify(sensorData);
            for (const client of clients) {
              client.send(message);
            }
          } catch (error) {
            console.error('Error parsing line:', line);
            console.error('Parse error:', error);
          }
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('close', () => {
        console.log('HyperIMU disconnected');
      });
    });

    server.listen(port, () => {
      console.log(`TCP server running on fixed port ${port}`);
      resolve(server);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`TCP Port ${port} is already in use`);
        process.exit(1); // Exit if we can't use our fixed port
      } else {
        reject(error);
      }
    });
  });
}

async function init() {
  try {
    // Start TCP server first
    const tcpServer = await startTCPServer(BASE_TCP_PORT);
    const tcpPort = (tcpServer.address() as net.AddressInfo).port;
    console.log(`TCP server active on port ${tcpPort}`);

    // Start WebSocket server
    const wss = await startWebSocketServer(WS_PORT);
    
    wss.on('connection', (ws) => {
      console.log('Web client connected');
      clients.add(ws);

      // Immediately send TCP port info
      const portInfo = JSON.stringify({ 
        type: 'port_info', 
        tcpPort,
        status: 'ready'
      });
      console.log('Sending port info to client:', portInfo);
      ws.send(portInfo);

      ws.on('close', () => {
        console.log('Web client disconnected');
        clients.delete(ws);
      });
    });

  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

init().catch(console.error);

// Parse the sensor data from HyperIMU
function parseSensorData(data: string) {
  if (!data) throw new Error('Empty data received');
  
  const values = data.split(',').map(Number);
  console.log('Raw values:', values); // Debug log
  
  if (values.length < 7) throw new Error(`Invalid data format: ${data}`);

  // Note: HyperIMU sends data in this order: timestamp, gyro_x, gyro_y, gyro_z, acc_x, acc_y, acc_z
  const [timestamp, gyro_x, gyro_y, gyro_z, acc_x, acc_y, acc_z] = values;

  // Direct pass-through of sensor data without thresholds
  const sensorData = {
    accelerometer: { x: acc_x, y: acc_y, z: acc_z },
    gyroscope: { x: gyro_x, y: gyro_y, z: gyro_z },
    timestamp
  };

  console.log('Sending sensor data:', sensorData); // Debug log
  return sensorData;
}