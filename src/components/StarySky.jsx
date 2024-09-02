import React, { useRef , useMemo} from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Clock, ShaderMaterial } from 'three'

const StarrySky = ({ position, ...props }) => {
  const materialRef = useRef(null)
  const clock = new Clock()
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
    return true
  })

  const vertexShader = `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    varying vec3 vPosition;

    #define PI 3.14159265359

    float random(vec3 st) {
      return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 45.5432))) * 43758.5453123);
    }

    // 3D Noise function
    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(random(i), random(i + vec3(1, 0, 0)), f.x),
                     mix(random(i + vec3(0, 1, 0)), random(i + vec3(1, 1, 0)), f.x), f.y),
                 mix(mix(random(i + vec3(0, 0, 1)), random(i + vec3(1, 0, 1)), f.x),
                     mix(random(i + vec3(0, 1, 1)), random(i + vec3(1, 1, 1)), f.x), f.y), f.z);
    }

    void main() {
      vec3 pos = normalize(vPosition);
      float time = uTime * 0.05;

      // Create swirling effect
      vec2 swirl = vec2(
        sin(pos.y * 10.0 + time) * 0.1,
        cos(pos.x * 10.0 + time) * 0.1
      );

      // Create stars
      float stars = step(0.99, random(floor(pos * 100.0 + time)));

      // Create color gradients using 3D noise
      vec3 color = mix(
        vec3(0.0, 0.0, 0.3),  // Dark blue
        vec3(0.5, 0.7, 1.0),  // Light blue
        noise(pos * 3.0 + time * 0.1)
      );

      // Add yellow tint to simulate moon glow
      color += vec3(0.5, 0.3, 0.0) * (1.0 - pos.y) * 0.5;

      // Add swirling effect
      color += vec3(0.1, 0.2, 0.3) * (sin(pos.x * 20.0 + swirl.x) * 0.5 + 0.5);
      color += vec3(0.1, 0.2, 0.3) * (cos(pos.y * 20.0 + swirl.y) * 0.5 + 0.5);

      // Add stars
      color += vec3(1.0) * stars;

      gl_FragColor = vec4(color, 1.0);
    }
  `

  return (
    <mesh position={position} {...props}>
      <sphereGeometry args={[10, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 }
        }}
        side={BackSide}
      />
    </mesh>
  )
}

export default function Component() {
  return (
    <>
        <ambientLight intensity={0.1*Math.PI} />
        <StarrySky />
    </>
  )
}