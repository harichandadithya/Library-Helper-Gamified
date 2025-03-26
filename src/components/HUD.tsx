import React from 'react';
import { useGameStore } from '../store/gameStore';

export function HUD() {
  const { 
    currentTask, 
    therapeuticMetrics,
    stabilityThreshold,
    score,
    taskHistory,
    level,
    progressToNextLevel,
    tables // Add tables to destructured values
  } = useGameStore();

  // Get levels array from game store
  const levels = useGameStore((state) => state.levels);
  
  // Get current level data
  const currentLevel = levels?.find(l => l.id === level);
  const isLevelComplete = !currentTask && taskHistory.length > 0;

  // Fixed task completion check
  const isTaskProperlyCompleted = React.useMemo(() => {
    if (!isLevelComplete || !currentLevel) return false;
    
    const lastTask = taskHistory[taskHistory.length - 1];
    if (!lastTask) return false;

    const allBooksPlacedCorrectly = tables.every(table => { // Use tables from store
      if (lastTask.targetTable === 'all') return true;
      if (lastTask.targetTable === table.id) {
        return table.books.some(book => book.id === lastTask.requiresBook);
      }
      return true;
    });

    return allBooksPlacedCorrectly;
  }, [isLevelComplete, currentLevel, taskHistory, tables]); // Add tables as dependency

  return (
    <div className="absolute top-4 left-4 p-4 bg-black/50 text-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold">Score: {score}</div>
        <div className="text-sm">Level {level}</div>
      </div>
      
      {/* Task Progress */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Current Task:</h3>
        {currentTask ? (
          <div>
            <p className="text-sm mb-2">{currentTask.instruction}</p>
            <div className="h-1 bg-gray-700 rounded">
              <div 
                className="h-full bg-green-500 rounded transition-all"
                style={{ width: `${therapeuticMetrics.sequenceAccuracy * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">All tasks completed!</p>
        )}
      </div>

      {/* Therapeutic Metrics */}
      <div className="space-y-2">
        <div>
          <div className="text-sm mb-1 flex justify-between">
            <span>Stability</span>
            <span>{(therapeuticMetrics.stabilityScore * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div 
              className={`h-full transition-all ${
                therapeuticMetrics.stabilityScore >= stabilityThreshold 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${therapeuticMetrics.stabilityScore * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="text-sm mb-1 flex justify-between">
            <span>Precision</span>
            <span>{(therapeuticMetrics.precisionScore * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${therapeuticMetrics.precisionScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task History */}
      <div className="mt-4 text-xs">
        <h4 className="font-bold mb-1">Completed Tasks: {taskHistory.length}</h4>
        <div className="max-h-24 overflow-y-auto">
          {taskHistory.slice(-3).map((task, i) => (
            <div key={i} className="text-gray-400 mb-1">✓ {task.instruction}</div>
          ))}
        </div>
      </div>

      {/* Level Timer */}
      {currentLevel?.timeLimit && (
        <LevelTimer timeLimit={currentLevel.timeLimit} />
      )}

      {/* Level Complete Message */}
      {isLevelComplete && isTaskProperlyCompleted && (
        <div className="mt-4 p-2 bg-green-500/50 rounded">
          <h4 className="font-bold">Level Complete!</h4>
          <p className="text-sm">
            {level < levels.length ? "Next level unlocked!" : "Congratulations! You've completed all levels!"}
          </p>
          {level < levels.length && (
            <button
              onClick={progressToNextLevel}
              className="mt-2 px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
            >
              Start Next Level
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LevelTimer({ timeLimit }: { timeLimit: number }) {
  const [timeLeft, setTimeLeft] = React.useState(timeLimit);
  const level = useGameStore(state => state.level); // Add level from store
  
  // Reset timer when timeLimit or level changes
  React.useEffect(() => {
    setTimeLeft(timeLimit);
    
    if (timeLimit <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, level]); // Add level as dependency

  if (!timeLimit) return null;

  return (
    <div className="text-sm mb-2">
      <span className={`font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
        Time Left: {timeLeft}s
      </span>
      <div className="h-1 bg-gray-700 rounded mt-1">
        <div 
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
        />
      </div>
    </div>
  );
}