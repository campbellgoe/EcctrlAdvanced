import { useEffect } from "react"
export const useTransparent = (meshRef) => {
    useEffect(() => {
    if(meshRef.current){
      const mesh = meshRef.current
      mesh.traverse(node => {
        if(node.material){
          node.material.transparent = true
          node.material.depthWrite=true
        }
      })
    }
  }, [])
}