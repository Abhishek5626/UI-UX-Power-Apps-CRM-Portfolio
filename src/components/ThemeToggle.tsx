import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import type { ThemeName } from '../theme.tsx'
import './theme-toggle.css'

const armAngles = [180, 225, 270, 315] as const

function ThemeToggleArtwork() {
  return (
    <span className="theme-toggle-knob" aria-hidden="true">
      <span className="theme-toggle-icon">
        <span className="theme-toggle-core" />
        <span className="theme-toggle-mask" />
        {armAngles.map((angle) => (
          <span
            key={angle}
            className="theme-toggle-arm"
            style={{ '--arm-rotate': `${angle}deg` } as CSSProperties}
          >
            <span className="theme-toggle-shine" />
            <span className="theme-toggle-shine" />
          </span>
        ))}
      </span>
    </span>
  )
}

type ThemeToggleProps = {
  theme: ThemeName
  label: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'aria-label' | 'children'>

/** Framer University–style sun/moon morphing theme switch. */
export function ThemeToggle({
  theme,
  label,
  className = '',
  onClick,
  ...rest
}: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      {...rest}
      type="button"
      className={['theme-toggle', className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-pressed={isDark}
      onClick={onClick}
    >
      <ThemeToggleArtwork />
    </button>
  )
}

type ThemeToggleVisualProps = {
  className?: string
}

/** Decorative morphing switch for use inside an existing themed button. */
export function ThemeToggleVisual({ className = '' }: ThemeToggleVisualProps) {
  return (
    <span
      className={['theme-toggle', 'theme-toggle-visual', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <ThemeToggleArtwork />
    </span>
  )
}
