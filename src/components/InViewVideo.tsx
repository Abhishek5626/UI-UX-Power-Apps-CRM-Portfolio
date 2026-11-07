import { useEffect, useRef, type ComponentProps, type RefObject } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** How much of a focus video must be on screen before it plays. */
const FOCUS_RATIO = 0.6

/**
 * Plays a muted loop only while it is near the screen, so videos off screen
 * neither download nor decode. Reduced motion keeps the first frame still.
 * `active: false` holds it paused, e.g. while something covers it.
 * `focus`: buffer as soon as it nears the screen, so playback starts at once,
 * but only spend decoding on it once most of it is in view.
 * `wanted`: the visitor is pointing at or touching it, so it plays now, focus or not.
 * Returns the preload value the video should render with.
 */
export function usePlayInView(
  videoRef: RefObject<HTMLVideoElement | null>,
  active = true,
  focus = false,
  wanted = false,
) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion() || !('IntersectionObserver' in window)) return
    if (!active) {
      video.pause()
      return
    }
    if (wanted) {
      video.preload = 'auto'
      video.play().catch(() => {})
      return
    }
    // scrollMargin carries the head start into the drawer's own scroller; rootMargin only covers the window.
    const ahead = { rootMargin: '300px', scrollMargin: '300px' }
    const prefetch = focus
      ? new IntersectionObserver((entries) => {
          if (entries.at(-1)!.isIntersecting) video.preload = 'auto'
        }, ahead)
      : null
    prefetch?.observe(video)
    const observer = new IntersectionObserver(
      // The last entry is the current state when several queue up during a fast scroll.
      (entries) => {
        const entry = entries.at(-1)!
        const inView = entry.isIntersecting && (!focus || entry.intersectionRatio >= FOCUS_RATIO)
        if (inView) video.play().catch(() => {})
        else video.pause()
      },
      focus ? { threshold: [0, FOCUS_RATIO] } : { rootMargin: '200px', scrollMargin: '200px' },
    )
    observer.observe(video)
    return () => {
      prefetch?.disconnect()
      observer.disconnect()
    }
  }, [videoRef, active, focus, wanted])
  return reducedMotion() ? 'metadata' : 'none'
}

/** A decorative or demo loop: muted, inline, and playing only while on screen. */
export function InViewVideo(props: ComponentProps<'video'>) {
  const ref = useRef<HTMLVideoElement>(null)
  const preload = usePlayInView(ref)
  return <video ref={ref} muted loop playsInline preload={preload} {...props} />
}
