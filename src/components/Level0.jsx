import React, { useMemo, useRef } from 'react'
import { InstancedRigidBodies } from '@react-three/rapier';
function InstancedLevel({ floorColor, instances, count, cellSize }){
  const ref = useRef()
  return <InstancedRigidBodies instances={instances} olliders="trimesh" type="fixed" ccd mass={0}>
      <instancedMesh
            ref={ref}
            args={[null, null, count]}
            dispose={null}
            onClick={(e) => {
              
            }}
            receiveShadow
          >
            <boxGeometry args={[cellSize, 1, cellSize]} />
            <meshStandardMaterial color={floorColor}/>
          </instancedMesh>
      </InstancedRigidBodies>
}
function Level0({ floorColor }) {
  let cellSize = 10
  const map = useMemo(() => [
    [0, 1, 0],
    [0,1,0],
    [1,1,1]
  ], []);
  let [gridWidth, gridDepth] = useMemo(() => [3, 3], [])
  // this count might need to changes if the map contains more than 1s
  const count = useMemo(() => map.reduce((acc, row) => acc + row.reduce((acc, value) => acc + value, 0), 0), [map])
  const instances = useMemo(() => {
    const instances = []
    const [ox, oy, oz] = [gridWidth/2, 0, gridDepth/2].map(v => v * cellSize)
    map.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {
          instances.push({
            position: [i * cellSize - ox, -oy, j * cellSize - oz],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
          })
        }
      })
    })
    return instances
  }, [map]);
  return (
    <InstancedLevel floorColor={floorColor} instances={instances} cellSize={cellSize} count={count}/>
  )
}

export default Level0