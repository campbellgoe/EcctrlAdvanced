// import all neccesary code for the App
import { Canvas, useFrame, useLoader} from '@react-three/fiber'
import { Physics, CuboidCollider } from '@react-three/rapier'
import { Environment, KeyboardControls, Sphere, useTexture, useDetectGPU, Box } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useRef, useState, Suspense, useEffect, useCallback, forwardRef, useMemo } from 'react'
import Ecctrl, { EcctrlAnimation, EcctrlJoystick } from 'ecctrl'
import LevelLightsAndExtras from '@/LevelLightsAndExtras.jsx'

import { useInView } from 'react-intersection-observer'
import { Respawn, DisableRender } from '@/utils'

import { localStorageKey, PersistentAppProvider, usePersistentAppContext } from "@/state/PersistentStateProvider";
import { EphemeralAppProvider, useEphemeralAppContext } from '@/state/EphemeralStateProvider'
// import { useControls } from 'leva'

// import { isMobile } from 'react-device-detect';

// import constants
import { INTRO, NO_PLAYER, ECCTRL, ECCTRL_WITHOUT_KEYBOARD } from '@/consts.js'


import { BackSide, Vector3 , TextureLoader, CatmullRomCurve3, Clock } from 'three'

import BaseCharacter from '@/components/BaseCharacter'

import { DepthOfField, EffectComposer} from '@react-three/postprocessing'
import { ErrorBoundary } from "react-error-boundary";
// import clsx from 'clsx'
import Level0, { CELL_SIZE, MAPS } from './components/Level0'
function ParallaxLayer({ textureUrl, depth, x = 0, y = 0, transparency  = 1 }) {
  const layerRef = useRef();
  const [texture] = useLoader(TextureLoader, [textureUrl]);
  useFrame((state) => {
    if (layerRef.current) {
      // Adjust positions for parallax effect, targeting +z
      // layerRef.current.position.x = state.camera.position.x * speed;
      // layerRef.current.position.y = state.camera.position.y * speed;
      // layerRef.current.position.z = state.camera.position.z + depth;
    }
  });

  return (
    <mesh ref={layerRef} position={[x, y,depth]} {...(transparency < 1 ? { alphaTest: 0.5, depthWrite: true } : {})}>
      <planeGeometry args={[50, 25]} />
      <meshBasicMaterial map={texture} alphaTest={0.5} depthWrite={true} {...(transparency < 1 ? { transparent: true, opacity: transparency } : {})}/>
    </mesh>
  );
}
// wrap app in context for accessing persistent state such as level and selected character
const errorBoundaryJsx = <div className="p-8">
<h1 className="text-3xl text-red-950 bg-red-300">⚠️Something went wrong.</h1>
<ol>
  <li><p><span>1. </span>Click this button to <button className="border-2 border-blue-500 hover:bg-blue-950" onClick={() => {
    localStorage.removeItem(localStorageKey)
  }}>Reset all game state</button></p></li>
  <li><p><span>2. </span><a href="/">Refresh</a> the page</p></li>
</ol>
</div>

export default function AppMain({ overrideLevel = null }) {
  return <ErrorBoundary fallback={errorBoundaryJsx}><EphemeralAppProvider><PersistentAppProvider><App overrideLevel={overrideLevel}/></PersistentAppProvider></EphemeralAppProvider></ErrorBoundary>
}

// Player component using spritesheet animation
function Player({ playerRef, path, ecctrlRef }) {
  const [frame, setFrame] = useState(0);
  const [texture] = useLoader(TextureLoader, ['/images/player/rabbitwalkinganimation.webp']);
// const clock = useMemo(() => new Clock(), [])
  // Update the player movement following the path
  useFrame((state, delta) => {
    // Update player position by following the path
    try {
      // lerp player along curve
      // const t = (clock.getElapsedTime() % 64) / 64;
      // const position = path.getPointAt(t);
      // if (position && playerRef.current) {
      //   playerRef.current.position.lerp(position, 0.01)
      // }

    // Lerp sprite player to camera center
// const lookAtVector = new Vector3(0, 0, -1);

// Transform the lookAtVector to world space using the camera's quaternion and position
// lookAtVector.applyQuaternion(state.camera.quaternion).add(position);
try {
  const pos = ecctrlRef.current.translation()
  // Ensure the playerRef is valid before applying the lerp
  if (pos && playerRef.current) {
      // Lerp the player sprite position towards the calculated vector
      playerRef.current.position.lerp(pos, 0.015);
  }
} catch(err){

}


       // Update the animation frame of the sprite
      const totalFrames = 4; // Assuming 4 frames in the spritesheet (4x1 layout)
      setFrame((prev) => {
        return prev + 1 * delta * 3
      })
      if (playerRef.current) {
        const frameWidth = 1 / totalFrames;
        const offsetX = (Math.floor(frame*1) % totalFrames) * frameWidth;
        playerRef.current.material.map.offset.set(offsetX, 0);
        playerRef.current.material.map.repeat.set(frameWidth, 1);
      }
    } catch(err){
      console.error("AHH", err)
    }
  });

  return (
    <sprite ref={playerRef} scale={[0.5, 1, 1]}>
      <spriteMaterial map={texture} alphaTest={0.5} depthWrite={true}/>
    </sprite>
  );
}

