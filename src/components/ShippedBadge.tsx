import type { ReactNode } from 'react'
import './shipped-badge.css'

export function ShippedBadge({
  children = 'Shipped',
  onMedia = false,
}: {
  children?: ReactNode
  onMedia?: boolean
}) {
  return (
    <span className={onMedia ? 'shipped-badge is-on-media' : 'shipped-badge'}>
      <span className="shipped-badge-dot" aria-hidden="true" />
      <span className="shipped-badge-label">{children}</span>
    </span>
  )
}
