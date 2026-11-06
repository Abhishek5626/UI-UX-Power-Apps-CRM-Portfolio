import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { ApertureMark } from './AboutMeCard.tsx'
import { howIWorkContent } from './howIWorkContent.ts'
import './how-i-work.css'

const tabs = ['process', 'bestWhere'] as const
const RESIZE_MS = 320

export function HowIWorkDialog({
  opener,
  onClose,
}: {
  opener: HTMLElement
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const fromHeightRef = useRef<string | null>(null)
  const resizeRef = useRef<Animation | null>(null)
  const [active, setActive] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const id = useId()
  const { process, bestWhere } = howIWorkContent

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  // Tweens the shell between the two panels' heights, then hands back to auto
  // so it keeps fitting its content (and the viewport cap) after any resize.
  useLayoutEffect(() => {
    const shell = shellRef.current
    const from = fromHeightRef.current
    if (!shell || from === null) return
    fromHeightRef.current = null
    resizeRef.current?.cancel()
    const resize = shell.animate(
      { height: [from, getComputedStyle(shell).height] },
      { duration: RESIZE_MS, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    )
    resizeRef.current = resize
    // A cancel means a newer switch took over, and that one clears `leaving`.
    resize.finished.then(
      () => setLeaving(null),
      () => {},
    )
  }, [active])

  const selectTab = (next: number) => {
    if (next === active) return
    if (
      shellRef.current &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      // Read mid-flight too, so a quick switch back continues from here.
      fromHeightRef.current = getComputedStyle(shellRef.current).height
      setLeaving(active)
    }
    setActive(next)
  }

  const panelClass = (index: number, name: string) =>
    [
      'how-i-work-panel',
      name,
      leaving === index ? 'is-leaving' : '',
      leaving !== null && active === index ? 'is-entering' : '',
    ]
      .filter(Boolean)
      .join(' ')

  // Plays the exit animation first; with reduced motion there is none to wait on.
  const requestClose = () => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.classList.add('is-closing')
    void Promise.allSettled(
      dialog
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished),
    ).then(() => dialog.close())
  }

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) requestClose()
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = tabs.length - 1
    const next = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    selectTab(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <dialog
      ref={dialogRef}
      className="how-i-work"
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClose={() => {
        opener.focus({ preventScroll: true })
        onClose()
      }}
      onClick={onBackdropClick}
    >
      <div ref={shellRef} className="how-i-work-shell">
        <header className="how-i-work-header">
          <h2 id={`${id}-title`} className="how-i-work-title">
            <ApertureMark />
            {howIWorkContent.title}
          </h2>
          <button
            type="button"
            className="how-i-work-close glass-control"
            aria-label="Close"
            onClick={requestClose}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M6 0c.552 0 1 .448 1 1v4h4c.552 0 1 .448 1 1s-.448 1-1 1H7v4c0 .552-.448 1-1 1s-1-.448-1-1V7H1C.448 7 0 6.552 0 6s.448-1 1-1h4V1c0-.552.448-1 1-1Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </header>

        <div
          className="how-i-work-tabs"
          role="tablist"
          aria-labelledby={`${id}-title`}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${tab}`}
              className="how-i-work-tab"
              aria-selected={active === index}
              aria-controls={`${id}-panel-${tab}`}
              tabIndex={active === index ? 0 : -1}
              onClick={() => selectTab(index)}
              onKeyDown={onTabKeyDown}
            >
              {howIWorkContent[tab].tab}
            </button>
          ))}
        </div>

        <div className="how-i-work-stage">
          <div
            role="tabpanel"
            id={`${id}-panel-process`}
            className={panelClass(0, 'is-process')}
            aria-labelledby={`${id}-tab-process`}
            tabIndex={0}
            hidden={active !== 0 && leaving !== 0}
            inert={leaving === 0}
          >
            <div className="how-i-work-intro">
              <h3 className="how-i-work-heading">{process.heading}</h3>
              <p className="how-i-work-summary">{process.summary}</p>
            </div>
            <ul className="how-i-work-list" role="list">
              {process.items.map((item) => (
                <li key={item.id} className="how-i-work-item">
                  <div className="how-i-work-item-top">
                    <h4 className="how-i-work-item-title">{item.title}</h4>
                    <span className="how-i-work-tag">{item.id}</span>
                  </div>
                  <p className="how-i-work-item-body">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div
            role="tabpanel"
            id={`${id}-panel-bestWhere`}
            className={panelClass(1, 'is-best-where')}
            aria-labelledby={`${id}-tab-bestWhere`}
            tabIndex={0}
            hidden={active !== 1 && leaving !== 1}
            inert={leaving === 1}
          >
            <h3 className="how-i-work-heading">{bestWhere.heading}</h3>
            <ul className="how-i-work-list" role="list">
              {bestWhere.items.map((item) => (
                <li key={item.id} className="how-i-work-item">
                  <span className="how-i-work-tag">{item.id}</span>
                  <h4 className="how-i-work-item-title">{item.title}</h4>
                  <p className="how-i-work-item-body">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </dialog>
  )
}
