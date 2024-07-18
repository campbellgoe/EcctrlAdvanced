import {useState} from 'react'

export const useBaseCharacter = (materials, onClick) => {
  for (const material in materials) {
    materials[material].metalness = -2
    materials[material].roughness = 1
  }
  const [hovered, setHovered] = useState(false)
  const meshProps = {
    onClick,
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    castShadow: true,
    receiveShadow: true,
  }
  return { meshProps, hovered }
}