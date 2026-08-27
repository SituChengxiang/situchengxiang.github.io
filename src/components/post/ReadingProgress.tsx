import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { pageScrollLocationAtom } from '@/store/scrollInfo'
import { floor } from 'lodash-es'

export function ReadingProgress() {
  const scrollY = useAtomValue(pageScrollLocationAtom)

  const percent = useMemo(() => {
    if (typeof document === 'undefined') return 0
    const $article = document.querySelector('#markdown-wrapper')
    if (!$article) return 0

    const { offsetHeight, offsetTop } = $article as HTMLElement
    const fullHeight = offsetHeight + offsetTop - window.innerHeight

    if (scrollY > fullHeight) {
      return 100
    }
    return floor((scrollY / fullHeight) * 100)
  }, [scrollY])

  return (
    <div>
      <span className="text-sm">进度 {percent}%</span>
    </div>
  )
}
