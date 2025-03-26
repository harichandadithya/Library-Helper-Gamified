import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { SensorData } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface PlayerArmsProps {
  sensorData: SensorData | null;
}

export function PlayerArms({ sensorData }: PlayerArmsProps) {
  const armRef = useRef<Group>(null);
  const { heldBook, therapeuticMetrics } = useGameStore();
  const { camera } = useThree();
  
  // Add glow effect for stability feedback
  const glowIntensity = therapeuticMetrics.stabilityScore;
  
  useFrame(() => {
    if (!armRef.current || !sensorData) return;

    // Get camera's forward and right vectors
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    // Position arms in front of camera
    const armPosition = camera.position.clone()
      .add(forward.multiplyScalar(0.5))  // Move arms forward
      .add(new Vector3(0, -0.3, 0));     // Adjust height below camera

    // Apply position
    armRef.current.position.copy(armPosition);
    
    // Match camera rotation
    armRef.current.rotation.copy(camera.rotation);

    // Add arm movement based on accelerometer
    const tiltX = -sensorData.accelerometer.y * 0.2;
    const tiltZ = -sensorData.accelerometer.x * 0.2;

    armRef.current.rotation.x += tiltX;
    armRef.current.rotation.z += tiltZ;

    // Raise arms when picking up
    if (sensorData.accelerometer.y > 2) {
      armRef.current.position.y += 0.2;
    }

    // Calculate arm stability based on accelerometer data
    const stability = 1 - (Math.abs(sensorData.accelerometer.x) + 
                          Math.abs(sensorData.accelerometer.y)) / 20;
    
    useGameStore.getState().updateStabilityScore(Math.max(0, Math.min(1, stability)));
  });

  return (
    <group ref={armRef}>
      {/* Arms with dynamic coloring based on stability */}
      <mesh position={[-0.2, -0.1, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial 
          color={therapeuticMetrics.stabilityScore > 0.7 ? "#90EE90" : "#ffdbb4"} 
          emissive="#ffffff"
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      <mesh position={[0.2, -0.1, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial 
          color={therapeuticMetrics.stabilityScore > 0.7 ? "#90EE90" : "#ffdbb4"}
          emissive="#ffffff"
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* Held Book with enhanced visual feedback */}
      {heldBook && (
        <group position={[0, -0.3, 0.2]}>
          <mesh scale={[0.3, 0.4, 0.2]}>
            <boxGeometry />
            <meshStandardMaterial 
              color={heldBook.color}
              emissive={heldBook.color}
              emissiveIntensity={0.5}
              transparent
              opacity={therapeuticMetrics.stabilityScore}
            />
          </mesh>
          <pointLight
            position={[0, 0.2, 0]}
            intensity={therapeuticMetrics.stabilityScore}
            distance={1}
            color={heldBook.color}
          />
        </group>
      )}
    </group>
  );
}
