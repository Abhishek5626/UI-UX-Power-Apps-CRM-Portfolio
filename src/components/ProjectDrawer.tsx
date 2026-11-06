import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { ProgressiveBlur } from './ProgressiveBlur.tsx'
import { ThemeToggle } from './ThemeToggle.tsx'
import { useTheme } from '../theme.tsx'
import {
  projectOrder,
  projectTitles,
  type ProjectId,
} from './useProjectDrawer.ts'
import './project-drawer.css'

const sheetMs = 720
const contentMs = 520
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

const studies = {
  'case-study-1': lazy(() =>
    import('../pages/CaseStudy1.tsx').then((m) => ({ default: m.CaseStudy1 })),
  ),
  'case-study-2': lazy(() =>
    import('../pages/CaseStudy2.tsx').then((m) => ({ default: m.CaseStudy2 })),
  ),
  'case-study-3': lazy(() =>
    import('../pages/CaseStudy3.tsx').then((m) => ({ default: m.CaseStudy3 })),
  ),
  'case-study-4': lazy(() =>
    import('../pages/CaseStudy4.tsx').then((m) => ({ default: m.CaseStudy4 })),
  ),
  'case-study-5': lazy(() =>
    import('../pages/CaseStudy5.tsx').then((m) => ({ default: m.CaseStudy5 })),
  ),
} as const

function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconArrow({ direction }: { direction: 'left' | 'right' }) {
  const d =
    direction === 'left'
      ? 'M19 12H5M11 6l-6 6 6 6'
      : 'M5 12h14M13 6l6 6-6 6'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function switchDirection(from: ProjectId, to: ProjectId): 'next' | 'prev' {
  const total = projectOrder.length
  const start = projectOrder.indexOf(from)
  const end = projectOrder.indexOf(to)
  const forward = (end - start + total) % total
  const backward = (start - end + total) % total
  return forward <= backward ? 'next' : 'prev'
}

function focusableElements(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => {
    if (element.getAttribute('aria-hidden') === 'true') return false
    return element.getClientRects().length > 0
  })
}

