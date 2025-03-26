export class SensorConnection {
  private ws: WebSocket | null = null;
  private onDataCallback: ((data: any) => void) | null = null;
  private mockInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private port: number = 8080, private useSecure: boolean = false, private useMockData: boolean = false) {}

  connect(hostId?: string) {
    if (this.useMockData) {
      console.log('Using mock data...');
      this.startMockDataStream();
      return;
    }

    try {
      const wsUrl = 'ws://localhost:8080';
      console.log('Connecting to:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection OPEN');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const rawData = event.data;
          console.log('Raw WebSocket data received:', rawData);
          
          const data = JSON.parse(rawData);
          console.log('Parsed WebSocket data:', data);

          // Handle port info message
          if (data.type === 'port_info') {
            console.log('TCP Port received:', data.tcpPort);
            if (this.onDataCallback) {
              this.onDataCallback({ type: 'port_info', tcpPort: 5556 });
            }
            return;
          }

          // Add mock movement for debugging
          if (!data.movement) {
            data.movement = {
              direction: 'none',
              intensity: Math.max(Math.abs(data.gyroscope.x), Math.abs(data.gyroscope.y))
            };
          }

          if (this.onDataCallback) {
            this.onDataCallback(data);
          }
        } catch (error) {
          console.error('WebSocket data error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
          setTimeout(() => this.connect(hostId), 1000);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from sensor data server');
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
          setTimeout(() => this.connect(hostId), 1000);
        }
      };
    } catch (error) {
      console.error('Connection error:', error);
    }
  }

  private startMockDataStream() {
    if (this.mockInterval) clearInterval(this.mockInterval);
    
    let angle = 0;
    this.mockInterval = setInterval(() => {
      if (this.onDataCallback) {
        // Generate more realistic mock data
        const mockData = {
          accelerometer: {
            x: Math.sin(angle) * 0.2,
            y: Math.cos(angle) * 0.2,
            z: 9.81
          },
          gyroscope: {
            x: Math.sin(angle) * 5,  // Larger range for testing
            y: Math.cos(angle) * 5,
            z: 0
          },
          timestamp: Date.now()
        };
        
        angle += 0.02; // Slow oscillation
        this.onDataCallback(mockData);
      }
    }, 1000 / 60);
  }

  onData(callback: (data: any) => void) {
    this.onDataCallback = callback;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  retry(hostId?: string) {
    this.disconnect();
    this.connect(hostId);
  }
}