import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ProjectId } from './useProjectDrawer.ts'
import { howIWorkContent } from './howIWorkContent.ts'
import { portfolioNavItems, type PortfolioNavItem } from './navContent.ts'
import { ProgressiveBlur } from './ProgressiveBlur.tsx'
import './portfolio-nav.css'

type PortfolioNavProps = {
  activeProject?: ProjectId | null
  onOpenProject?: (id: ProjectId) => void
  onCloseProject?: () => void
  /** Phone menu only (Figma node 106-774); gets the element to refocus. */
  onHowIWork?: (opener: HTMLElement) => void
}

/** Open stagger from the Framer source: 0.10 / 0.15 / 0.20 / 0.25s */
const openDelays = ['0.1s', '0.15s', '0.2s', '0.25s'] as const
/** Close stagger from the Framer source: 0.15 / 0.10 / 0.05 / 0s */
const closeDelays = ['0.15s', '0.1s', '0.05s', '0s'] as const

function isItemActive(item: PortfolioNavItem, activeProject?: ProjectId | null) {
  return (
    item.destination.kind === 'project' &&
    activeProject === item.destination.projectId
  )
}

export function PortfolioNav({
  activeProject = null,
  onOpenProject,
  onCloseProject,
  onHowIWork,
}: PortfolioNavProps) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        toggleRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  const activateItem = (item: PortfolioNavItem) => {
    closeMenu()

    const { destination } = item
    if (destination.kind === 'section') {
      onCloseProject?.()
      requestAnimationFrame(() => {
        const section = document.getElementById(destination.sectionId)
        // The phone sheet pans itself and cancels this; otherwise scroll.
        const unhandled = section?.dispatchEvent(
          new Event('fisheye-reveal', { bubbles: true, cancelable: true }),
        )
        if (unhandled) {
          section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
      return
    }

    onOpenProject?.(destination.projectId)
  }

  return (
    <div className={open ? 'portfolio-nav is-open' : 'portfolio-nav'}>
      <div
        className="portfolio-nav-scrim"
        aria-hidden={!open}
        onClick={closeMenu}
      />

      {/*
        Desktop open layout from Unusual Navi:
        bottom bar, row, circle then cards (gap 24px), padding 44px.
      */}
      <div className="portfolio-nav-bar">
        <button
          ref={toggleRef}
          type="button"
          className="portfolio-nav-toggle"
          aria-expanded={open}
          aria-controls="portfolio-nav-panel"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="portfolio-nav-toggle-face" aria-hidden="true">
            <span className="portfolio-nav-toggle-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  d="M6 0c.552 0 1 .448 1 1v4h4c.552 0 1 .448 1 1s-.448 1-1 1H7v4c0 .552-.448 1-1 1s-1-.448-1-1V7H1C.448 7 0 6.552 0 6s.448-1 1-1h4V1c0-.552.448-1 1-1Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </span>
        </button>

        {onHowIWork ? (
          <ProgressiveBlur mode="absolute" className="portfolio-nav-top-blur" />
        ) : null}

        <nav
          id="portfolio-nav-panel"
          className="portfolio-nav-panel"
          aria-labelledby={titleId}
          aria-hidden={!open}
          {...(!open ? { inert: true } : {})}
          // The phone panel covers the scrim, so its empty space must close too.
          onClick={(event) => {
            if (
              onHowIWork &&
              event.target instanceof Element &&
              !event.target.closest('.portfolio-nav-card')
            ) {
              closeMenu()
            }
          }}
        >
          <p id={titleId} className="visually-hidden">
            Site navigation
          </p>
          <ul className="portfolio-nav-list">
            {onHowIWork ? (
              <li
                className="portfolio-nav-item"
                style={
                  {
                    '--nav-open-delay': '0.05s',
                    '--nav-close-delay': '0.2s',
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="portfolio-nav-card"
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    closeMenu()
                    if (toggleRef.current) onHowIWork(toggleRef.current)
                  }}
                >
                  <span className="portfolio-nav-card-icon" aria-hidden="true">
                    A
                  </span>
                  <span className="portfolio-nav-card-label">
                    {howIWorkContent.title}
                  </span>
                </button>
              </li>
            ) : null}
            {portfolioNavItems.map((item, index) => {
              const active = isItemActive(item, activeProject)
              return (
                <li
                  key={item.id}
                  className="portfolio-nav-item"
                  style={
                    {
                      '--nav-open-delay': openDelays[index] ?? '0.25s',
                      '--nav-close-delay': closeDelays[index] ?? '0s',
                    } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    className={
                      active
                        ? 'portfolio-nav-card is-active'
                        : 'portfolio-nav-card'
                    }
                    tabIndex={open ? 0 : -1}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => activateItem(item)}
                  >
                    <span className="portfolio-nav-card-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="portfolio-nav-card-label">
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