const MyEnvironmentSphere = () => {
  const envSphereProps = useTexture({
    map: 'night.png',
  })
  return <Sphere scale={700}>
    <meshBasicMaterial {...envSphereProps} side={BackSide} />
  </Sphere>
}
function CameraFollow({ pos, setCamPos, setCamTarget }) {
  const newCamPos = useMemo(() => new Vector3(), [])
  useFrame((state) => {
    if (pos) {
      // setCamPos({ x: pos.x, y: pos.y + 2, z: pos.z - 5 })
      // setCamTarget(pos)
      // state.camera.position.lerp(pos, 0.001)
      state.camera.lookAt(pos);
      const camPos = state.camera.position
      //setCamPos({ x: pos[0], y: camPos[1], z: camPos[2] - 5 })
      newCamPos.set(pos.x-5, camPos.y, camPos.z < 15 ? camPos.z+5 : camPos.z)
      state.camera.position.lerp(newCamPos, 0.16)
      const lookAtVector = new Vector3(0, 0, -1);

      // Transform the lookAtVector to world space using the camera's quaternion and position
      lookAtVector.applyQuaternion(state.camera.quaternion).add(state.camera.position);

      // Ensure the playerRef is valid before applying the lerp
      if (lookAtVector) {
        
        // TODO: set camera target each time reach a new area or follow along x path
        setCamTarget({ x: -10, y: lookAtVector[1], z: lookAtVector[2]})
        // state.camera.position.lerp(lookAtVector, wwwwwwwwwdddddddddWA0.01)
          // Lerp the player sprite position towards the calculated vector
          // playerRef.current.position.lerp(lookAtVector, 0.01);
      }
    }
  });
  return null;
}
export const EcctrlContainer = forwardRef(({ ecctrlProps, position, characterURL, animationSet, yDist, character}, ecctrlRef) => {
  const xpos = useMemo(() => {
    try { 
    const pos = ecctrlRef.current?.translation()
    return {
      ...position[0] != pos.x ? { "position-x": position[0]} : {}, 
      ...position[1] != pos.y ? { "position-y": position[1]} : {},
      ...position[2] != pos.z ? { "position-z": position[2]} : {},
    }
    } catch(err){
      return {}
    }
  }, [position])
  // this is the main jsx without keyboard controls
return <Ecctrl ref={ecctrlRef} autoBalance={false} animated {...xpos} jumpVel={9.4} maxVelLimit={10} camCollision={false} {...ecctrlProps}>
  <EcctrlAnimation characterURL={characterURL} animationSet={animationSet}>
    {/* <CuboidCollider args={[1, 2, 1]} mass={0} position-y={-yDist+1} position-z={-1} /> */}
    {/* <Box args={[1, 2,1]} position-y={-yDist+1} position-z={-1} /> */}
    <BaseCharacter position-y={-yDist} position-z={-1} scale={1}/>
  </EcctrlAnimation>
</Ecctrl>
})


