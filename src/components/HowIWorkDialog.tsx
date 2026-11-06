import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { DrawerTools, useSheetKeys } from './ProjectDrawer.tsx'
import { howIWorkContent } from './howIWorkContent.ts'
import './how-i-work.css'

const tabs = ['process', 'bestWhere', 'certificates'] as const
const RESIZE_MS = 320

export function HowIWorkDialog({
  opener,
  onClose,
}: {
  opener: HTMLElement
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const fromHeightRef = useRef<string | null>(null)
  const resizeRef = useRef<Animation | null>(null)
  const [active, setActive] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [certFilter, setCertFilter] = useState(0)
  const certLogoRef = useRef<HTMLImageElement>(null)
  const id = useId()
  const { process, bestWhere, certificates } = howIWorkContent
  const certArea = certificates.filters[certFilter]

  // Not modal: like the project drawer, the nav and chat stay on top, and useSheetKeys keeps focus in scope.
  useEffect(() => {
    dialogRef.current?.show()
    closeRef.current?.focus({ preventScroll: true })
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

  useSheetKeys(dialogRef, requestClose)

  // The hovered row's issuer logo follows the pointer, centred on it (signal-a.studio's recognitions list).
  const moveCertLogo = (event: PointerEvent<HTMLDivElement>) => {
    const logo = certLogoRef.current
    const row = (event.target as Element).closest<HTMLElement>('.cert-row')
    if (!logo || event.pointerType !== 'mouse') return
    if (!row) {
      logo.classList.remove('is-shown')
      return
    }
    const src = row.dataset.logo ?? ''
    if (logo.getAttribute('src') !== src) logo.src = src
    const box = event.currentTarget.getBoundingClientRect()
    logo.style.translate = `${event.clientX - box.left}px ${event.clientY - box.top}px`
    logo.classList.add('is-shown')
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
      className="sheet-dialog how-i-work"
      aria-labelledby={`${id}-title`}
      onClose={() => {
        opener.focus({ preventScroll: true })
        onClose()
      }}
    >
      <DrawerTools closeLabel="Close How I Work" onClose={requestClose} closeRef={closeRef} />
      <div ref={shellRef} className="how-i-work-shell">
        {/* No visible header in the sheet; the title stays for screen readers and the tab list's label. */}
        <h2 id={`${id}-title`} className="visually-hidden">
          {howIWorkContent.title}
        </h2>

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

          <div
            role="tabpanel"
            id={`${id}-panel-certificates`}
            className={panelClass(2, 'is-process is-certificates')}
            aria-labelledby={`${id}-tab-certificates`}
            tabIndex={0}
            hidden={active !== 2 && leaving !== 2}
            inert={leaving === 2}
          >
            {/* Sub-tabs sit straight under the main tabs, as in All Projects. */}
            <div className="how-i-work-tabs all-projects-filters" role="group" aria-label="Certificate area">
              {certificates.filters.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  className="how-i-work-tab"
                  aria-pressed={index === certFilter}
                  onClick={() => setCertFilter(index)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="how-i-work-intro">
              <h3 className="how-i-work-heading">{certificates.heading}</h3>
              <p className="how-i-work-summary">{certificates.summary}</p>
            </div>
            <div
              className="cert-list-wrap"
              onPointerMove={moveCertLogo}
              onPointerLeave={() => certLogoRef.current?.classList.remove('is-shown')}
            >
              <ul className="cert-list" role="list" aria-live="polite">
                {certificates.items
                  .filter((item) => certFilter === 0 || item.area === certArea)
                  .map((item) => (
                    <li key={item.id} className="cert-row" data-logo={item.logo}>
                      <span className="cert-name">{item.name}</span>
                      <span className="cert-detail">{item.detail}</span>
                    </li>
                  ))}
              </ul>
              <img ref={certLogoRef} className="cert-logo" alt="" width={160} height={160} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}
