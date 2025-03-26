import { Environment } from '@react-three/drei';
import { Library } from './Library';
import { PlayerCamera } from './PlayerCamera';
import { SensorData } from '../types/game';
import { PlayerArms } from './PlayerArms';

interface LibrarySceneProps {
  sensorData: SensorData | null;
  sensitivity: number;
}

export function LibraryScene({ sensorData, sensitivity }: LibrarySceneProps) {
  return (
    <>
      <color attach="background" args={['#87CEEB']} /> {/* Sky blue background */}
      <fog attach="fog" args={['#87CEEB', 10, 20]} /> {/* Add depth fog */}
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Scene contents */}
      <Library />
      <Environment preset="sunset" />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>

      <PlayerCamera sensorData={sensorData} sensitivity={sensitivity} />
      <PlayerArms sensorData={sensorData} />
    </>
  );
}
