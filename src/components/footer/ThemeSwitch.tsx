import { themeAtom } from '@/store/theme'
import { useAtom } from 'jotai'

type Theme = 'light' | 'dark' | 'system'

const nextTheme: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }
const icons: Record<Theme, string> = { light: 'icon-sun', dark: 'icon-moon', system: 'icon-computer' }
const labels: Record<Theme, string> = { light: '亮色模式', dark: '暗色模式', system: '跟随系统' }

export function ThemeSwitch() {
  const [theme, setTheme] = useAtom(themeAtom)

  const current = (theme as Theme)

  return (
    <button
      className="size-9 rounded-full border border-primary bg-white dark:bg-zinc-800 flex items-center justify-center"
      type="button"
      aria-label={labels[current]}
      onClick={() => setTheme(nextTheme[current])}
    >
      <i className={`iconfont ${icons[current]}`}></i>
    </button>
  )
}
