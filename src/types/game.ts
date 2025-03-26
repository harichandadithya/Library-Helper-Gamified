export interface Book {
  id: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  position: [number, number, number];
  tableId: string;
}

export interface Table {
  id: string;
  position: [number, number, number];
  books: Book[];
}

export interface Task {
  id: string;
  instruction: string;
  requiresBook: string;
  targetTable: string;
  completed: boolean;
}

export interface TherapeuticMetrics {
  stabilityScore: number;     // Core stability tracking
  precisionScore: number;     // Hand-eye coordination
  completionTime: number;     // Task completion efficiency
  sequenceAccuracy: number;   // Following instructions
}

export interface Level {
  id: number;
  name: string;
  difficulty: 'basic' | 'sequential' | 'complex';
  tasks: Task[];
  timeLimit?: number;
  requiredStability: number;
  metrics: TherapeuticMetrics;
}

export interface GameState {
  level: number;
  levels: Level[];
  tables: Table[];
  selectedBook: Book | null;
  instructions: string[];
  score: number;
  movementState: MovementState;
  viewPoints: ViewPoint[];
  nextBookId: string | null; // ID of the next book to pick up
  heldBook: Book | null;
  currentTask: Task | null;
  therapeuticMetrics: TherapeuticMetrics;
  stabilityThreshold: number;
  taskHistory: Task[];
  // Add any missing properties here
}

export interface TapEvent {
  timestamp: number;
  intensity: number;
}

export interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
  movement?: {
    direction: string;
    intensity: number;
  }
  tapEvent?: TapEvent;
}

export interface ViewPoint {
  id: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface MovementState {
  currentPoint: string;
  isMoving: boolean;
  targetPoint?: string;
}