function App({ overrideLevel = null }) {
  /**
  * Keyboard control preset
  */
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
    { name: 'action1', keys: ['1'] },
    { name: 'action2', keys: ['2'] },
    { name: 'action3', keys: ['3'] },
    { name: 'action4', keys: ['KeyF'] }
  ]


  /**
   * Character animation set preset
   */

  const animationSet = {
    idle: 'CharacterArmature|Idle',
    walk: 'CharacterArmature|Walk',
    run: 'CharacterArmature|Run',
    jump: 'CharacterArmature|Jump',
    jumpIdle: 'CharacterArmature|Jump_Idle',
    jumpLand: 'CharacterArmature|Jump_Land',
    fall: 'CharacterArmature|Duck', // This is for falling from high sky
    action1: 'CharacterArmature|Wave',
    action2: 'CharacterArmature|Death',
    action3: 'CharacterArmature|HitReact',
    action4: 'CharacterArmature|Punch'
  }
  // shows the keyboard controls legend
  const [showControls, setShowControls] = useState(false)

  // get and set level, character, collected tokens (persistently)
  const persistentStateDispatch = usePersistentAppContext()
  const ephemeralStateDispatch = useEphemeralAppContext()
  const { state, dispatch } = persistentStateDispatch
  const { state: ephemeralState, dispatch: ephemeralDispatch } = ephemeralStateDispatch
  const { ready } = ephemeralState
  const { ref, inView } = useInView()
  const level = state.level || INTRO

  const setLevel = newLevel => dispatch({ type: 'SET_LEVEL', payload: { level: newLevel } })
  const character = state.character
  // const setCharacter = character => dispatch({ type: 'SET_CHARACTER', character })
    /**
   * Character url preset
   */
  const characterUrlFromCharacter = useMemo(() => {
      const map ={
        undefined: '',
        '': '',
        'demon': './Demon-transformed.glb',
      }
      if(!(character in map)) throw new Error(`Character ${character} not found in character map`)
      return map[character]
  }, [character])
    const characterURL = characterUrlFromCharacter
    //'./characters/TestModel4-transformed.glb'

  // position of the character on start intro level
  const {MAP_0} = MAPS
  const introStartPosition = useMemo(() => {
     const y = 40
     const x = 0
     const z = 0

    return [
      x,y,z
    ]
  }, [])
  // position to set the player in the world
  const [pos, setPos] = useState(introStartPosition)


  // a reference to ecctrl
  const ecctrlRef = useRef()
  // returns the current player position or a default position
  const calculatePosition = useCallback((pos) => {
    if (ecctrlRef.current) {
      try {
        const { x, y, z } = ecctrlRef.current.translation()
        return [x, y, z]
      } catch (err) {

      }
    }
    return pos
  }, [])
  // defines level data such as whether its ecctrl or without input or a cut scene
  const levelData = {
    [INTRO]: {
      type: ECCTRL,
      // uses introStartPosition or the player position from the previous level
      position: calculatePosition(introStartPosition),
      respawnPosition: introStartPosition,
      minY: -12.01,
      hasPointerLock: true,
    },
  }
  // the current level data for this level
  const currentLevelData = levelData[level]


  // intro level is used for multiple levels
  // here's the jsx to share for that
  const scenes = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => i)
  }, [])
 const LEVELS = {
  [INTRO]: {
    Key: 'INTRO',
    Value: (<Level0 
      scenes={scenes}
      onReady={() => {
        ephemeralDispatch({ type: 'SET_READY', ready: true })
      }}
    introStartPosition={introStartPosition}
    floorColor={0xff9966} 
    ecctrlRef={ecctrlRef}/>)
  }
 }
 const levels = {
  [INTRO]: LEVELS[INTRO].Value
 }
 const resetGameSaveData = false
  // TODO: these controls can be removed in the final version
  // const [{ lvl, resetGameSaveData }, set] = useControls(() => ({
  //   lvl: level,
  //   levels: { value: LEVELS[INTRO].Key },
  //   resetGameSaveData: false
  // }))

  // resets the game if resetGameSaveData is true
  useEffect(() => {
    if(resetGameSaveData === true){
      localStorage.removeItem(localStorageKey)
      location.reload()
    }
  }, [resetGameSaveData])


  // TODO: this can be extacted into a custom hook e.g. useUpdateLevel?
  useEffect(() => {
    // TODO: this can be removed
    // set({ lvl: level })
    // if intro level, show keyboard controls ui
    if (level === INTRO) {
      setShowControls(true)
    }
    // if the current level has a position (that can be a function that evaluates to a position or a position)
    // set the player to that position or calculated position
    const newPos = currentLevelData?.position
    if (newPos) {
      if (typeof newPos == 'function') {
        const val = newPos()
        setPos(val)
        // set({ position: val })
      } else if (Array.isArray(newPos)) {
        setPos(newPos)
        // set({ position: newPos })
      }
    }
  }, [level])
  // TODO: can remove this. it sets the level on entering it into the leva control
  // useEffect(() => {
  //   if (lvl in levelData) {
  //     setLevel(lvl)
  //   }
  // }, [lvl])
  const yDist = -0.15
  const floatHeight = 0.3;
  const capsuleRadius = 0.3
  const capsuleHalfHeight = 0.35
  const floatingDis = capsuleRadius + floatHeight
  const followLightPos = { x: 25, y: 0, z: -0.5}
  const disableFollowCam = true; // Disable follow camera feature
  const [disableFollowCamPos, setCamPos] =  useState({ x: 0, y: 0, z: -5 }); // Camera position when the follow camera feature is disabled
  const [disableFollowCamTarget, setCamTarget] =  useState({ x: 0, y: 0, z: 0 });
  const ecctrlProps = {
    disableFollowCam,
    disableFollowCamPos,
    disableFollowCamTarget,
    followLightPos,
    capsuleRadius,
    floatingDis,
    floatHeight,
    capsuleHalfHeight,
    bodySensorSize: [capsuleHalfHeight / 2, capsuleRadius], // cylinder body sensor [halfHeight, radius]
  bodySensorPosition: { x: 0, y: 0, z: capsuleRadius / 2 },
    // first person settings
    camCollision: false, // disable camera collision detect (useless in FP mode)
    // rayLength: 0.125,
  // camInitDis:-0.01, // camera intial position
  //  camMinDis:.1, // camera zoom in closest position
  // camFollowMult: 1000, // give a big number here, so the camera follows the target (character) instantly
  // camLerpMult: 1000, // give a big number here, so the camera lerp to the followCam position instantly
  // turnVelMultiplier: 1, // Turning speed same as moving speed
  // turnSpeed: 100, // give it big turning speed to prevent turning wait time
  mode:"CameraBasedMovement", //"FixedCamera",
  //   camInitDis: -5,
  camMaxDis: 25,
  camFollowMult: 0,
   camMinDis: 2,
  // camZoomSpeed: 4,
  // camCollision: false
  }
  const ecctrlContainerProps = {
    ecctrlProps, position: pos, characterURL, animationSet, yDist, character
  }
