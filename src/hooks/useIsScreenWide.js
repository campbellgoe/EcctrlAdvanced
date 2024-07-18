import { useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
const useIsScreenWide = () => {
  const [isWide, setIsWide] = useState(!isMobile)
  useEffect(() => {
    if(typeof window != 'undefined'){
      const handleResize = () => {
        setIsWide(window.innerWidth > window.innerHeight)
      }
      window.addEventListener('resize', handleResize, false)
      handleResize()
      return () => {
        window.removeEventListener('resize', handleResize, false)
      }
    }
  }, [])
  return isWide
}

export default useIsScreenWide