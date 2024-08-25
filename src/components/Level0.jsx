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
export const CELL_SIZE = 10
const cellSize = CELL_SIZE
export const MAPS = {
  MAP_0: [
    [1, 1, 1, 1, 1, 1],
    [1,1,1, 0, 1, 1],
    [1,0,1, 1, 1, 1],
    [1,1,1, 1, 0, 1],
    [1,1,0, 1, 1, 1],
    [1,1,1, 1, 1, 1]
  ]
}
const useInstances = (map, cellSize, [offsetX = 0, offsetY = 0, offsetZ = 0] = [0,0,0]) => {
  const [count, instances] = useMemo(() => {
    let count = 0
    const instances = []
    const [ox, oy, oz] = [offsetX, offsetY, offsetZ].map(v => v * cellSize)
    map.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {
          const x = i * cellSize - ox
          const y = -oy
          const z = j * cellSize - oz
          // dist between px pz, and x, z
          count ++
            instances.push({
              position: [x, y, z],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
            })
        }
      })
    })
    return [count, instances]
  }, [map]);
  return [count, instances]
}
function Chunk ({ map, position, color}) {
  const [count, instances] = useInstances(map, CELL_SIZE, position)
  return <InstancedLevel floorColor={color} instances={instances} cellSize={CELL_SIZE} count={count}/>
}

function Level0({ floorColor }) {
  // calculate chunks for 2x2 grid
  const chunks = useMemo(() => {
    let chunks = []
    for(let x = -1; x < 1; x++) {
      for(let z = -1; z < 1; z++) {
        chunks.push({ Key: x+','+z, color: 0xffffff*Math.random(), map: MAPS.MAP_0, position: [x * Math.round((MAPS.MAP_0.length/2*CELL_SIZE/2-CELL_SIZE/2)/2+0.5), 0, z * Math.round((MAPS.MAP_0[0].length/2*CELL_SIZE/2-CELL_SIZE/2)/2+0.5)]})
      }
    }
    return chunks}, [])
  return (
    <>
    {chunks.map((chunk, i) => <Chunk key={chunk.Key} {...chunk} />)}
    </>
  )
}

export default Level0