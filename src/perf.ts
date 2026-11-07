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
/** Few cores, little memory or Data Saver: the cards' ambient loops stay still. */
export const lowPower =
  perfOn('lowPower') &&
  ((navigator.hardwareConcurrency ?? 8) <= 4 ||
    (device.deviceMemory ?? 8) <= 4 ||
    device.connection?.saveData === true)

const html = document.documentElement
if (lowPower) html.dataset.lowPower = ''
if (perfOn('panTricks')) html.dataset.panTricks = ''
if (perfOn('bakedVideoEdge')) html.dataset.bakedEdge = ''
