import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InstancedRigidBodies, RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { Vector3, SpriteMaterial } from 'three';

function Sprite({ spriteRef, plants, plant, frame, distance, ...props }) {
  const material = useMemo(() => {
    return plants.find(({ src }) => src === plant)?.textureMaps[frame] || null
  }, [plants, plant, frame])

  // const myOccludingRef = useRef()
  // const frame = useMemo(() => ((frameInt) % 24).toString().padStart(4, '0'), [])
  // const [hidden, setOcclude] = useState()

  // console.log('textureMaps:', textureMaps, 'frame:', frame
  return (
    <>
      {(!!plants.length) && <><sprite ref={spriteRef} {...props} material={material} visible={true} dispose={null}>
        <spriteMaterial attach="material" map={material.map} color={0xffffff} />
      </sprite>
        {/* <Html as='div' sprite transform occlude
          onOcclude={(occ) => {
            setOcclude(occ)
          }}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'all 0.5s',
            opacity: distance < 100 ? 0.75 - (distance / 200) + 0.25 : 0,
          }} frustumCulled={false} >
          <img ref={imgRef} src="" className="w-full h-full select-none" />
        </Html> */}
        {/* hitarea for the tree */}
        {/* <RigidBody colliders="trimesh" ccd type="fixed" mass={0}>
          <group {...props} opacity={0} transparent={true} >
            <mesh>
              <cylinderGeometry args={[0, 0.2, 1, 12]} />
              <meshStandardMaterial opacity={0} transparent={true} depthWrite={false} />
            </mesh>
          </group>
        </RigidBody> */}
      </>}
    </>
  )
}

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
        args={[null, null, count, false, true, false]}
        dispose={null}
        onClick={(e) => { }}
        receiveShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[cellSize, cellSize, 10, 6]} />{/* Hexagonal shape */}
        <meshPhongMaterial color={floorColor} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

