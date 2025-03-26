import create from 'zustand';
import { Vector3 } from 'three';
import { audioService } from '../services/audioService';

type BookSize = 'small' | 'medium' | 'large';

interface Book {
  id: string;
  color: string;
  size: BookSize;
  tableId: string;
  position: [number, number, number];
}

interface Table {
  id: string;
  position: [number, number, number];
  books: Array<Book>;
}

interface ViewPoint {
  id: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

interface MovementState {
  currentPoint: string;
  isMoving: boolean;
  targetPoint?: string;
}

interface GameState {
  level: number;
  levels: Level[];
  tables: Table[];
  selectedBook: Book | null;
  instructions: string[];
  score: number;
  movementState: MovementState;
  viewPoints: ViewPoint[];
  nextBookId: string | null;
  heldBook: Book | null;
  currentTask: Task | null;
  therapeuticMetrics: TherapeuticMetrics;
  stabilityThreshold: number;
  taskHistory: Task[];
}

interface Task {
  id: string;
  instruction: string;
  requiresBook: string;
  targetTable: string;
  completed: boolean;
}

interface Level {
  id: number;
  name: string;
  difficulty: string;
  tasks: Task[];
  requiredStability: number;
  timeLimit: number;
  metrics: TherapeuticMetrics;
}

interface TherapeuticMetrics {
  stabilityScore: number;
  precisionScore: number;
  completionTime: number;
  sequenceAccuracy: number;
}

const initialTables: Table[] = [
  {
    id: 'table1',
    position: [-4, 0, 0] as [number, number, number],
    books: [
      { id: 'book1', color: '#ff0000', size: 'small', tableId: 'table1', position: [0, 0, 0] },
      { id: 'book2', color: '#00ff00', size: 'medium', tableId: 'table1', position: [0, 0, 0] },
    ]
  },
  {
    id: 'table2',
    position: [0, 0, 0] as [number, number, number],
    books: [
      { id: 'book3', color: '#0000ff', size: 'large', tableId: 'table2', position: [0, 0, 0] },
    ]
  },
  {
    id: 'table3',
    position: [4, 0, 0] as [number, number, number],
    books: []
  }
];

// Store initial book positions for reset
const initialBookPositions = initialTables.flatMap(table => 
  table.books.map(book => ({...book}))
);

const viewPoints: ViewPoint[] = [
  {
    id: 'table1_view',
    position: [-4, 1.6, 2], // Lowered height from 2 to 1.6
    lookAt: [-4, 1, 0]
  },
  {
    id: 'table2_view',
    position: [0, 1.6, 2],  // Centered position
    lookAt: [0, 1, 0]
  },
  {
    id: 'table3_view',
    position: [4, 1.6, 2],
    lookAt: [4, 1, 0]
  }
];

const bookOrder = ['book1', 'book2', 'book3']; // Define pick-up order

const levels: Level[] = [
  {
    id: 1,
    name: 'Basic Book Handling',
    difficulty: 'basic',
    tasks: [
      {
        id: 'task1',
        instruction: 'Pick up the RED book from Table 1',
        requiresBook: 'book1',
        targetTable: 'table1',
        completed: false
      }
    ],
    requiredStability: 0.5,
    timeLimit: 0,
    metrics: {
      stabilityScore: 0,
      precisionScore: 0,
      completionTime: 0,
      sequenceAccuracy: 0
    }
  },
  {
    id: 2,
    name: 'Sequential Movement',
    difficulty: 'sequential',
    tasks: [
      {
        id: 'task2_1',
        instruction: 'Move the GREEN book to Table 2, then the BLUE book to Table 3',
        requiresBook: 'book2',
        targetTable: 'table2',
        completed: false
      }
    ],
    requiredStability: 0.6,
    timeLimit: 60,
    metrics: {
      stabilityScore: 0,
      precisionScore: 0,
      completionTime: 0,
      sequenceAccuracy: 0
    }
  },
  {
    id: 3,
    name: 'Complex Organization',
    difficulty: 'complex',
    tasks: [
      {
        id: 'task3_1',
        instruction: 'Sort all books by size: Small books on Table 1, Medium on Table 2, Large on Table 3',
        requiresBook: 'all',
        targetTable: 'all',
        completed: false
      }
    ],
    requiredStability: 0.7,
    timeLimit: 120,
    metrics: {
      stabilityScore: 0,
      precisionScore: 0,
      completionTime: 0,
      sequenceAccuracy: 0
    }
  },
  {
    id: 4,
    name: "Speed Challenge",
    difficulty: "sequential",
    tasks: [
      {
        id: "task4_1",
        instruction: "Quickly move all books to Table 3 while maintaining stability",
        requiresBook: "all",
        targetTable: "table3",
        completed: false
      }
    ],
    requiredStability: 0.65,
    timeLimit: 45,
    metrics: {
      stabilityScore: 0,
      precisionScore: 0,
      completionTime: 0,
      sequenceAccuracy: 0
    }
  },
  {
    id: 5,
    name: "Precision Master",
    difficulty: "complex",
    tasks: [
      {
        id: "task5_1",
        instruction: "Place each book with perfect stability (>90%)",
        requiresBook: "all",
        targetTable: "all",
        completed: false
      },
      {
        id: "task5_2",
        instruction: "Return all books to their original tables",
        requiresBook: "all",
        targetTable: "all",
        completed: false
      }
    ],
    requiredStability: 0.9,
    timeLimit: 180,
    metrics: {
      stabilityScore: 0,
      precisionScore: 0,
      completionTime: 0,
      sequenceAccuracy: 0
    }
  },
  {
    id: 6,
    name: "Time Trial",
    difficulty: "complex",
    tasks: [
      {
        id: "task6_1",
        instruction: "Sort books by color between tables in under 1 minute",
        requiresBook: "all",
        targetTable: "all",
        completed: false
      }
    ],
    requiredStability: 0.6,
    timeLimit: 60,
    metrics: {
      stabilityScore: 0,
      precisionScore: 0,
      completionTime: 0,
      sequenceAccuracy: 0
    }
  }
];

// Make bookOrder mutable
let currentBookOrder = [...bookOrder];

// Add type definitions for store actions
interface GameActions {
  selectBook: (bookId: string | null) => void;
  moveBook: (bookId: string, targetTableId: string) => void;
  moveToPoint: (pointId: string) => void;
  pickupBook: () => void;
  placeBook: () => void;
  updateStabilityScore: (stability: number) => void;
  completeTask: (taskId: string) => void;
  progressToNextLevel: () => void;
}

// Create store with proper type annotations
export const useGameStore = create<GameState & GameActions>((set) => ({
  level: 1,
  levels: levels,
  tables: initialTables,
  selectedBook: null,
  instructions: ['Sort the books by size'],
  score: 0,
  movementState: {
    currentPoint: 'table1_view',
    isMoving: false,
    targetPoint: undefined
  },
  viewPoints,
  nextBookId: bookOrder[0],
  heldBook: null,
  currentTask: levels[0].tasks[0],
  therapeuticMetrics: {
    stabilityScore: 0,
    precisionScore: 0,
    completionTime: 0,
    sequenceAccuracy: 0
  },
  stabilityThreshold: 0.7,
  taskHistory: [],

  selectBook: (bookId) => 
    set((state) => {
      if (!bookId) return { selectedBook: null };
      const book = state.tables
        .flatMap(t => t.books)
        .find(b => b.id === bookId);
      return { selectedBook: book || null };
    }),
    
  moveBook: (bookId, targetTableId) =>
    set((state) => {
      const book = state.tables
        .flatMap(t => t.books)
        .find(b => b.id === bookId);
      if (!book) return state;

      const newTables = state.tables.map(table => ({
        ...table,
        books: table.id === targetTableId
          ? [...table.books, { ...book, tableId: targetTableId }]
          : table.books.filter(b => b.id !== bookId)
      }));

      return {
        ...state,
        tables: newTables,
        selectedBook: null
      };
    }),

  moveToPoint: (pointId) => 
    set((state) => {
      // Prevent movement if already moving
      if (state.movementState.isMoving) return state;

      audioService.play('move');
      
      return {
        movementState: {
          ...state.movementState,
          isMoving: true,
          targetPoint: pointId
        }
      };
    }),

  pickupBook: () =>
    set((state) => {
      if (state.heldBook || !state.nextBookId) return state;
      
      const book = state.tables
        .flatMap(t => t.books)
        .find(b => b.id === state.nextBookId);
      
      if (!book) return state;

      const newTables = state.tables.map(table => ({
        ...table,
        books: table.books.filter(b => b.id !== book.id)
      }));

      const nextIndex = currentBookOrder.indexOf(state.nextBookId) + 1;
      
      const result = {
        ...state,
        tables: newTables,
        heldBook: book,
        nextBookId: nextIndex < currentBookOrder.length ? currentBookOrder[nextIndex] : null
      };

      audioService.play('pickup');
      return result;
    }),

  placeBook: () =>
    set((state) => {
      if (!state.heldBook) return state;

      const currentViewPoint = state.viewPoints.find(
        vp => vp.id === state.movementState.currentPoint
      );
      
      if (!currentViewPoint) return state;

      // Extract table id from viewpoint (e.g. "table1_view" -> "table1")
      const currentTableId = currentViewPoint.id.split('_')[0];
      
      // Find the target table
      const targetTable = state.tables.find(t => t.id === currentTableId);
      
      if (!targetTable) {
        console.log('No valid table found for placement');
        return state;
      }

      // Add book to target table
      const newTables = state.tables.map(table => {
        if (table.id === currentTableId) {
          return {
            ...table,
            books: [...table.books, { ...state.heldBook!, tableId: currentTableId }]
          };
        }
        return table;
      });

      // Update therapeutic metrics
      const newMetrics = {
        ...state.therapeuticMetrics,
        precisionScore: state.therapeuticMetrics.stabilityScore > 0.7 ? 1 : 0.5,
        sequenceAccuracy: state.currentTask?.targetTable === currentTableId ? 1 : 0
      };

      // Check if task is completed
      const taskCompleted = state.currentTask?.targetTable === currentTableId;
      
      audioService.play('place');
      
      return {
        ...state,
        tables: newTables,
        heldBook: null,
        therapeuticMetrics: newMetrics,
        score: taskCompleted ? state.score + 100 : state.score,
        taskHistory: taskCompleted ? [...state.taskHistory, state.currentTask!] : state.taskHistory,
        currentTask: taskCompleted ? null : state.currentTask
      };
    }),

  updateStabilityScore: (stability: number) =>
    set((state) => ({
      ...state, // Preserve existing state
      therapeuticMetrics: {
        ...state.therapeuticMetrics,
        stabilityScore: stability
      }
    })),

  completeTask: (taskId: string) =>
    set((state) => {
      const currentLevel = state.levels.find(l => l.id === state.level);
      if (!currentLevel) return state;

      const task = state.currentTask;
      if (!task || task.id !== taskId) return state;

      // Find next task in current level
      const currentTaskIndex = currentLevel.tasks.findIndex(t => t.id === taskId);
      const nextTask = currentLevel.tasks[currentTaskIndex + 1];

      const newScore = state.score + 
        (state.therapeuticMetrics.stabilityScore > state.stabilityThreshold ? 100 : 50);

      if (!nextTask) {
        // Level completed
        if (state.level < state.levels.length) {
          return {
            ...state,
            taskHistory: [...state.taskHistory, task],
            score: newScore + 500, // Bonus for completing level
            currentTask: null
          };
        }
      }

      return {
        ...state,
        taskHistory: [...state.taskHistory, task],
        score: newScore,
        currentTask: nextTask || null
      };
    }),

  progressToNextLevel: () => 
    set((state) => {
      const nextLevel = state.level + 1;
      
      if (nextLevel > state.levels.length) {
        return state;
      }

      // Get the next level's first task
      const nextLevelData = state.levels.find(l => l.id === nextLevel);
      const firstTask = nextLevelData?.tasks[0];

      // Reset and cycle books
      const cycledBooks = [...initialBookPositions];
      cycledBooks.push(cycledBooks.shift()!); // Rotate books array

      // Also cycle the book order array
      currentBookOrder = [...currentBookOrder];
      currentBookOrder.push(currentBookOrder.shift()!); // Rotate book order

      // Redistribute books to tables
      const newTables = initialTables.map(table => ({
        ...table,
        books: []
      }));

      // Place cycled books on tables
      cycledBooks.forEach((book, index) => {
        const targetTableId = `table${Math.floor(index / 2) + 1}`;
        const tableIndex = newTables.findIndex(t => t.id === targetTableId);
        if (tableIndex !== -1) {
          newTables[tableIndex].books.push({
            ...book,
            tableId: targetTableId
          });
        }
      });

      audioService.play('complete');
      
      return {
        ...state,
        level: nextLevel,
        tables: newTables,
        currentTask: firstTask || null,
        nextBookId: currentBookOrder[0], // Use first book from cycled order
        heldBook: null,
        therapeuticMetrics: {
          stabilityScore: 0,
          precisionScore: 0,
          completionTime: 0,
          sequenceAccuracy: 0
        }
      };
    })
}));