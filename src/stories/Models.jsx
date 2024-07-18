import React, { Suspense } from 'react';

import { Model as BaseMale } from '../components/models/BaseMale'
import { Canvas } from '@react-three/fiber';
import BaseCharacter from '../components/models/BaseCharacter';

export const ModelViewer = ({ children }) => {
  return <div style={{ width: "100vw", height: "100vh" }} className="fixed top-0">
        <Suspense fallback={<p>Loading...</p>}><Canvas   shadows
  linear
  flat>
    <directionalLight
        intensity={Math.PI * 0.7}
        color={'#FFFFED'}
        castShadow
        shadow-bias={0}
        shadow-normalBias={0.02}
        position={[0,50, 0]}
        shadow-mapSize-width={2048} // Setting shadow map size
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5} // Defining shadow frustum
        shadow-camera-far={500}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <ambientLight intensity={Math.PI * 0.2}/>
    {children}
  </Canvas></Suspense></div>
}
export const BaseMaleComponent = () => {
  return <ModelViewer><BaseMale /></ModelViewer>
}
export const BaseFemaleComponent = () => {
  return <ModelViewer><BaseCharacter character="female" /></ModelViewer>
}