'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = React.PropsWithChildren<{
  attribute?: 'class' | 'data-theme'
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}>

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme, attribute: 'class' | 'data-theme', disableTransitionOnChange?: boolean) {
  if (typeof document === 'undefined') return

  const resolved = theme === 'system' ? getSystemTheme() : theme
  const root = document.documentElement

  if (disableTransitionOnChange) {
    const style = document.createElement('style')
    style.appendChild(document.createTextNode('*{transition:none !important}'))
    document.head.appendChild(style)
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      style.remove()
    })
  }

  if (attribute === 'class') {
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  } else {
    root.setAttribute('data-theme', resolved)
  }

  root.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const systemTheme = React.useMemo(() => getSystemTheme(), [])
  const resolvedTheme = theme === 'system' && enableSystem ? systemTheme : theme === 'system' ? 'light' : theme

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem('theme') as Theme | null
    const nextTheme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : defaultTheme
    setThemeState(nextTheme)
  }, [defaultTheme])

  React.useEffect(() => {
    if (!enableSystem && theme === 'system') {
      setThemeState('light')
    }
  }, [enableSystem, theme])

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if (theme === 'system' && enableSystem) {
        applyTheme(theme, attribute, disableTransitionOnChange)
      }
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [attribute, disableTransitionOnChange, enableSystem, theme])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('theme', theme)
    applyTheme(theme, attribute, disableTransitionOnChange)
  }, [attribute, disableTransitionOnChange, theme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (nextTheme: Theme) => setThemeState(nextTheme),
      resolvedTheme,
      systemTheme,
    }),
    [resolvedTheme, systemTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
