import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { LibraryScene } from './components/LibraryScene';
import { HUD } from './components/HUD';
import { PlayerCamera } from './components/PlayerCamera';
import { SensorConnection } from './services/SensorConnection';
import { useGameStore } from './store/gameStore';
import { SensorData } from './types/game';
import { DebugConsole } from './components/DebugConsole';
import { audioService } from './services/audioService';

function App() {
  const [sensorConnection, setSensorConnection] = useState<SensorConnection | null>(null);
  const [lastSensorData, setLastSensorData] = useState<SensorData | null>(null);
  const [phoneIp, setPhoneIp] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [useSecure, setUseSecure] = useState(window.location.protocol === 'https:');
  const [showDebug, setShowDebug] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [showConnectionPanel, setShowConnectionPanel] = useState(true);
  const [sensitivity, setSensitivity] = useState(0.5); // Changed default to 0.5
  const [tcpPort, setTcpPort] = useState<number | null>(null);
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const [volume, setVolume] = useState(() => audioService.getVolume());

  useEffect(() => {
    const connection = new SensorConnection(8080, false, useMockData);
    setSensorConnection(connection);
    
    connection.onData((data: any) => {
      // Log every piece of data received
      console.log('App received raw data:', data);
      
      if (data.type === 'port_info') {
        setTcpPort(5556);
        return;
      }

      // Ensure we have valid sensor data
      if (data.gyroscope && data.accelerometer) {
        const sensorData = {
          gyroscope: {
            x: data.gyroscope.x * sensitivity,
            y: data.gyroscope.y * sensitivity,
            z: data.gyroscope.z * sensitivity
          },
          accelerometer: {
            x: data.accelerometer.x,
            y: data.accelerometer.y,
            z: data.accelerometer.z
          },
          timestamp: data.timestamp
        };

        console.log('Setting sensor data:', sensorData);
        setLastSensorData(sensorData);
      } else {
        console.warn('Invalid sensor data received:', data);
      }
    });

    connection.connect();
    return () => connection.disconnect();
  }, [useMockData, sensitivity]);

  // Debug render updates
  useEffect(() => {
    console.log('SensorData state updated:', lastSensorData);
  }, [lastSensorData]);

  // Add keyboard listener for debug panel toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '`') { // Toggle debug with backtick key
        setDebugPanelVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleConnect = () => {
    if (!sensorConnection || !phoneIp) return;
    setIsConnecting(true);
    sensorConnection.retry(phoneIp);
    setTimeout(() => setIsConnecting(false), 2000);
  };

  // Add volume change handler
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioService.setVolume(newVolume);
  };

  return (
    <div className="w-full h-screen">
      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute w-4 h-px bg-white"></div>
          <div className="absolute w-px h-4 bg-white"></div>
        </div>
      </div>

      <Canvas 
        shadows 
        camera={{ fov: 75, position: [0, 2, 8] }}
      >
        <LibraryScene 
          sensorData={lastSensorData} 
          sensitivity={sensitivity} 
        />
      </Canvas>

      <HUD />
      
      {/* Connection panel */}
      <div className="absolute top-4 left-4"> {/* Changed to left-4 */}
        <button
          onClick={() => setShowConnectionPanel(!showConnectionPanel)}
          className="w-full mb-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center justify-between"
        >
          <span>Sensitivity</span>
          <span>{showConnectionPanel ? '▼' : '▶'}</span>
        </button>
        
        {showConnectionPanel && (
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col gap-2">
              {tcpPort && (
                <div className="text-sm font-medium text-gray-600">
                  TCP Port: {tcpPort} (Use this in HyperIMU app)
                </div>
              )}
                            
              {/* Sensitivity Slider */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Movement Sensitivity: {sensitivity.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"  // Reduced max value from 2.0 to 1.0
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Add Volume Slider after Sensitivity Slider */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Sound Volume: {(volume * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useMockData}
                    onChange={(e) => setUseMockData(e.target.checked)}
                    className="rounded"
                  />
                  Use Mock Data
                </label>
              </div>

              
            </div>
            
            
          </div>
        )}
      </div>
      
      {/* Sensor Debug Panel */}
      {debugPanelVisible && (
        <div className="fixed top-0 right-0 w-96 h-screen bg-black/90 text-white p-4 overflow-y-auto font-mono text-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Debug Console</h3>
            
          </div>

          {showDebug && (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="p-2 bg-gray-800 rounded">
                <div className="font-bold mb-1">Connection</div>
                <div>WebSocket Port: 8080</div>
                <div>TCP Port: {tcpPort || 'Not connected'}</div>
                <div>Status: {sensorConnection ? 'Connected' : 'Disconnected'}</div>
              </div>

              {/* Latest Sensor Data */}
              {lastSensorData && (
                <div className="p-2 bg-gray-800 rounded">
                  <div className="font-bold mb-1">Gyroscope</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>X: {lastSensorData.gyroscope.x.toFixed(3)}</div>
                    <div>Y: {lastSensorData.gyroscope.y.toFixed(3)}</div>
                    <div>Z: {lastSensorData.gyroscope.z.toFixed(3)}</div>
                  </div>
                  
                  <div className="font-bold mt-2 mb-1">Accelerometer</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>X: {lastSensorData.accelerometer.x.toFixed(3)}</div>
                    <div>Y: {lastSensorData.accelerometer.y.toFixed(3)}</div>
                    <div>Z: {lastSensorData.accelerometer.z.toFixed(3)}</div>
                  </div>

                  <div className="mt-2">
                    <div className="font-bold mb-1">Movement</div>
                    <div>Direction: {lastSensorData.movement?.direction || 'none'}</div>
                    <div>Intensity: {lastSensorData.movement?.intensity.toFixed(3) || '0'}</div>
                  </div>
                </div>
              )}

              {/* Game State */}
              <div className="p-2 bg-gray-800 rounded">
                <div className="font-bold mb-1">Game State</div>
                <div>Current View: {useGameStore.getState().movementState.currentPoint}</div>
                <div>Moving: {useGameStore.getState().movementState.isMoving ? 'Yes' : 'No'}</div>
                <div>Held Book: {useGameStore.getState().heldBook?.id || 'None'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug Toggle Indicator */}
      <div className="fixed top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
        Press ` to toggle debug panel
      </div>
    </div>
  );
}

export default App;