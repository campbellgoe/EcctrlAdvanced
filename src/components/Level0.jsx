import React, { useMemo, useRef } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';

function InstancedLevel({ floorColor, instances, count, cellSize }) {
  const ref = useRef();

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
        args={[null, null, count]}
        dispose={null}
        onClick={(e) => {}}
        receiveShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[cellSize, cellSize, 1, 6]} /> {/* Hexagonal shape */}
        <meshStandardMaterial color={floorColor} />
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

const useInstances = (map, cellSize, [offsetX = 0, offsetY = 0, offsetZ = 0] = [0, 0, 0]) => {
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
            scale: [1, 1, 1]
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
  const [count, instances] = useInstances(map, CELL_SIZE, position);
  return (
    <InstancedLevel
      floorColor={color}
      instances={instances}
      cellSize={CELL_SIZE}
      count={count}
    />
  );
}

function Level0({ floorColor }) {
  const chunks = useMemo(() => {
    const chunkWidth = MAPS.MAP_0[0].length;
    const chunkHeight = MAPS.MAP_0.length;

    let chunks = [];
    const cSize = 1
    for (let x = -3; x < 3; x++) {
      for (let z = -3; z < 3; z++) {
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
  }, []);

  return (
    <>
      {chunks.map((chunk, i) => (
        <Chunk key={chunk.Key} {...chunk} />
      ))}
      <axesHelper args={[50]} />
    </>
  );
}

export default Level0;
