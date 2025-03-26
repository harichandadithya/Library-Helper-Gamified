import React from 'react';
import { Table } from './Table';
import { useGameStore } from '../store/gameStore';

export function Library() {
  const { tables } = useGameStore();

  return (
    <group>
      {tables.map((table) => (
        <Table key={table.id} {...table} />
      ))}
    </group>
  );
}