import React, { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: number;
  data: string;
}

interface DebugConsoleProps {
  sensorData: any | null;
  maxEntries?: number;
}

export function DebugConsole({ sensorData, maxEntries = 50 }: DebugConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (sensorData) {
      setLogs(prev => {
        const newLogs = [...prev, {
          timestamp: Date.now(),
          data: JSON.stringify(sensorData, null, 2)
        }];
        return newLogs.slice(-maxEntries);
      });
    }
  }, [sensorData, maxEntries]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`fixed right-4 ${isExpanded ? 'top-32' : 'bottom-4'} w-96 bg-black/90 rounded-lg overflow-hidden transition-all duration-300 ease-in-out`}>
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-white font-mono text-sm">HyperIMU Debug Console</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
          >
            {isExpanded ? 'Minimize' : 'Expand'}
          </button>
        </div>
      </div>
      <div
        ref={consoleRef}
        className={`overflow-y-auto font-mono text-xs ${isExpanded ? 'h-[calc(100vh-12rem)]' : 'h-48'}`}
      >
        {logs.map((log, index) => (
          <div key={index} className="border-b border-gray-800 p-2">
            <div className="text-gray-500">
              {new Date(log.timestamp).toISOString()}
            </div>
            <pre className="text-green-400 mt-1 whitespace-pre-wrap">
              {log.data}
            </pre>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500 p-4 text-center">
            Waiting for sensor data...
          </div>
        )}
      </div>
    </div>
  );
}