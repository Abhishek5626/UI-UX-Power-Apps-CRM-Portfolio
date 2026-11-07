/**
 * Smoothness switches. All on by default; open the site with ?perf to get a panel that
 * turns any of them off (saved in this browser), so each change can be reverted on its own.
 */
export const perfSwitches = {
  panTricks: 'Hold card loops and hover while the field pans',
  videoFocus: 'Videos buffer early but play only when mostly on screen',
  bakedVideoEdge: 'Video edge blur drawn inside its canvas',
  holdBehindSheets: 'Hold landing loops behind open sheets',
  lowPower: 'Calmer cards on low-power devices',
  adaptiveQuality: 'Switch to calmer cards if this device drops frames while panning',
  quickIntro: 'Shorter intro screen',
} as const

export type PerfSwitch = keyof typeof perfSwitches

const KEY = 'perf-off'
const off: string[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
})()

export const perfOn = (name: PerfSwitch) => !off.includes(name)

export function setPerf(name: PerfSwitch, on: boolean) {
  const next = on ? off.filter((item) => item !== name) : [...new Set([...off, name])]
  localStorage.setItem(KEY, JSON.stringify(next))
  location.reload()
}

type DeviceHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
const device = navigator as DeviceHints
/**
 * Very few cores, little memory or Data Saver: the cards' ambient loops stay still.
 * Thresholds stay low on purpose: iPhones report only 4 cores (a privacy limit), so a
 * "4 or fewer" rule calmed every iPhone. Adaptive quality catches genuinely slow devices.
 */
const DROPPED_KEY = 'perf-dropped-frames'
export const lowPower =
  perfOn('lowPower') &&
  ((navigator.hardwareConcurrency ?? 8) <= 2 ||
    (device.deviceMemory ?? 8) <= 2 ||
    device.connection?.saveData === true ||
    sessionStorage.getItem(DROPPED_KEY) === '1')

const html = document.documentElement
if (lowPower) html.dataset.lowPower = ''

/** True once this visit runs the calmer cards, whether detected up front or measured later. */
export const isLowPower = () => html.dataset.lowPower !== undefined

/**
 * Adaptive quality: frame times are measured only while the field pans, from 5 s after
 * load. If the median frame is slower than 50 fps in two 2 s windows in a row, the calmer
 * mode turns on for the rest of the visit. One rAF loop, and only during pans.
 */
if (perfOn('lowPower') && perfOn('adaptiveQuality') && !lowPower) {
  // Decided by time, not frame count: a slow device gives fewer frames, so a count would wait longest where it matters most.
  const WINDOW_MS = 2000
  const MIN_FRAMES = 30
  const SLOW_FRAME_MS = 20
  // Load-time work (entrance, first video buffering) would look like a slow device.
  const SETTLE_MS = 5000
  // One slow stretch can be a hiccup; two in a row is the device.
  const SLOW_WINDOWS = 2
  const frames: number[] = []
  let slowWindows = 0
  let measured = 0
  let loop = 0
  let last = 0
  const measure = (now: number) => {
    if (last && now > SETTLE_MS) {
      frames.push(now - last)
      measured += now - last
    }
    last = now
    if (measured >= WINDOW_MS && frames.length >= MIN_FRAMES) {
      const median = [...frames].sort((a, b) => a - b)[frames.length >> 1]!
      frames.length = 0
      measured = 0
      slowWindows = median > SLOW_FRAME_MS ? slowWindows + 1 : 0
      if (slowWindows >= SLOW_WINDOWS) {
        html.dataset.lowPower = ''
        sessionStorage.setItem(DROPPED_KEY, '1')
        window.removeEventListener('fisheye-motion', onMotion, true)
        return
      }
    }
    loop = requestAnimationFrame(measure)
  }
  // fisheye-motion doesn't bubble, so listen in the capture phase.
  const onMotion = (event: Event) => {
    cancelAnimationFrame(loop)
    last = 0
    if ((event as CustomEvent<boolean>).detail) loop = requestAnimationFrame(measure)
  }
  window.addEventListener('fisheye-motion', onMotion, true)
}
if (perfOn('panTricks')) html.dataset.panTricks = ''
if (perfOn('bakedVideoEdge')) html.dataset.bakedEdge = ''