const mainJsx = (<EcctrlContainer ref={ecctrlRef} {...ecctrlContainerProps} />)
  // with keyboard controls
  const mainWithInputJsx = (<KeyboardControls map={keyboardMap}>
    {mainJsx}
  </KeyboardControls>)

  //get the jsx for this level type
  const jsx = {
    [ECCTRL]: mainWithInputJsx,
    [ECCTRL_WITHOUT_KEYBOARD]: mainJsx,
    [NO_PLAYER]: null,
  }
  const ecctrlJsx = jsx[currentLevelData.type]
  const ecctrlJoystickRef = useRef()


  const showJoystick = currentLevelData.type === ECCTRL
  const loadingJsx = <div>Loading...</div>

  const GPUTier = useDetectGPU()
  const tier = (GPUTier.tier < 4  || GPUTier.isMobile)
  const effectsJsx = tier ? null : <EffectComposer>
  <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
  
                </EffectComposer>
                useEffect(() => {
                  setTimeout(() => {
                    const loadingEl =document.getElementById("loading-screen")
                    loadingEl.style.display = "none"
                  }, 2500)
                }, [ready])
  const curvedPath = useMemo(() => new CatmullRomCurve3([
    new Vector3(-25, 0, 0),
    new Vector3(0, 0, 0),
    new Vector3(5, 5, 0),
    new Vector3(10, 0, 0),
    new Vector3(15, 5, 0),
    new Vector3(25, 0, 0),
  ]), [])
  const playerRef = useRef();
  const posi = useMemo(() => {
    const vec = new Vector3()
    try {
      const pos = ecctrlRef.current.translation()
      vec.set(pos.x, pos.y+4, pos.z+2)
    } catch(err){
    }
    return vec
  })
  const { scene: { position: scenePos }} = useMemo(() => ({
    scene: {
      position: new Vector3(0, 5, 0)
    }
  }), [])
  
  return (
    <div className="w-[100vw]">
      <div style={{ width: "100vw", height: "100vh" }} className="fixed top-0">
        <ErrorBoundary fallback={errorBoundaryJsx}>
          <Suspense fallback={loadingJsx}>
            {showJoystick && <EcctrlJoystick buttonNumber={0} ref={ecctrlJoystickRef} />}
            <Canvas
              camera={{ position: [0, 5, 15], fov: 50 }}
              ref={ref}
              shadows
              flat
              onPointerDown={(e) => {
                if (currentLevelData.type === ECCTRL && currentLevelData.hasPointerLock) {
                  if (e.pointerType === "mouse") {
                    try {
                    e.target.requestPointerLock();
                    } catch(err){
                      console.warn("Unable to enter pointer lock.")
                    }
                  }
                }
              }}
            >
              <Suspense fallback={null}>
                {!inView && <DisableRender />}
                <Perf position="top-left" minimal />
                <Suspense fallback={<MyEnvironmentSphere />}>{<Environment background files="/night.hdr" />}</Suspense>
                <LevelLightsAndExtras level={level} />
                {/* Parallax Layers */}
                {/* <ParallaxLayer factor={0.5} speed={0.1}>
                  <mesh position={[0, 0, -5]}>
                    <planeGeometry args={[50, 50]} />
                    <meshStandardMaterial map={bgTexture} />
                  </mesh>
                </ParallaxLayer> */}
                {scenes.map((layer, index) => {
                  return <>
                  <ParallaxLayer textureUrl={'/images/layers/bg-cavern-a.webp'}  depth={-15} {...{ ...scenePos, x: scenePos.x + index*50, y: scenePos.y + 2}} />
                <ParallaxLayer textureUrl={'/images/layers/mg-cavern-left.webp'} depth={-6.5} {...{ ...scenePos, x: scenePos.x + index*50, y: scenePos.y - 4.5}}/>
                <ParallaxLayer textureUrl={'/images/layers/mg-cavern-right.webp'} depth={-7.5} {...{ ...scenePos, x: scenePos.x + index*50, y: scenePos.y - 4.5}}/>
                <ParallaxLayer textureUrl={'/images/layers/fg-cavern.webp'} depth={-5} {...{ ...scenePos, x: scenePos.x + index*50, y: scenePos.y - 4.5}}/>
                <ParallaxLayer textureUrl={'/images/layers/crystal-big-a.webp'} depth={4} {...{ ...scenePos, x: scenePos.x + 1+index*50}} transparency={0.75}/>
                {/* <ParallaxLayer textureUrl={'/images/layers/crystal-a.webp'} depth={-8} {...{ ...scenePos, x: scenePos.x + index*50}} transparency={0.75}/>
                <ParallaxLayer textureUrl={'/images/layers/crystal-b.webp'} depth={-10} {...{ ...scenePos, x: scenePos.x + index*50}} transparency={0.75}/> */}
                <ParallaxLayer textureUrl={'/images/layers/stalagtite-a.webp'} depth={-3} {...{...scenePos, x: scenePos.x + index * 50, y: scenePos.y -2}} />
                <ParallaxLayer textureUrl={'/images/layers/stalagtite-b.webp'} depth={-9} {...{...scenePos, x: scenePos.x + index * 50, y: scenePos.y - 2}} />
                </>
                })}

                {/* <ParallaxLayer textureUrl={'/midground.png'} speed={0.3} depth={-3} /> */}
                {/* <ParallaxLayer textureUrl={'/foreground.png'} speed={0.5} depth={-1} /> */}

                <CameraFollow pos={posi} setCamPos={setCamPos} setCamTarget={setCamTarget} />
                {[ECCTRL, ECCTRL_WITHOUT_KEYBOARD].includes(currentLevelData.type) && <Suspense fallback={null}>
                  <Physics timeStep="vary">
                    <Respawn minY={currentLevelData.minY} ecctrlRef={ecctrlRef} setPos={setPos} respawnPosition={currentLevelData.respawnPosition} />
                    <Player playerRef={playerRef} path={curvedPath} ecctrlRef={ecctrlRef}/>
                    {ecctrlJsx}
                    {levels[level]}
                  </Physics>
                </Suspense>}
                {currentLevelData.type === NO_PLAYER && <Suspense fallback={null}>{levels[level]}</Suspense>}
                {!tier && <MyEnvironmentSphere />}
                {effectsJsx}
                {/* <FollowCharacterSpotlight position={[pos[0], pos[1]+4, pos[2]]} /> */}
                {/* <UpdatePositionWithCharacter setPos={setPos} ecctrlRef={ecctrlRef} /> */}
              </Suspense>
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>

    </div>
  )
}
// function FollowCharacterSpotlight({ vec = new Vector3(), position, ...props }){
//   const depthBuffer = useDepthBuffer({ frames: 2  })
//   const spotlightRef = useRef(null)
//   // useHelper(spotlightRef, SpotLightHelper, 'cyan')
//   useFrame((state, delta) => {
//     spotlightRef.current.target.position.lerp(vec.set(position[0], position[1]-10, position[2]), 0.3)
//     spotlightRef.current.target.updateMatrixWorld()
//     // spotlightRef.current.target.update();
//     return true
//   })
//   return <SpotLight ref={spotlightRef} castShadow position={[position[0], position[1]+0.15, position[2]]} color={0xffddff} penumbra={2} distance={6} angle={1} attenuation={5} anglePower={4} intensity={4*Math.PI} depthBuffer={depthBuffer} decay={0} {...props}/>
// }

// function UpdatePositionWithCharacter({ ecctrlRef, setPos }){
//   useFrame(() => {
//     try {
//       const { x, y, z } = ecctrlRef.current.translation()
//       if(Math.random()>0.9) setPos([x, y, z])
//     } catch(err){

//     }
//     return true
//   })
// }