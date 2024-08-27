import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { ClampToEdgeWrapping } from 'three';
  
function Sprite({ url = "", frame, ...props }) {
  const frameOutOf24 = useMemo(() => frame%24+1, [frame])
  const url2 = useMemo(() => url+frameOutOf24.toString().padStart(4, "0"), [url])
  const texture = useLoader(TextureLoader, url2+'.png', (texture) => {})
  const sprite = useRef()
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping

  texture.offset.x = 0
  texture.offset.y = 0
  return (
    <sprite {...props} ref={sprite}>
      <spriteMaterial attach="material" map={texture} />
    </sprite>
  )
}

function InstancedLevel({ floorColor, instances, count, cellSize }) {
  const ref = useRef();
  if(ref?.current?.geometry?.boundingSphere === null){
    ref.current.geometry.computeBoundingSphere()
  }
  return (
    <InstancedRigidBodies
      instances={instances}
      colliders="trimesh"
      type="fixed"
      ccd
      mass={0}
    >
      <instancedMesh
        ref={ref}
        args={[null, null, count, false, true, false]}
        dispose={null}
        onClick={(e) => {}}
        receiveShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[cellSize, cellSize, 1, 6]} /> {/* Hexagonal shape */}
        <meshPhongMaterial color={floorColor} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

export const CELL_SIZE = 10;
const cellSize = CELL_SIZE;

export const MAPS = {
  MAP_0: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1],
    [1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1]
  ]
};

// Helper function to calculate hex positions
const calculateHexPosition = (i, j, cellSize) => {
  let x = i * cellSize * Math.sqrt(3); // Horizontal distance between centers
  const z = j * cellSize * 1.5; // Vertical distance, adjusted for row overlap
  if (j % 2 !== 0) x += (cellSize * Math.sqrt(3)) / 2; // Offset every other row
  return [x, 0, z];
};

const useInstances = (map, cellSize, [offsetX = 0, offsetY = 0, offsetZ = 0] = [0, 0, 0], color = 0xffffff) => {
  const [count, instances] = useMemo(() => {
    let count = 0;
    const instances = [];
    const [ox, oy, oz] = [offsetX, offsetY, offsetZ].map((v) => v * cellSize);

    map.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {
          const [x, y, z] = calculateHexPosition(i, j, cellSize);
          instances.push({
            position: [x - ox, y - oy, z - oz],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: color
          });
          count++;
        }
      });
    });
    return [count, instances];
  }, [map]);

  return [count, instances];
};

function Chunk({ map, position, color }) {
  const [count, instances] = useInstances(map, CELL_SIZE, position, color);
  return (
    <InstancedLevel
      floorColor={color}
      instances={instances}
      cellSize={CELL_SIZE}
      count={count}
    />
  );
}

function Level0({ ecctrlRef, floorColor }) {

const [[ox, oz], setOffset] = useState([0,0])
  const chunks = useMemo(() => {
    const chunkWidth = MAPS.MAP_0[0].length;
    const chunkHeight = MAPS.MAP_0.length;

    let chunks = [];
    const cSize = 1
    for (let x = -3+ox; x < 3+ox; x++) {
      for (let z = -3+oz; z < 3+oz; z++) {
        // Horizontal distance between chunks
        const offsetX = x * chunkWidth * cSize * Math.sqrt(3); // Horizontal offset
        // Vertical distance between chunks, with row staggering
        const offsetZ =
          (z * chunkHeight * cSize * 1.5 +
            (x % 2 !== 0 ? (cSize * 1.5) * 2 : 0)); // Vertical offset with stagger

        chunks.push({
          Key: `${x},${z}`,
          color: 0xffffff * Math.random(),
          map: MAPS.MAP_0,
          position: [offsetX, 0, offsetZ] // Position based on the correct chunk offsets
        });
      }
    }
    return chunks;
  }, [ox, oz]);
  const camera = useThree(state => state.camera)
  const [frame, setFrame] = useState(0)
  useFrame((state) => {
    console.log('frame', frame)
    if (ecctrlRef.current) {
      try {
        const { x, y, z } = ecctrlRef.current.translation()
        setOffset([-Math.floor((x/CELL_SIZE/MAPS.MAP_0.length)/Math.sqrt(3)), -Math.floor((z/CELL_SIZE/MAPS.MAP_0.length)/1.5)])
      } catch (err) {
console.error(err)
      }
      try {

        // how to calculate the frame from the camera perspective
        // const angle = Math.atan2(state.camera.position.x, state.camera.position.z)
        // console.log('angle', angle)
        // const frame = Math.floor((angle/(Math.PI*2)+0.5)*24)%24
        setFrame(frame =>( frame + 1) % 24)
      }catch(err){
        console.error(err)
      }
    }
    
    return true
  })
  return (
    <>
      {chunks.map((chunk, i) => (
        <Chunk key={chunk.Key} {...chunk} />
      ))}
      <axesHelper args={[50]} />
      <Sprite position={[12, 4, 24]} scale={[10,10,10]} url='/images/BigBush/Monsterra_' frame={frame} dispose={null}/>
    </>
  );
}
export default Level0;
