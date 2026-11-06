import type { ReactNode } from 'react'

type SectionProps = {
  id: string
  heading: string
  children: ReactNode
}

export function Section({ id, heading, children }: SectionProps) {
  const headingId = `${id}-heading`

  return (
    <section className="section" id={id} aria-labelledby={headingId}>
      <h2 id={headingId}>{heading}</h2>
      {children}
    </section>
  )
}
