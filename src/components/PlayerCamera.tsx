import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SensorData } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { audioService } from '../services/audioService';

interface PlayerCameraProps {
  sensorData: SensorData | null;
  sensitivity: number;
}

export function PlayerCamera({ sensorData, sensitivity }: PlayerCameraProps) {
  const { camera } = useThree();
  const {
    movementState,
    viewPoints,
    moveToPoint,
    pickupBook,
    placeBook,
    heldBook
  } = useGameStore();
  
  const lastMoveTime = useRef(0);
  const moveDelay = 300;
  const isTransitioning = useRef(false);
  
  const THRESHOLDS = {
    rotation: 2,
    tilt: 3,
    position: 0.1,
    lerpSpeed: 0.2
  };

  useEffect(() => {
    const startPoint = viewPoints.find(vp => vp.id === movementState.currentPoint);
    if (startPoint) {
      camera.position.set(...startPoint.position);
      camera.lookAt(...startPoint.lookAt);
    }
  }, []);

  useFrame((state, delta) => {
    if (!sensorData) return;

    const currentTime = Date.now();
    
    if (!isTransitioning.current && currentTime - lastMoveTime.current > moveDelay) {
      const { x: gyroX, y: gyroY } = sensorData.gyroscope;
      
      // Improved rotation detection with lower threshold
      if (Math.abs(gyroY) > THRESHOLDS.rotation) {
        const currentIndex = viewPoints.findIndex(vp => vp.id === movementState.currentPoint);
        const direction = gyroY > 0 ? 1 : -1;
        const targetIndex = currentIndex + direction;

        // Allow wrapping around for smoother navigation
        const wrappedIndex = (targetIndex + viewPoints.length) % viewPoints.length;

        if (wrappedIndex >= 0 && wrappedIndex < viewPoints.length) {
          console.log(`Moving to table ${wrappedIndex + 1}`);
          isTransitioning.current = true;
          moveToPoint(viewPoints[wrappedIndex].id);
          lastMoveTime.current = currentTime;
        }
      }

      // More responsive book interaction
      if (Math.abs(gyroX) > THRESHOLDS.tilt) {
        if (gyroX > 0 && !heldBook) {
          pickupBook();
          lastMoveTime.current = currentTime;
        } else if (gyroX < 0 && heldBook) {
          placeBook();
          lastMoveTime.current = currentTime;
        }
      }
    }

    if (movementState.isMoving && movementState.targetPoint) {
      const targetPoint = viewPoints.find(vp => vp.id === movementState.targetPoint);
      if (targetPoint) {
        const targetPosition = new Vector3(...targetPoint.position);
        const targetLookAt = new Vector3(...targetPoint.lookAt);

        camera.position.lerp(targetPosition, THRESHOLDS.lerpSpeed);
        camera.lookAt(targetLookAt);

        if (camera.position.distanceTo(targetPosition) < THRESHOLDS.position) {
          useGameStore.setState({
            movementState: {
              currentPoint: movementState.targetPoint,
              isMoving: false,
              targetPoint: undefined
            }
          });
          isTransitioning.current = false;
          audioService.stop('move'); // Stop move sound when reaching target
        }
      }
    }
  });

  return null;
}