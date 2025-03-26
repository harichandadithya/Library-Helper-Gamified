import { useRef } from 'react';
import { Mesh } from 'three';
import { Box, Text } from '@react-three/drei';
import { Table as TableType, Book as BookType } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface TableProps extends TableType {
  position: [number, number, number]; // Ensure position is typed correctly
}

export function Table({ id, position, books }: TableProps) {
  const tableRef = useRef<Mesh>(null);
  const { selectedBook, nextBookId } = useGameStore();

  return (
    <group position={position}>
      {/* Table top */}
      <Box
        ref={tableRef}
        args={[2, 0.2, 1]}
        position={[0, 1, 0]}
      >
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Table legs */}
      {[[-0.8, 0.5, -0.4], [0.8, 0.5, -0.4], [-0.8, 0.5, 0.4], [0.8, 0.5, 0.4]].map(
        (legPosition, index) => (
          <Box
            key={`leg-${index}`}
            args={[0.1, 1, 0.1]}
            position={legPosition as [number, number, number]}
          >
            <meshStandardMaterial color="#8B4513" />
          </Box>
        )
      )}

      {/* Books */}
      {books.map((book, index) => {
        const isSelected = selectedBook?.id === book.id;
        const isNext = book.id === nextBookId;
        
        return (
          <group key={book.id}>
            <Box
              args={[0.3, 0.4, 0.2]}
              position={[
                -0.8 + (index * 0.35),
                1.4 + (isSelected ? 0.2 : 0),
                0
              ]}
              userData={{ bookId: book.id }}
            >
              <meshStandardMaterial 
                color={book.color}
                emissive={isSelected || isNext ? "#ffffff" : "#000000"}
                emissiveIntensity={isSelected ? 0.2 : isNext ? 0.5 : 0}
              />
            </Box>
            
            {/* Highlight effect for next book */}
            {isNext && (
              <pointLight
                position={[-0.8 + (index * 0.35), 1.8, 0]}
                intensity={1}
                distance={1}
                color="#ffffff"
              />
            )}
            
            {/* Book size label */}
            <Text
              position={[-0.8 + (index * 0.35), 1.6, 0.11]}
              scale={0.1}
              color="white"
            >
              {book.size}
            </Text>
          </group>
        );
      })}

      {/* Table label */}
      <group position={[0, 0.5, 0.6]}>
        <Box args={[0.3, 0.3, 0.05]}>
          <meshStandardMaterial color="white" />
        </Box>
        <Text
          position={[0, 0, 0.03]}
          scale={0.15}
          color="black"
        >
          {id}
        </Text>
      </group>

      {/* Drop zone indicator when holding a book */}
      {selectedBook && selectedBook.tableId !== id && (
        <Box
          args={[2, 0.01, 1]}
          position={[0, 1.1, 0]}
        >
          <meshStandardMaterial 
            color="#44ff44"
            opacity={0.3}
            transparent
          />
        </Box>
      )}
    </group>
  );
}