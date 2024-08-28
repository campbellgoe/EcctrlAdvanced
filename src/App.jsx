// import all neccesary code for the App
import { Canvas } from '@react-three/fiber'
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
import { useControls } from 'leva'

import { isMobile } from 'react-device-detect';

// import constants
import { INTRO, NO_PLAYER, ECCTRL, ECCTRL_WITHOUT_KEYBOARD } from '@/consts.js'


import { BackSide, MeshStandardMaterial } from 'three'

import BaseCharacter from '@/components/BaseCharacter'

import { DepthOfField, EffectComposer} from '@react-three/postprocessing'
import { ErrorBoundary } from "react-error-boundary";
import clsx from 'clsx'
import Level0, { CELL_SIZE, MAPS } from './components/Level0'
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

const MyEnvironmentSphere = () => {
  const envSphereProps = useTexture({
    map: 'night.png',
  })
  return <Sphere scale={700}>
    <meshBasicMaterial {...envSphereProps} side={BackSide} />
  </Sphere>
}
export const EcctrlContainer = forwardRef(({ ecctrlProps, position, characterURL, animationSet, yDist, character}, ecctrlRef) => {
  // this is the main jsx without keyboard controls
return <Ecctrl {...ecctrlProps} dampingC={0.1} floatingDis={yDist * 2/*1.5*/} ref={ecctrlRef} autoBalance={false} animated position={position} jumpVel={9.4} maxVelLimit={10} camCollision={false}>
  <EcctrlAnimation characterURL={characterURL} animationSet={animationSet}>
    {/* <CuboidCollider args={[0.5, 1, 0.2]} mass={0} position-y={-yDist} />
    <Box args={[0.5, 1,0.2]} position-y={-yDist} /> */}
    <BaseCharacter position-y={-0.65 - yDist} scale={1}/>
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
     const x = -20
     const z = -20

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
      minY: -10,
      hasPointerLock: true,
    },
  }
  // the current level data for this level
  const currentLevelData = levelData[level]


  // intro level is used for multiple levels
  // here's the jsx to share for that
  
 const LEVELS = {
  [INTRO]: {
    Key: 'INTRO',
    Value: (<Level0 
    introStartPosition={introStartPosition}
    floorColor={0xff9966} 
    ecctrlRef={ecctrlRef}/>)
  }
 }
 const levels = {
  [INTRO]: LEVELS[INTRO].Value
 }
  // TODO: these controls can be removed in the final version
  const [{ lvl, resetGameSaveData }, set] = useControls(() => ({
    lvl: level,
    levels: { value: LEVELS[INTRO].Key },
    resetGameSaveData: false
  }))

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
    set({ lvl: level })
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
  useEffect(() => {
    if (lvl in levelData) {
      setLevel(lvl)
    }
  }, [lvl])
  const yDist = 0.35
  const ecctrlProps = {
    capsuleRadius: yDist,
    floatHeight: yDist,
    camInitDis: -5,
  camMaxDis: -50,
  camMinDis: -2,
  camZoomSpeed: 4,
  camCollision: false
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
  return (
    <div className="w-[100vw]">
      <div style={{ width: "100vw", height: "100vh" }} className="fixed top-0">
        <ErrorBoundary fallback={errorBoundaryJsx}>
          <Suspense fallback={loadingJsx}>
            {showJoystick && <EcctrlJoystick buttonNumber={0} ref={ecctrlJoystickRef} />}
            <Canvas
              ref={ref}
              shadows
              linear
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
              {!inView && <DisableRender />}
              <Perf position="top-left" minimal />
              <Suspense fallback={<MyEnvironmentSphere />}>{<Environment background files="/night.hdr" />}</Suspense>
              <LevelLightsAndExtras level={level} />
              {[ECCTRL, ECCTRL_WITHOUT_KEYBOARD].includes(currentLevelData.type) && <Suspense fallback={null}>
                <Physics timeStep="vary">
                  <Respawn minY={currentLevelData.minY} ecctrlRef={ecctrlRef} setPos={setPos} respawnPosition={currentLevelData.respawnPosition} />
                  {ecctrlJsx}
                  {levels[level]}
                </Physics>
              </Suspense>}
              {currentLevelData.type === NO_PLAYER && <Suspense fallback={null}>{levels[level]}</Suspense>}
              {!tier && <MyEnvironmentSphere />}
              {effectsJsx}
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>

    </div>
  )
}