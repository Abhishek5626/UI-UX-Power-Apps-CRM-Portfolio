/**
 * First-load screen. index.html paints it before any script runs; this file
 * drives it from what the page actually needs and resolves `pageLoaderDone`
 * once it has gone, which is the card entrance's cue to start.
 */
const html = document.documentElement
const active = html.dataset.loader === 'on'

/** Long enough to read the line on a fast connection. */
const MIN_VISIBLE_MS = 1200
/** Slow or stuck assets stop waiting here, measured from navigation start. */
const MAX_WAIT_MS = 6000
const TEXT_OUT_MS = 300
const PANEL_IN_MS = 500
const PANEL_HOLD_MS = 350
const PANEL_OUT_MS = 800
const FADE_OUT_MS = 200
/** The share of progress earned just by the app having booted. */
const BOOTED_PROGRESS = 0.2

let finish = () => {}
export const pageLoaderDone = active
  ? new Promise<void>((resolve) => {
      finish = resolve
    })
  : Promise.resolve()

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Settles when the async Google Fonts stylesheet has applied or failed. */
function fontStylesheetSettled() {
  const link = document.querySelector<HTMLLinkElement>('link[href*="fonts.googleapis.com/css"]')
  if (!link || link.dataset.failed || (link.rel === 'stylesheet' && link.sheet)) return Promise.resolve()
  return new Promise<void>((resolve) => {
    link.addEventListener('error', () => resolve(), { once: true })
    link.addEventListener('load', function onLoad() {
      if (!link.sheet) return
      link.removeEventListener('load', onLoad)
      resolve()
    })
  })
}

function visibleImages(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLImageElement>('[data-fisheye-tile] img')].filter((image) => {
    const rect = image.getBoundingClientRect()
    return (
      rect.width > 0 &&
      rect.right > 0 &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.top < window.innerHeight
    )
  })
}

let started = false

/** Call once the page has rendered its first cards. Safe to call twice. */
export function startPageLoader(root: HTMLElement) {
  if (!active || started) return
  started = true
  html.dataset.loader = 'running'

  const loader = document.getElementById('page-loader')
  const percent = loader?.querySelector<HTMLElement>('.page-loader-percent')
  if (!loader || !percent) {
    delete html.dataset.loader
    finish()
    return
  }

  let target = BOOTED_PROGRESS
  let shown = 0
  const paint = setInterval(() => {
    shown += (target - shown) * 0.18
    if (target - shown < 0.004) shown = target
    percent.textContent = `${Math.round(shown * 100)}%`
    percent.style.setProperty('--page-loader-progress', String(shown))
  }, 30)

  const complete = async () => {
    target = 1
    while (shown < 1) await wait(30)
    clearInterval(paint)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      loader.classList.add('is-leaving')
      await wait(FADE_OUT_MS)
    } else {
      loader.classList.add('is-exit')
      await wait(TEXT_OUT_MS + PANEL_IN_MS + PANEL_HOLD_MS)
      loader.classList.add('is-leaving')
      await wait(PANEL_OUT_MS)
    }
    loader.remove()
    delete html.dataset.loader
    finish()
  }

  // Effects run before the field's first cards commit, so look on the next task.
  setTimeout(() => {
    const assets: Promise<unknown>[] = [
      fontStylesheetSettled().then(() => document.fonts.ready),
      // A failed image rejects, which counts as settled: it must never hold the page.
      ...visibleImages(root).map((image) => image.decode().catch(() => undefined)),
    ]
    const step = (1 - BOOTED_PROGRESS) / assets.length
    for (const asset of assets) {
      void asset.then(() => {
        target = Math.min(1, target + step)
      })
    }
    const now = performance.now()
    void Promise.race([
      Promise.all([Promise.all(assets), wait(Math.max(0, MIN_VISIBLE_MS - now))]),
      wait(Math.max(0, MAX_WAIT_MS - now)),
    ]).then(complete)
  }, 0)
}
