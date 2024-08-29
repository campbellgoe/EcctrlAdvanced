import { useFrame } from '@react-three/fiber'
import {useRef } from 'react'

const Respawn = ({ ecctrlRef, setPos, respawnPosition = [0,0,0], minY = 0 }) => {
  let lasty = useRef(0.1)
  useFrame(() => {
    if (ecctrlRef.current) {
      try {
        const { y } = ecctrlRef.current.translation()
        lasty.current = y
        if (y < minY) {
          // this random hack ensures position is reset
          setPos(respawnPosition.map(a => a + Math.random() * 0.02 - 0.01))
        }
      } catch (err) {
        if (lasty.current < minY) {
        setPos(respawnPosition.map(a => a + Math.random() * 0.02 - 0.01))
        }
      }
    }
  })
  return null
}

export { Respawn }