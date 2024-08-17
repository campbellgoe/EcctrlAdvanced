export const useBaseCharacter = (materials, props = {}) => {
  for (const material in materials) {
    materials[material].metalness = -2
    materials[material].roughness = 1
  }
  const meshProps = {
    ...props,
    castShadow: true,
    receiveShadow: true,
  }
  return meshProps
}