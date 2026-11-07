import { useEffect, useState } from 'react'
import { isLowPower, perfOn, perfSwitches, setPerf, type PerfSwitch } from '../perf.ts'

type PanStats = { pans: number; frames: number; median: number; p95: number; worst: number; slow: number }

/** Frame times recorded only while the card field pans, for testing on a real phone. */
function usePanFrames() {
  const [stats, setStats] = useState<PanStats | null>(null)
  useEffect(() => {
    const frames: number[] = []
    let pans = 0
    let loop = 0
    let last = 0
    const tick = (now: number) => {
      if (last) frames.push(now - last)
      last = now
      loop = requestAnimationFrame(tick)
    }
    const summarise = () => {
      if (frames.length === 0) return
      const sorted = [...frames].sort((a, b) => a - b)
      const at = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]!
      setStats({
        pans,
        frames: frames.length,
        median: at(0.5),
        p95: at(0.95),
        worst: sorted[sorted.length - 1]!,
        // Over 1.5 frames at 60 Hz counts as a dropped frame.
        slow: frames.filter((ms) => ms > 25).length / frames.length,
      })
    }
    // fisheye-motion doesn't bubble, so listen in the capture phase.
    const onMotion = (event: Event) => {
      cancelAnimationFrame(loop)
      last = 0
      if ((event as CustomEvent<boolean>).detail) {
        pans += 1
        loop = requestAnimationFrame(tick)
      } else summarise()
    }
    window.addEventListener('fisheye-motion', onMotion, true)
    return () => {
      cancelAnimationFrame(loop)
      window.removeEventListener('fisheye-motion', onMotion, true)
    }
  }, [])
  return stats
}

/** The ?perf panel: one checkbox per smoothness change, plus a frame meter for pans. */
export function PerfPanel() {
  const stats = usePanFrames()
  const ms = (value: number) => `${value.toFixed(1)} ms`
  return (
    <form
      aria-label="Smoothness switches"
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 2000,
        display: 'grid',
        gap: 6,
        maxWidth: 'min(320px, calc(100vw - 24px))',
        padding: 10,
        borderRadius: 10,
        background: 'rgb(0 0 0 / 0.85)',
        color: '#fff',
        font: '12px/1.4 system-ui, sans-serif',
      }}
    >
      {/* Folded by default: open, it would cover the cards and block panning on a phone. */}
      <details>
        <summary style={{ minHeight: 28, cursor: 'pointer' }}>Smoothness switches</summary>
        {(Object.keys(perfSwitches) as PerfSwitch[]).map((name) => (
          <label key={name} style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 32 }}>
            <input type="checkbox" checked={perfOn(name)} onChange={(event) => setPerf(name, event.target.checked)} />
            {perfSwitches[name]}
          </label>
        ))}
      </details>
      <strong>Pan frame meter</strong>
      {stats ? (
        <span>
          {stats.pans} pans, {stats.frames} frames · median {ms(stats.median)} ({Math.round(1000 / stats.median)} fps) · p95{' '}
          {ms(stats.p95)} · worst {ms(stats.worst)} · dropped {Math.round(stats.slow * 100)}%
        </span>
      ) : (
        <span>Pan the cards for a few seconds, then lift your finger.</span>
      )}
      <span style={{ opacity: 0.7 }}>
        {screen.width}×{screen.height} @{devicePixelRatio}x · {navigator.hardwareConcurrency ?? '?'} cores · calmer cards:{' '}
        {isLowPower() ? 'on' : 'off'}
      </span>
    </form>
  )
}
