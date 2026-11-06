import { useId } from 'react'
import type { ReactNode } from 'react'
import type { AboutPlaceId } from '../pages/landingContent.ts'
import { howIWorkContent } from './howIWorkContent.ts'

export type AboutMeCardContent = {
  label: string
  imageSrc: string
  imageAlt: string
  imageFrame: {
    left: string
    top: string
    width: string
    height: string
  }
  places: ReadonlyArray<{
    id: AboutPlaceId
    name: string
  }>
}

export function ApertureMark() {
  return (
    <span className="project-card-icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M8.3475 4.66667L11.6958 10.465M5.6525 4.66667H12.3492M4.305 7L7.65333 1.20167M5.6525 9.33333L2.30417 3.535M8.3475 9.33333H1.65083M9.695 7L6.34667 12.7983M12.8333 7C12.8333 10.2217 10.2217 12.8333 7 12.8333C3.77834 12.8333 1.16667 10.2217 1.16667 7C1.16667 3.77834 3.77834 1.16667 7 1.16667C10.2217 1.16667 12.8333 3.77834 12.8333 7Z"
          stroke="currentColor"
          strokeWidth="0.583333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function FlagDisc({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  const clipId = `flag-${useId().replace(/:/g, '')}`

  return (
    <svg width="30" height="30" viewBox="0 0 30 30" role="img" aria-label={label}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="15" cy="15" r="15" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{children}</g>
    </svg>
  )
}

function PlaceMark({ id, label }: { id: AboutPlaceId; label: string }) {
  if (id === 'thailand') {
    return (
      <FlagDisc label={label}>
        <rect width="30" height="5" fill="#A51931" />
        <rect y="5" width="30" height="5" fill="#FFFFFF" />
        <rect y="10" width="30" height="10" fill="#2D2A4A" />
        <rect y="20" width="30" height="5" fill="#FFFFFF" />
        <rect y="25" width="30" height="5" fill="#A51931" />
      </FlagDisc>
    )
  }

  if (id === 'vietnam') {
    return (
      <FlagDisc label={label}>
        <rect width="30" height="30" fill="#DA251D" />
        <path
          fill="#FFFF00"
          d="M15 6.8 16.96 12.45 22.86 12.58 18.14 16.16 19.86 21.78 15 18.4 10.14 21.78 11.86 16.16 7.14 12.58 13.04 12.45Z"
        />
      </FlagDisc>
    )
  }

  return (
    <FlagDisc label={label}>
      <rect width="30" height="10" fill="#00B5E2" />
      <rect y="10" width="30" height="10" fill="#EF3340" />
      <rect y="20" width="30" height="10" fill="#509E2F" />
      <circle cx="12.1" cy="15" r="3.5" fill="#FFFFFF" />
      <circle cx="13.45" cy="15" r="2.75" fill="#EF3340" />
      <g fill="#FFFFFF" transform="translate(18.2 15)">
        <rect x="-1.45" y="-1.45" width="2.9" height="2.9" />
        <rect x="-1.45" y="-1.45" width="2.9" height="2.9" transform="rotate(45)" />
      </g>
    </FlagDisc>
  )
}

export function AboutMeCard({
  content,
  onHowIWork,
}: {
  content: AboutMeCardContent
  /** Figma nodes 2-270 (desktop) and 106-1100 (phone). */
  onHowIWork?: (opener: HTMLElement) => void
}) {
  return (
    <article className="about-me-card" data-hover-tile="" data-repel="">
      <div className="about-me-surface">
        <span className="project-card-header">
          <span className="project-card-label">
            <ApertureMark />
            {content.label}
          </span>
          {onHowIWork ? (
            <button
              type="button"
              className="about-me-how-i-work"
              onClick={(event) => onHowIWork(event.currentTarget)}
            >
              {howIWorkContent.title}
            </button>
          ) : null}
        </span>
        <span className="about-me-photo">
          <img
            src={content.imageSrc}
            alt={content.imageAlt}
            style={{
              left: content.imageFrame.left,
              top: content.imageFrame.top,
              width: content.imageFrame.width,
              height: content.imageFrame.height,
            }}
          />
        </span>
        <ul className="about-me-places" aria-label="Places" role="list">
          {content.places.map((place) => (
            <li key={place.id} className="about-me-place">
              <span className="about-me-place-face">
                <PlaceMark id={place.id} label={`Flag of ${place.name}`} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
