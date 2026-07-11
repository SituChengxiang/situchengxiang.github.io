import { themeAtom } from '@/store/theme'
import { useAtom } from 'jotai'

export function ThemeSwitch() {
  const [theme, setTheme] = useAtom(themeAtom)

  const isDark = theme === 'dark'

  return (
    <button
      className="size-9 rounded-full border border-primary bg-white/50 dark:bg-zinc-800/50 backdrop-blur flex items-center justify-center"
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <i className={`iconfont ${isDark ? 'icon-sun' : 'icon-moon'}`}></i>
    </button>
  )
}
