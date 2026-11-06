import type { ReactNode } from 'react'

type FooterProps = {
  children: ReactNode
}

export function Footer({ children }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="content">{children}</div>
    </footer>
  )
}
