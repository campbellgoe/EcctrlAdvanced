import { INTRO } from '@/consts.js'
export default function LevelExtras({ level }) {
  const introJsx = <>
  <hemisphereLight
    args={[ 'green', 'green', Math.PI * 0.33]}
    />
  </>
  const data = {
    [INTRO]: introJsx,
  }
  return (
    <>
      <directionalLight
        intensity={Math.PI * 0.7}
        color={'#FFFFED'}
        castShadow
        shadow-bias={0}
        shadow-normalBias={0.02}
        position={[0,50,0]}
        shadow-mapSize-width={1024*2} // Setting shadow map size, smaller cheaper - larger more expensive
        shadow-mapSize-height={1024*2}
        shadow-camera-near={20} // Defining shadow frustum
        shadow-camera-far={80}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <ambientLight intensity={Math.PI * 0.2}/>
      {data[level]}
    </>
  )
}
