import { useThree, useFrame } from '@react-three/fiber'

// Custom Hook for Camera Movement
export function useCameraMovement(targetPosition, lookAtPosition = { x: 0, y: 0, z: 0 }, lerpAlpha = 0.1) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.lerp(targetPosition,lerpAlpha);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
  });
}