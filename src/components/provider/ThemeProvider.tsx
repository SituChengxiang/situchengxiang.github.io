import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { getSystemTheme, changePageTheme, setLocalTheme } from '@/utils/theme'
import { themeAtom } from '@/store/theme'

export function ThemeProvider() {
  const theme = useAtomValue(themeAtom)

  useEffect(() => {
    setLocalTheme(theme)

    if (theme === 'system') {
      changePageTheme(getSystemTheme())
    } else {
      changePageTheme(theme)
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)')

    function handlePrefersColorSchemeChange(event: MediaQueryListEvent) {
      if (theme === 'system') {
        changePageTheme(event.matches ? 'dark' : 'light')
      }
    }

    query.addEventListener('change', handlePrefersColorSchemeChange)

    return () => {
      query.removeEventListener('change', handlePrefersColorSchemeChange)
    }
  }, [theme])

  return null
}
