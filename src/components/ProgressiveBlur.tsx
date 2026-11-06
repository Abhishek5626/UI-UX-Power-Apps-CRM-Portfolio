import './progressive-blur.css'

/** Exponential blur ramp (Craftwork Blank), scaled to 70% intensity (−30%). */
const BLUR_PX = [0.35, 0.7, 1.4, 2.8, 5.6, 11.2, 22.4, 44.8] as const
/** Each band re-blurs the moving page every frame, so phones get fewer, smaller ones. */
const PHONE_BLUR_PX = [1.4, 5.6, 22.4] as const

function maskForLayer(index: number, total: number): string {
  const step = 100 / total
  if (index === total - 1) {
    return `linear-gradient(to bottom, transparent ${index * step}%, black 100%)`
  }
  return `linear-gradient(to bottom, transparent ${index * step}%, black ${(index + 1) * step}%, black ${(index + 2) * step}%, transparent ${(index + 3) * step}%)`
}

type ProgressiveBlurProps = {
  /** Fixed to the viewport (landing) vs absolute to a relative parent (drawer). */
  mode?: 'fixed' | 'absolute'
  className?: string
}

/**
 * Bottom-edge progressive blur: content softens as it scrolls under the edge.
 * Pointer-events none — does not block clicks, focus, or scrolling.
 */
export function ProgressiveBlur({
  mode = 'fixed',
  className = '',
}: ProgressiveBlurProps) {
  const bands = window.matchMedia('(max-width: 760px)').matches
    ? PHONE_BLUR_PX
    : BLUR_PX

  return (
    <div
      className={['progressive-blur', `is-${mode}`, className]
        .filter(Boolean)
        .join(' ')}
      data-slot="progressive-blur"
      data-position="bottom"
      aria-hidden="true"
    >
      <div
        className="progressive-blur-edge"
        data-slot="progressive-blur-edge"
        data-edge="bottom"
      >
        {bands.map((blur, index) => {
          const mask = maskForLayer(index, bands.length)
          return (
            <div
              key={blur}
              className="progressive-blur-layer"
              style={{
                zIndex: index + 1,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
