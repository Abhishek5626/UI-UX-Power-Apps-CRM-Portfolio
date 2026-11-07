import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import './text-cycle.css'

/** framer.university's Text Cycle: Framer spring (stiffness 200, damping 30, mass 1) and its variant delays. */
const STIFFNESS = 200
const DAMPING = 30
const FIRST_HOLD_MS = 500
const HOLD_MS = 1000
const LAST_HOLD_MS = 500

/** The spring as a CSS linear() easing: its position every 1/60 s until it settles. */
const spring = (() => {
  const points: number[] = []
  let x = 0
  let v = 0
  while (points.length < 120 && !(Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01)) {
    points.push(Number(x.toFixed(4)))
    for (let i = 0; i < 8; i += 1) {
      v += (STIFFNESS * (1 - x) - DAMPING * v) / 480
      x += v / 480
    }
  }
  points.push(1)
  return { easing: `linear(${points.join(', ')})`, duration: ((points.length - 1) * 1000) / 60 }
})()

/**
 * Cycles through `items` on one line: the word slides up and out while the next slides
 * up and in, and the box springs to the new word's width. Pauses off screen; reduced
 * motion keeps the first item still. The text is decorative, so callers give assistive
 * tech the full list elsewhere.
 */
export function TextCycle({ items }: { items: readonly ReactNode[] }) {
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const track = root?.firstElementChild as HTMLElement | null
    if (!root || !track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const words = [...track.children] as HTMLElement[]
    // The last word repeats the first, so wrapping back to the start is an unseen jump.
    const last = words.length - 1
    let index = 0
    let timer = 0

    const show = (next: number) => {
      const from = words[index]
      const to = words[next]
      const width = `${to.offsetWidth}px`
      if (next === 0) {
        // Framer's reset tween has no duration: whatever is still settling stops where it is.
        root.getAnimations({ subtree: true }).forEach((animation) => animation.cancel())
      } else {
        const options = { duration: spring.duration, easing: spring.easing }
        track.animate({ translate: [`0 ${-100 * index}%`, `0 ${-100 * next}%`] }, options)
        from.animate({ opacity: [1, 0] }, options)
        to.animate({ opacity: [0, 1] }, options)
        // Width is a layout property, animated on purpose: the theme pill beside it follows.
        root.animate({ width: [`${from.offsetWidth}px`, width] }, options)
      }
      // End states go inline, so no animation has to hold them with fill.
      track.style.translate = `0 ${-100 * next}%`
      from.style.opacity = '0'
      to.style.opacity = '1'
      root.style.width = width
      index = next
    }

    const hold = () => (index === 0 ? FIRST_HOLD_MS : index === last ? LAST_HOLD_MS : HOLD_MS)
    const tick = () => {
      // The page is panning or covered: wait rather than lay out a width spring mid-pan.
      if (root.closest('[data-moving], [data-hold]')) {
        timer = window.setTimeout(tick, 200)
        return
      }
      show(index === last ? 0 : index + 1)
      timer = window.setTimeout(tick, hold())
    }

    const observer = new IntersectionObserver((entries) => {
      window.clearTimeout(timer)
      if (entries.at(-1)!.isIntersecting) timer = window.setTimeout(tick, hold())
    })
    observer.observe(root)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [items])

  return (
    <span ref={rootRef} className="text-cycle">
      <span className="text-cycle-track">
        {[...items, items[0]].map((item, index) => (
          <span key={index} className="text-cycle-item" style={{ '--i': index } as CSSProperties}>
            {item}
          </span>
        ))}
      </span>
    </span>
  )
}
