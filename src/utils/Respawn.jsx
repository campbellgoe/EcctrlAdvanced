import { useFrame } from '@react-three/fiber'

const Respawn = ({ ecctrlRef, setPos, respawnPosition = [0,0,0], minY = 0 }) => {
  useFrame(() => {
    if (ecctrlRef.current) {
      try {
        const { y } = ecctrlRef.current.translation()
        if (y < minY) {
          // this random hack ensures position is reset
          setPos(respawnPosition.map(a => a + Math.random() * 0.02 - 0.01))
        }
      } catch (err) {
        
      }
    }
  })
  return null
}

export { Respawn }