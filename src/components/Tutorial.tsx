import React from 'react';
import { useGameStore } from '../store/gameStore';

export function Tutorial() {
  const { tutorialStep, advanceTutorial } = useGameStore();

  const steps = [
    "Step 1: WELCOME TO LIBRARY HELPER.",
    "Step 2: Place the book on the table using the phone.",
    "Step 3: Order the books by size: small, medium, large.",
    "Step 4: Stop.",
    "Step 5: Thank you for completing the tutorial!"
  ];

  // Hide tutorial after the last step
  if (tutorialStep > steps.length) return null;

  return (
    <div className="fixed bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-xl shadow-lg border-2 border-white">
      <p className="text-lg font-semibold">{steps[tutorialStep - 1]}</p>
      <button
        onClick={advanceTutorial}
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
      >
        {tutorialStep === steps.length ? "Finish" : "Next"}
      </button>
    </div>
  );
}
