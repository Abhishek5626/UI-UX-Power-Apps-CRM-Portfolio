import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { flushSync } from 'react-dom'

export type ThemeName = 'light' | 'dark'

export const themeStorageKey = 'project-view-theme'

/** Manual default when nothing is stored — independent of OS color scheme. */
const defaultTheme: ThemeName = 'light'

function storedTheme(): ThemeName | null {
  try {
    const stored = localStorage.getItem(themeStorageKey)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* Storage can be blocked. Fall back to the manual default. */
  }
  return null
}

export function readTheme(): ThemeName {
  const current = document.documentElement.dataset.theme
  if (current === 'dark' || current === 'light') return current
  return storedTheme() ?? defaultTheme
}

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

/*
  Theme switch, done once at the root.
  Many elements carry their own color/background transitions, and `color`
  is inherited, so a token swap restarted nested transitions frame by frame
  and colors that had none snapped: text stepped and flickered. Instead the
  swap is applied with element transitions suspended for that single style
  change, and the whole page crossfades as one View Transition snapshot.
  The toggle keeps its own knob/icon transitions and shows only its live
  state, so it slides exactly as before.
*/
const toggleTransitionClass = 'theme-toggle'

function applyThemeAtOnce(theme: ThemeName, render: () => void) {
  const root = document.documentElement
  root.classList.add('theme-switching')
  applyTheme(theme)
  render()
  // Flush styles while transitions are suspended so none start.
  void getComputedStyle(root).color
  requestAnimationFrame(() => root.classList.remove('theme-switching'))
}

function switchTheme(theme: ThemeName, render: () => void) {
  if (typeof document.startViewTransition !== 'function') {
    applyThemeAtOnce(theme, render)
    return
  }
  // Toggles on screen get their own live layer (names must be unique).
  const toggles = Array.from(
    document.querySelectorAll<HTMLElement>('.theme-toggle'),
  ).filter((toggle) => {
    const rect = toggle.getBoundingClientRect()
    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    )
  })
  toggles.forEach((toggle, index) => {
    toggle.style.setProperty('view-transition-name', `theme-toggle-${index}`)
    toggle.style.setProperty('view-transition-class', toggleTransitionClass)
  })
  const transition = document.startViewTransition(() =>
    applyThemeAtOnce(theme, render),
  )
  void transition.finished.finally(() => {
    toggles.forEach((toggle) => {
      toggle.style.removeProperty('view-transition-name')
      toggle.style.removeProperty('view-transition-class')
    })
  })
}

type ThemeContextValue = {
  theme: ThemeName
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const initial = readTheme()
    applyTheme(initial)
    return initial
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    // The root attribute is the single source of truth for the live theme.
    const next: ThemeName = readTheme() === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(themeStorageKey, next)
    } catch {
      /* The choice still applies for this visit. */
    }
    switchTheme(next, () => flushSync(() => setTheme(next)))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider.')
  }
  return value
}
