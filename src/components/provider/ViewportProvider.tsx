import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { isMobileAtom } from '@/store/viewport'

export function ViewportProvider() {
  const setIsMobile = useSetAtom(isMobileAtom)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    setIsMobile(!query.matches)

    function handleResize(event: MediaQueryListEvent) {
      setIsMobile(!event.matches)
    }

    query.addEventListener('change', handleResize)
    return () => {
      query.removeEventListener('change', handleResize)
    }
  }, [setIsMobile])

  return null
}
