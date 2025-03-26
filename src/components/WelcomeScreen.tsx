import React from 'react';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
      <h1 className="text-4xl font-bold mb-4 font-serif transition-transform transform translate-x-0 hover:translate-x-4">Welcome to the Library Helper Game!</h1>
      <p className="text-lg mb-8 font-serif transition-transform transform translate-x-0 hover:translate-x-4">Get ready to organize books and complete tasks in a fun and interactive way.</p>
      <button
        onClick={onNext}
        className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Game
      </button>
    </div>
  );
}
