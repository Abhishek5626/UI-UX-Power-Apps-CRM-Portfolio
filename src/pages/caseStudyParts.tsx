import type { ReactNode } from 'react'

/** The "Why I decided this" callout, with one decision and its reasoning. */
export function DecisionNote({
  decision,
  assumption = false,
  children,
}: {
  decision: string
  assumption?: boolean
  children: ReactNode
}) {
  const label = 'Why I decided this'
  return (
    <aside className="cs-decision" aria-label={label}>
      <p className="cs-decision-label">
        <span className="cs-marker" aria-hidden="true">
          i
        </span>
        {label}
        {assumption ? <span className="cs-tag cs-tag-soft">Assumption</span> : null}
      </p>
      <div className="cs-decision-body">
        <p className="cs-h4">{decision}</p>
        <div className="cs-decision-why">{children}</div>
      </div>
    </aside>
  )
}

export function ShowAll({
  open,
  label,
  controls,
  onToggle,
}: {
  open: boolean
  label: string
  controls: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="cs-show-all"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
    >
      {open ? 'Show fewer' : label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path
          d={open ? 'M2 6.5 5 3.5 8 6.5' : 'M2 3.5 5 6.5 8 3.5'}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
