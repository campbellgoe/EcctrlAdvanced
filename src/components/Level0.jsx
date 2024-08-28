import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InstancedRigidBodies, RigidBody } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { ClampToEdgeWrapping, Vector3 } from 'three';
import { Html } from '@react-three/drei';
  
function Sprite({ spriteRef, imgRef, frame: frameInt, url = "", ...props }) {
  const frame = useMemo(() => ((frameInt+1)%24).toString().padStart(4, '0'), [])
  return (
    <group ref={spriteRef} {...props}>
      <Html as='div' sprite transform occlude="blending" frustumCulled={false} >
        <img onClick={(e) => {
          e.preventDefault()
        }} ref={imgRef} src={url+frame+'.png'} className="w-full h-full"/>
      </Html>
    </group>
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
        <cylinderGeometry args={[cellSize, cellSize, 1, 6]} />{/* Hexagonal shape */}
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
          const [ix, iy, iz] = [x - ox, y - oy, z - oz]
          instances.push({
            key: `instance_${ix},${iy},${iz}`,
            position: [ix, iy, iz],
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
          key: `instance_${offsetX},${offsetZ}`,
          color: 0xffffff * Math.random(),
          map: MAPS.MAP_0,
          position: [offsetX, 0, offsetZ] // Position based on the correct chunk offsets
        });
      }
    }
    return chunks;
  }, [ox, oz]);
  const spriteRef = useRef()
  const imgRef = useRef()
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

        

        // const angle = Math.atan2(state.camera.position.x, state.camera.position.z)
        // console.log('angle', angle)
        // const frame = Math.floor((angle/(Math.PI*2))*24)%24

        const sprite = spriteRef.current
        if(sprite){
          console.log('sprite:', sprite, state.camera.position, sprite.position)
          // // first calculate angle between camera and sprite
          // // sprite is a drei Html component
          let posSprite = new Vector3();
          sprite.getWorldPosition(posSprite);


          let posCamera = new Vector3();
          camera.getWorldPosition(posCamera);

          const xDist = posCamera.x - posSprite.x;
          const zDist = posCamera.z - posSprite.z;
          const angleRadians = Math.atan2(zDist, xDist);

          // const angleRadians = posSprite.angleTo(posCamera);
          const angle = angleRadians//Math.atan2(state.camera.position.x - sprite.position.x, state.camera.position.z - sprite.position.z)
          console.log('angle:', angle)
          const newFrame = Math.floor((angle/(Math.PI*2)+0.5)*24)%24
          setFrame(newFrame)
          imgRef.current.src = '/images/BigBush/Monsterra_'+newFrame.toString().padStart(4, '0')+'.png'
        }
      }catch(err){
        console.error(err)
      }
    }
    
    return true
  })
  return (
    <>
      <RigidBody colliders="trimesh"
        type="fixed"
        ccd
        mass={0}>
        <group dispose={null}>
          <mesh receiveShadow castShadow>
            <cylinderGeometry args={[12, 20, 12, 6]} />
            <meshPhongMaterial color={0x775511} />
          </mesh>
          <mesh receiveShadow castShadow>
            <cylinderGeometry args={[12, 12, 128, 6]} />
            <meshPhongMaterial color={0x775511} />
          </mesh>
        </group>
      </RigidBody>
      {chunks.map((chunk, i) => (
        <Chunk key={chunk.key} {...chunk} />
      ))}
      <axesHelper args={[50]} />
      <Sprite spriteRef={spriteRef} imgRef={imgRef} frame={frame} position={[12, 4, 24]} scale={[2,2,2]} url='/images/BigBush/Monsterra_' dispose={null}/>
    </>
  );
}
export default Level0;