export function ProjectDrawer({
  projectId,
  onClose,
  onSelect,
  onPresenceChange,
}: {
  projectId: ProjectId | null
  onClose: () => void
  onSelect: (id: ProjectId) => void
  onPresenceChange: (present: boolean) => void
}) {
  const [presentId, setPresentId] = useState(projectId)
  const [mode, setMode] = useState<'enter' | 'exit'>('enter')
  const [shownId, setShownId] = useState(projectId)
  const [contentPhase, setContentPhase] = useState<'in' | 'out'>('in')
  const [motion, setMotion] = useState<'open' | 'next' | 'prev'>('open')
  const { theme, toggleTheme } = useTheme()
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousPresent = useRef<ProjectId | null>(null)

  if (
    projectId &&
    shownId !== projectId &&
    (mode === 'exit' || presentId === null) &&
    contentPhase !== 'out'
  ) {
    setShownId(projectId)
    setContentPhase('in')
    setMotion('open')
  }

  useEffect(() => {
    const query = window.matchMedia(reducedMotionQuery)
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useLayoutEffect(() => {
    if (projectId) {
      setPresentId(projectId)
      setMode('enter')
      return
    }

    setMode('exit')
  }, [projectId])

  useEffect(() => {
    if (projectId || !presentId) return
    const panel = panelRef.current

    const finish = () => setPresentId(null)
    const onEnd = (event: AnimationEvent) => {
      if (event.target !== panel) return
      if (event.animationName !== 'project-drawer-out') return
      finish()
    }

    panel?.addEventListener('animationend', onEnd)
    const timer = window.setTimeout(finish, sheetMs + 40)
    return () => {
      panel?.removeEventListener('animationend', onEnd)
      window.clearTimeout(timer)
    }
  }, [projectId, presentId])

  useEffect(() => {
    if (!projectId || projectId === shownId) return
    if (!shownId || mode !== 'enter' || reduced) {
      setShownId(projectId)
      setContentPhase('in')
      setMotion('open')
      return
    }

    setMotion(switchDirection(shownId, projectId))
    setContentPhase('out')
    const timer = window.setTimeout(() => {
      setShownId(projectId)
      setContentPhase('in')
    }, contentMs)
    return () => window.clearTimeout(timer)
  }, [projectId, shownId, mode, reduced])

  useEffect(() => {
    onPresenceChange(presentId !== null)
  }, [presentId, onPresenceChange])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [shownId])

  // Lets a page drop the bottom blur once there is nothing left to scroll under it.
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller?.firstElementChild) return
    const update = () =>
      scroller.classList.toggle('is-at-end', scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop < 120)
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(scroller.firstElementChild)
    return () => {
      scroller.removeEventListener('scroll', update)
      observer.disconnect()
    }
    // The scroller only exists while the drawer is open, which can come after shownId is set.
  }, [presentId, shownId])

  const locked = presentId !== null
  useEffect(() => {
    if (!locked) return

    const html = document.documentElement
    const body = document.body
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPadding: body.style.paddingRight,
    }
    const gap = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (gap > 0) {
      body.style.paddingRight = `${gap}px`
    }

    return () => {
      html.style.overflow = previous.htmlOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.paddingRight = previous.bodyPadding
    }
  }, [locked])

  useEffect(() => {
    const wasPresent = previousPresent.current
    previousPresent.current = presentId
    if (presentId && !wasPresent) {
      closeRef.current?.focus({ preventScroll: true })
    }
  }, [presentId])

  useEffect(() => {
    if (!presentId) return
    const panel = panelRef.current
    if (!panel) return

    const onKeyDown = (event: KeyboardEvent) => {
      // The chat is a modal of its own, so its keys stay with it.
      if (document.querySelector('.ask-panel[open]')) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        event.target instanceof HTMLElement &&
        event.target.closest('.project-drawer-nav .project-drawer-control')
      ) {
        event.preventDefault()
        const index = projectOrder.indexOf(presentId)
        const nextIndex =
          event.key === 'ArrowLeft'
            ? (index - 1 + projectOrder.length) % projectOrder.length
            : (index + 1) % projectOrder.length
        onSelect(projectOrder[nextIndex])
        return
      }

      if (event.key !== 'Tab') return
      const outside = [...document.querySelectorAll<HTMLElement>('.portfolio-nav, .ask-dock')]
      const navItems = outside.flatMap(focusableElements)
      const items = [...focusableElements(panel), ...navItems]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const inScope =
        (active instanceof Node && panel.contains(active)) ||
        (active instanceof Node && outside.some((root) => root.contains(active)))
      if (event.shiftKey && (active === first || !inScope)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !inScope)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [presentId, onClose, onSelect])

  const onPanelClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const link = target.closest('a')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href?.startsWith('#') || href.length < 2) return
    let destination: Element | null = null
    try {
      destination = panelRef.current?.querySelector(href) ?? null
    } catch {
      return
    }
    if (!(destination instanceof HTMLElement)) return
    event.preventDefault()
    if (!destination.hasAttribute('tabindex')) {
      destination.tabIndex = -1
    }
    destination.focus({ preventScroll: true })
    destination.scrollIntoView({ block: 'start' })
  }

  if (!presentId || !shownId) {
    return null
  }

  const Study = studies[shownId]
  const index = projectOrder.indexOf(projectId ?? shownId)
  const previous = projectOrder[(index - 1 + projectOrder.length) % projectOrder.length]
  const next = projectOrder[(index + 1) % projectOrder.length]
  const motionClass = motion === 'open' ? '' : `is-${motion}`
  const phaseClass = contentPhase === 'out' ? 'is-out' : 'is-in'

  return (
    <div
      id="project-drawer"
      ref={panelRef}
      className={[
        'project-drawer',
        mode === 'exit' ? 'is-exiting' : 'is-entering',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      onClick={onPanelClick}
    >
      <div className="project-drawer-tools">
        <ThemeToggle
          className="project-drawer-theme is-compact"
          theme={theme}
          label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          onClick={toggleTheme}
        />
        <button
          ref={closeRef}
          className="project-drawer-glass project-drawer-control"
          type="button"
          aria-label="Close project"
          onClick={onClose}
        >
          <IconClose />
        </button>
      </div>
      <nav className="project-drawer-nav" aria-label="Projects">
        <button
          className="project-drawer-glass project-drawer-control"
          type="button"
          aria-label={`Previous project, ${projectTitles[previous]}`}
          onClick={() => onSelect(previous)}
        >
          <IconArrow direction="left" />
        </button>
        <button
          className="project-drawer-glass project-drawer-control"
          type="button"
          aria-label={`Next project, ${projectTitles[next]}`}
          onClick={() => onSelect(next)}
        >
          <IconArrow direction="right" />
        </button>
      </nav>
      <p className="project-drawer-status" aria-live="polite">
        {projectTitles[shownId]}
      </p>
      <div ref={scrollRef} className="project-drawer-scroll">
        <div
          key={shownId}
          className={`project-drawer-content ${phaseClass} ${motionClass}`.trim()}
        >
          <Suspense fallback={null}>
            <Study />
          </Suspense>
        </div>
      </div>
      <ProgressiveBlur mode="absolute" />
    </div>
  )
}
