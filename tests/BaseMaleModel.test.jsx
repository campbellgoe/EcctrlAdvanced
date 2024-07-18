import React from 'react';
import { create, act } from '@react-three/test-renderer';
import { Canvas, extend, useFrame  } from '@react-three/fiber';
import { Model as BaseMale } from '../src/components/models/BaseMale.jsx'
import * as THREE from 'three';

// Extend with any additional objects or materials
extend({ THREE });

const Mesh = () => {
  const meshRef = React.useRef()
  useFrame((_, delta) => {
    meshRef.current.rotation.x += delta
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2]} />
      <meshBasicMaterial />
    </mesh>
  )
}

test('first test', async () => {

  const renderer = await create(<Mesh />)

  expect(renderer.scene.children[0].instance.rotation.x).toEqual(0)
  
  await act(async () => {
    await renderer.advanceFrames(2, 1)
  })
  
  expect(renderer.scene.children[0].instance.rotation.x).toEqual(2)
});
