import { useFrame } from '@react-three/fiber'

export const DisableRender = () => useFrame(() => null, 1000)