export const CELL_SIZE = 10;
const cellSize = CELL_SIZE;
// chunks for sprites to spawn in
const chunkStart = -2
const chunkEnd = 2
export const MAPS = {
  MAP_0: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
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
  const wall = {
    depth: 30,
    width: 30,
    height: 10,
    thickness: 1
  }
  const box = {
    depth: 4,
    width: 4,
    height: 4,
  }
  const generatePlant = useCallback((spriteKey, regionKey, { src, scale, isSmall }, { spread = 128, ox = 0, oz = 0 }) => {
    const numberOfCols = Math.floor((wall.depth * wall.thickness) / box.depth);
    const numberOfRows = Math.floor((wall.width * wall.thickness) / box.width);
    const numberOfLayers = Math.floor((wall.height * wall.thickness) / box.height);
    const halfSpread = spread / 2
    const z = Math.random() * spread - halfSpread - (oz * spread)

    const x = Math.random() * spread - halfSpread - (ox * spread)
    const y = isSmall ? -3 : 0
    const startFrame = Math.floor(Math.random() * 24) % 24
    const frame = startFrame
    return {
      src,
      regionKey,
      key: spriteKey,
      scale,
      //position
      position: [x, y, z],
      distance: 0,
      posObject: new Vector3(),
      startFrame,
      frame
    }
  }, [])
  const [[ox, oz], setOffset] = useState([0, 0])


  const colors = useMemo(() => {
    const colors = []
    for (let i = 0; i < 128; i++) {
      colors.push(0x00ffff * Math.random() + 0x004400 + 0x220000)
    }
    return colors
  }, [])
  const chunks = useMemo(() => {
    const chunkWidth = MAPS.MAP_0[0].length;
    const chunkHeight = MAPS.MAP_0.length;

    let chunks = [];
    const cSize = 1
    let index = 0
    for (let x = -2 + ox; x < 2 + ox; x++) {
      for (let z = -2 + oz; z < 2 + oz; z++) {
        // Horizontal distance between chunks
        const offsetX = x * chunkWidth * cSize * Math.sqrt(3); // Horizontal offset
        // Vertical distance between chunks, with row staggering
        const offsetZ =
          (z * chunkHeight * cSize * 1.5 +
            (x % 2 !== 0 ? (cSize * 1.5) * 2 : 0)); // Vertical offset with stagger

        chunks.push({
          key: `instance_${offsetX},${offsetZ}`,
          color: colors[index % 128],
          map: MAPS.MAP_0,
          position: [offsetX, 1, offsetZ] // Position based on the correct chunk offsets
        });
        index++
      }
    }
    return chunks;
  }, [ox, oz]);
  // const initialSpritesData2 = useMemo(() => {
  //   const spritesData = {}
  //   const cSize = 1
  //   for (let x = -2 + ox; x < 2 + ox; x++) {
  //     for (let z = -2 + oz; z < 2 + oz; z++) {
  //       // Horizontal distance between chunks
  //       const offsetX = x * chunkWidth * cSize * Math.sqrt(3); // Horizontal offset
  //       // Vertical distance between chunks, with row staggering
  //       const offsetZ =
  //         (z * chunkHeight * cSize * 1.5 +
  //           (x % 2 !== 0 ? (cSize * 1.5) * 2 : 0)); // Vertical offset with stagger

  //       const spritesDataChunk = Array.from({ length: 35 }, (_, index) => {
  //         const isSmall = Math.random() > 0.33
  //         const scale = isSmall ? 10 + Math.random() * 2 : 14 + Math.random() * 4
  //         const src = isSmall ? '/images/SmallPlant/PalmSmall_' : '/images/BigBush/Monsterra_'
  //         return generatePlant(index + "" + src, { src, scale, isSmall }, { spread: 256, ox: offsetX, oz: offsetZ })
  //       })
  //       spritesData[offsetX + "," + offsetZ] = spritesDataChunk
  //     }
  //   }
  //   return spritesData
  // }, [oz, ox])
  const initialRegionKey = useMemo(() => 0 + "," + 0, [])
  const [spritesData, setSpritesData] = useState({})
  /*
    [initialRegionKey]: (Array.from({ length: 35 }, (_, index) => {
      const isSmall = Math.random() > 0.33
      const scale = isSmall ? 10 + Math.random() * 2 : 14 + Math.random() * 4
      const src = isSmall ? '/images/SmallPlant/PalmSmall_' : '/images/BigBush/Monsterra_'
      const spriteKey = initialRegionKey + "_" + index + "_" + src
      return generatePlant(spriteKey, initialRegionKey, { src, scale, isSmall }, { spread: (CELL_SIZE * MAPS.MAP_0.length * Math.sqrt(3) * 2), ox: 0 * 2, oz: 0 * 2 })
    }))
  })*/
  // console.log('spritesDataFULL', spritesData)

  // const [distToSprite, setDistToSprite] = useState([0])
  // const [spriteFrame, setSpriteFrame] = useState([0])
  const posCamera = useMemo(() => new Vector3())

  const spriteRefs = useRef({})
  // const imgRefs = useRef([])
  // const camera = useThree(state => state.camera)
  // const generatePlants = useCallback((iox, ioz) => {
  //   setSpritesData(spritesDataChunks => {
  //     console.log('sprites chunks')
  //     return {
  //       ...spritesDataChunks,
  //       [iox + "," + ioz]: Array.from({ length: 35 }, (_, index) => {
  //         const isSmall = Math.random() > 0.33
  //         const scale = isSmall ? 10 + Math.random() * 2 : 14 + Math.random() * 4
  //         const src = isSmall ? '/images/SmallPlant/PalmSmall_' : '/images/BigBush/Monsterra_'
  //         return generatePlant(index + "" + src, { src, scale, isSmall }, { spread: 256, ox: iox, oz: ioz })
  //       })
  //     }
  //   })
  // }, [])
  const prevOx = useRef(0)
  const prevOz = useRef(0)
  useFrame((state) => {
    if (ecctrlRef.current) {
      let newOx = 0
      let newOz = 0
      try {
        const { x, y, z } = ecctrlRef.current.translation()


        // if has changed chunk
        newOx = -Math.floor((x / CELL_SIZE / MAPS.MAP_0.length) / Math.sqrt(3))
        newOz = -Math.floor((z / CELL_SIZE / MAPS.MAP_0.length) / 1.5)
        setOffset([newOx, newOz])
        // generatePlants(iox, ioz)
        // changed chunk
        // const initialSpritesData = useMemo(() => Array.from({ length: 100 }, (_, index) => {
        //   const isSmall = Math.random() > 0.33
        //   const scale = isSmall ? 10 +Math.random()*2 : 14 + Math.random() * 4
        //   const src = isSmall ? '/images/SmallPlant/PalmSmall_' : '/images/BigBush/Monsterra_'
        //   return generatePlant(index+""+src, { src, scale, isSmall }, { spread: 256, ox, oz})
        // }), [])


        setSpritesData(spritesDataChunks => {
          const newSpriteDataChunks = { ...spritesDataChunks }
          for (let ix = chunkStart; ix < chunkEnd; ix++) {
            for (let iz = chunkStart; iz < chunkEnd; iz++) {
              const regionKey = (newOx + ix) + "," + (newOz + iz)
              newSpriteDataChunks[regionKey] = spritesDataChunks[regionKey] || Array.from({ length: 100 }, (_, index) => {
                const existingTree = spritesDataChunks[regionKey]?.[index]
                if (existingTree) return existingTree
                const isSmall = Math.random() > 0.33
                const scale = isSmall ? 10 + Math.random() * 2 : 14 + Math.random() * 4
                const src = isSmall ? '/images/SmallPlant/PalmSmall_' : '/images/BigBush/Monsterra_'
                const spriteKey = regionKey + "_" + index + "_" + src
                return generatePlant(spriteKey, regionKey, { src, scale, isSmall }, { spread: (CELL_SIZE * MAPS.MAP_0.length * Math.sqrt(3)), ox: newOx +ix, oz: newOz + iz })
              })
            }
          }

          return newSpriteDataChunks

        })


      } catch (err) {
        console.error(err)
      }
      try {


        setSpritesData(spritesDataChunks => {
          const newSpritesData = {}
          for (let ix = chunkStart; ix < chunkEnd; ix++) {
            for (let iz = chunkStart; iz < chunkEnd; iz++) {
              const regionKey = (newOx + ix) + "," + (newOz + iz)
              newSpritesData[regionKey] = spritesDataChunks[regionKey].map((spriteData, i) => {
              const sprite = spriteRefs.current[spriteData.key]
              if (sprite) {
                // // first calculate angle between camera and sprite
                // // sprite is a drei Html component

                sprite.getWorldPosition(spriteData.posObject);



                state.camera.getWorldPosition(posCamera);

                const xDist = posCamera.x - spriteData.posObject.x;
                const zDist = posCamera.z - spriteData.posObject.z;
                const dist = Math.sqrt(xDist * xDist + zDist * zDist)
                // console.log('dist', dist)
                const angleRadians = Math.atan2(zDist, xDist);

                // const angleRadians = posSprite.angleTo(posCamera);
                const angle = angleRadians//Math.atan2(state.camera.position.x - sprite.position.x, state.camera.position.z - sprite.position.z)
                let newFrame;
                if (dist > 100) {
                  newFrame = spriteData.startFrame
                } else {
                  newFrame = Math.floor((-angle / (Math.PI * 2) + 0.5) * 24 + spriteData.startFrame) % 24
                }
                if (dist > 200) {
                  sprite.visible = false
                } else if (sprite.visible === false) {
                  sprite.visible = true
                }

                if(dist > 300) {

                }
                spriteData.frame = newFrame
                sprite.userData = {
                  ...sprite.userData || {},
                  frame: newFrame,
                  distance: dist
                }
              }
              return spriteData
            })
          }
        }
        return newSpritesData

          
      })

        // const angle = Math.atan2(state.camera.position.x, state.camera.position.z)
        // console.log('angle', angle)
        // const frame = Math.floor((angle/(Math.PI*2))*24)%24



      } catch (err) {
        console.error(err)
      }
    }

    return true
  })
  const [plants, setPlants] = useState([])
  useEffect(() => {
    const savePlantMaterials = async () => {
      const materialSources = [{
        src: '/images/BigBush/Monsterra_',
        count: 24,
        calculateScale: () => Math.random() * 4 + 14
      }, {
        src: '/images/SmallPlant/PalmSmall_',
        count: 24,
        calculateScale: () => Math.random() * 2 + 7
      }]
      const loader = new TextureLoader();
      const plantsWithMaterials = await Promise.all(materialSources.map(async ({ src, count, calculateScale }) => {
        const textureMaps = []
        for (let i = 0; i < count; i++) {
          // instantiate a loader
          textureMaps.push((
            new Promise((resolve, reject) => {
              loader.load(src + (i + 1).toString().padStart(4, '0') + '.png', (map) => {
                resolve(new SpriteMaterial({ map: map, color: 0xffffff, visible: true, opacity: 1, depthWrite: true, alphaTest: 0.5, transparent: true }))
              }, undefined, (err) => {
                reject(err)
                // resolve(new SpriteMaterial({color: 0xff0000, visible: true, opacity: 1 ,depthWrite: true }))
              })
            })
          ));

        }
        const readyTextureMapsForPlant = await Promise.all(textureMaps)

        return { src, textureMaps: readyTextureMapsForPlant, calculateScale }
      }))
      return plantsWithMaterials

    }
    savePlantMaterials().then(plants => {
      console.log('plants:', plants)
      setPlants(plants)
    })
      .catch(err => {
        console.error('error loading plant material', err)
      })
  }, [])
  const regionKey = ox + "," + oz
  return (
    <>
      {Object.entries(spritesData).map(([value, regionKey]) => {
        return regionKey.map(({ key: spriteKey, src, scale, position, distance, frame }, i) => {
          return (
            <Sprite key={spriteKey} scale={scale} plants={plants} plant={src} spriteRef={node => {
              if (node) {
                spriteRefs.current[spriteKey] = node
              }
            }} distance={distance} position={position} frame={frame} dispose={null} />)
        })
      })}
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
        <Chunk {...chunk} key={chunk.key} />
      ))}
      <axesHelper args={[50]} />
    </>
  );
}
export default Level0;
