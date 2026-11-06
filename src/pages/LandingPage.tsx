import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { pageLoaderDone, startPageLoader } from '../pageLoader.ts'
import { AboutMeCard } from '../components/AboutMeCard.tsx'
import { DesignStrategyCard } from '../components/DesignStrategyCard.tsx'
import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { MusicCard } from '../components/MusicCard.tsx'
import { TestimonialCard } from '../components/TestimonialCard.tsx'
import { WorkExperienceCard } from '../components/WorkExperienceCard.tsx'
import { AskDock, askStudies, type AskStudy } from '../components/AskDock.tsx'
import { PortfolioNav } from '../components/PortfolioNav.tsx'
import { ProgressiveBlur } from '../components/ProgressiveBlur.tsx'
import { HowIWorkDialog } from '../components/HowIWorkDialog.tsx'
import { howIWorkContent } from '../components/howIWorkContent.ts'
import { DrawerTools, ProjectDrawer, useSheetKeys } from '../components/ProjectDrawer.tsx'
import {
  projectFromHash,
  useProjectDrawer,
  type ProjectId,
} from '../components/useProjectDrawer.ts'
import { ThemeToggleVisual } from '../components/ThemeToggle.tsx'
import { useTheme } from '../theme.tsx'
import {
  ProjectFisheyeField,
  type FisheyeLayout,
} from '../components/ProjectFisheyeField.tsx'
import { aboutMeCard, heroContent, landingCards, allProjectsContent } from './landingContent.ts'
import type { LandingCardContent, LandingTool } from './landingContent.ts'
import './landing.css'
import { CardIcon } from '../components/CardIcon.tsx'
import './landing-type.css'

const cursorLabel = 'View project'

function ProjectCardIcon({ onMedia = false }: { onMedia?: boolean }) {
  return (
    <span
      className={onMedia ? 'project-card-icon is-on-media' : 'project-card-icon'}
      aria-hidden="true"
    >
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

function ProjectCardMedia({ card }: { card: LandingCardContent }) {
  if (card.videoSrc) {
    // Decorative: the card's own title says what it is. Reduced motion keeps the first frame still.
    const still = window.matchMedia(reducedMotionQuery).matches
    return (
      <span className="project-card-media is-fill is-video">
        {/* A blurred copy masked to the edges gives the blurred border; Chrome ignores masks on backdrop-filter here. */}
        {['is-sharp', 'is-edge'].map((layer) => (
          <video
            key={layer}
            className={layer}
            src={card.videoSrc}
            autoPlay={!still}
            muted
            loop
            playsInline
            preload={still ? 'metadata' : 'auto'}
            aria-hidden="true"
          />
        ))}
      </span>
    )
  }

  if (card.imageFrame && card.imageSrc) {
    return (
      <span className="project-card-media is-fill">
        <img
          src={card.imageSrc}
          alt={card.imageAlt ?? ''}
          loading="lazy"
          decoding="async"
          style={{
            left: card.imageFrame.left,
            top: card.imageFrame.top,
            width: card.imageFrame.width,
            height: card.imageFrame.height,
            borderRadius: card.imageRadius,
          }}
        />
      </span>
    )
  }

  if (!card.mediaSlot || !card.mediaHeight) {
    return null
  }

  return (
    <span
      className="project-card-media"
      data-media-slot={card.mediaSlot}
      style={{ height: card.mediaHeight }}
    >
      {card.imageSrc ? (
        <img src={card.imageSrc} alt={card.imageAlt ?? ''} />
      ) : null}
    </span>
  )
}

/*
  Tools logos fly in from above the viewport (Butter-style void entry), then
  settle into the grid. Flight clones live in a page-level layer so travel is
  visible above the Tools card; in-grid faces stay opacity 0 until landing.
  Timing matches the homepage card entrance (soft decelerate + short stagger).
  The clones' targets are viewport coordinates measured at take-off, so they
  are only valid while the grid stays put: if the page pans (wheel, drag,
  keys) or resizes mid-flight, the flight is dropped and the real logos fade
  in where the grid actually is.
*/
const toolEnterDurationMs = 1250
const toolEnterStaggerMs = 55
const toolEnterBaseDelayMs = 40
const toolEnterEasing = 'cubic-bezier(0.16, 1, 0.3, 1)'
const toolInterruptFadeMs = 160
const toolMoveTolerancePx = 1

function settleToolMotions(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>('[data-tool-motion]')
    .forEach((el) => el.classList.add('is-settled'))
}

function ToolGrid({ tools }: { tools: readonly LandingTool[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root || entered) return

    if (window.matchMedia(reducedMotionQuery).matches) {
      setEntered(true)
      settleToolMotions(root)
      return
    }

    const page = root.closest<HTMLElement>('.landing-page')
    const target =
      root.closest<HTMLElement>('.project-card-tools-shipped') ?? root
    let done = false
    let observer: IntersectionObserver | null = null
    let mo: MutationObserver | null = null

    const play = () => {
      if (done) return
      done = true
      setEntered(true)
      observer?.disconnect()
      mo?.disconnect()
    }

    const watch = () => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) play()
        },
        { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
      )
      observer.observe(target)
    }

    // Page-load swoop moves cards through the viewport — wait until it settles.
    if (page?.classList.contains('is-entrance-pending')) {
      mo = new MutationObserver(() => {
        if (!page.classList.contains('is-entrance-done')) return
        mo?.disconnect()
        watch()
      })
      mo.observe(page, { attributes: true, attributeFilter: ['class'] })
    } else {
      watch()
    }

    return () => {
      observer?.disconnect()
      mo?.disconnect()
    }
  }, [entered])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !entered) return

    const motions = Array.from(
      root.querySelectorAll<HTMLElement>('[data-tool-motion]'),
    )
    const faces = Array.from(
      root.querySelectorAll<HTMLElement>('.tool-tile-face'),
    )
    if (motions.length === 0 || faces.length === 0) {
      settleToolMotions(root)
      return
    }

    if (window.matchMedia(reducedMotionQuery).matches) {
      settleToolMotions(root)
      return
    }

    let cancelled = false
    let layer: HTMLDivElement | null = null
    const animations: Animation[] = []
    const failSafe = window.setTimeout(() => {
      if (cancelled) return
      stopWatching()
      settleToolMotions(root)
      layer?.remove()
      layer = null
    }, toolEnterDurationMs + toolEnterBaseDelayMs + faces.length * toolEnterStaggerMs + 400)

    try {
      layer = document.createElement('div')
      layer.className = 'tool-flight-layer'
      layer.setAttribute('aria-hidden', 'true')
      document.body.appendChild(layer)

      for (let index = 0; index < faces.length; index += 1) {
        const face = faces[index]
        const rect = face.getBoundingClientRect()
        if (rect.width < 1 || rect.height < 1) continue

        const clone = face.cloneNode(true) as HTMLElement
        clone.classList.add('tool-flight-item')
        clone.style.left = `${rect.left}px`
        clone.style.top = `${rect.top}px`
        clone.style.width = `${rect.width}px`
        clone.style.height = `${rect.height}px`
        // Start fully above the viewport — long travel through open page space.
        const startY = -rect.top - rect.height - 32
        layer.appendChild(clone)

        animations.push(
          clone.animate(
            [
              { transform: `translate3d(0, ${startY}px, 0)` },
              { transform: 'translate3d(0, 0, 0)' },
            ],
            {
              duration: toolEnterDurationMs,
              delay: toolEnterBaseDelayMs + index * toolEnterStaggerMs,
              easing: toolEnterEasing,
              fill: 'both',
            },
          ),
        )
      }

      if (animations.length === 0) {
        settleToolMotions(root)
        layer.remove()
        layer = null
        window.clearTimeout(failSafe)
        return
      }
    } catch {
      settleToolMotions(root)
      layer?.remove()
      layer = null
      window.clearTimeout(failSafe)
      return
    }

    // Watch the grid's on-screen origin for the length of the flight.
    const takeOff = root.getBoundingClientRect()
    let monitor = 0
    let finished = false

    const stopWatching = () => {
      finished = true
      if (monitor) cancelAnimationFrame(monitor)
      monitor = 0
      window.removeEventListener('wheel', checkMoved)
      window.removeEventListener('keydown', checkMoved)
      window.removeEventListener('pointermove', checkMoved)
      window.removeEventListener('resize', checkMoved)
    }

    // The grid moved under the clones: drop the flight and show the real
    // logos in place with a short crossfade instead of a detached landing.
    const interrupt = () => {
      if (finished || cancelled) return
      stopWatching()
      window.clearTimeout(failSafe)
      settleToolMotions(root)
      const flight = layer
      layer = null
      if (!flight) return
      for (const motion of root.querySelectorAll<HTMLElement>('[data-tool-motion]')) {
        motion.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: toolInterruptFadeMs,
          easing: 'ease-out',
        })
      }
      flight
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: toolInterruptFadeMs,
          easing: 'ease-out',
          fill: 'forwards',
        })
        .finished.catch(() => undefined)
        .then(() => flight.remove())
    }

    function checkMoved() {
      if (finished || cancelled) return
      const now = root!.getBoundingClientRect()
      if (
        Math.abs(now.left - takeOff.left) > toolMoveTolerancePx ||
        Math.abs(now.top - takeOff.top) > toolMoveTolerancePx ||
        Math.abs(now.width - takeOff.width) > toolMoveTolerancePx
      ) {
        interrupt()
      }
    }

    const tick = () => {
      checkMoved()
      if (!finished && !cancelled) monitor = requestAnimationFrame(tick)
    }
    monitor = requestAnimationFrame(tick)
    // Events catch moves even when frames are throttled (background tabs).
    window.addEventListener('wheel', checkMoved, { passive: true })
    window.addEventListener('keydown', checkMoved)
    window.addEventListener('pointermove', checkMoved, { passive: true })
    window.addEventListener('resize', checkMoved)

    void Promise.all(
      animations.map((anim) => anim.finished.catch(() => undefined)),
    ).then(() => {
      window.clearTimeout(failSafe)
      if (cancelled || finished) return
      stopWatching()
      settleToolMotions(root)
      layer?.remove()
      layer = null
    })

    return () => {
      cancelled = true
      stopWatching()
      window.clearTimeout(failSafe)
      for (const anim of animations) anim.cancel()
      layer?.remove()
      layer = null
    }
  }, [entered])

  return (
    <div
      ref={rootRef}
      className={entered ? 'tool-enter is-in' : 'tool-enter'}
    >
      <ul className="tool-grid">
        {tools.map((tool, index) => (
          <li key={`${tool.name}-${index}`} className="tool-tile">
            <span className="tool-tile-motion" data-tool-motion="">
              <span className="tool-tile-face">
                {tool.logoSrc ? (
                  <img
                    className={
                      tool.preserveColor ? 'tool-logo is-color' : 'tool-logo'
                    }
                    src={tool.logoSrc}
                    alt={tool.name}
                    width={55}
                    height={55}
                  />
                ) : (
                  <span className="tool-name">{tool.name}</span>
                )}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProjectCardHeader({ card }: { card: LandingCardContent }) {
  if (card.imageFrame || card.showcaseTone) {
    const light = card.showcaseTone === 'light'
    return (
      <span className="project-card-header is-overlay">
        <span className="project-card-copy">
          <span
            className={
              light
                ? 'project-card-label is-display is-on-light'
                : 'project-card-label is-display'
            }
          >
            <ProjectCardIcon onMedia />
            <span className="project-card-title">{card.label}</span>
          </span>
          {card.summary ? <p className="project-card-summary">{card.summary}</p> : null}
        </span>
        {card.status ? <ShippedBadge onMedia>{card.status}</ShippedBadge> : null}
      </span>
    )
  }

  return (
    <span className="project-card-header">
      <span className="project-card-label">
        {card.icon ? <CardIcon name={card.icon} /> : <ProjectCardIcon />}
        {card.label}
      </span>
      {card.status ? <ShippedBadge>{card.status}</ShippedBadge> : null}
    </span>
  )
}

/** Keyword pills scrolling along the card's bottom edge; the second copy only closes the loop. */
function ProjectCardBadges({ badges }: { badges: readonly string[] }) {
  return (
    <span className="project-card-badges">
      <span className="project-card-badges-track">
        {[0, 1].map((copy) => (
          <span key={copy} className="project-card-badges-set" aria-hidden={copy === 1 || undefined}>
            {badges.map((badge) => (
              <span key={badge} className="project-card-badge">{badge}</span>
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}

function projectIdFromHref(href: string): ProjectId | null {
  return projectFromHash(`#${href.replace(/^\//, '')}`)
}

/* Real code for the Building in Code text wall, coloured like an IDE. */
const wallSnippets = [
  `import { useState } from 'react'

export function ProjectCard({ title, tags }) {
  const [open, setOpen] = useState(false)

  return (
    <article className="card" onClick={() => setOpen(!open)}>
      <h3>{title}</h3>
      {open && (
        <ul>
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </article>
  )
}`,
  `.card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: var(--glass);
  backdrop-filter: blur(25px);
}

.card:hover {
  transform: translateY(-2px);
  transition: transform 200ms ease;
}

@media (max-width: 760px) {
  .card { padding: 10px; }
}`,
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Abhishek Kashid</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main id="main">
      <section class="hero">
        <h1>Design, Code & AI Workflows.</h1>
        <a href="/work" class="button">View work</a>
      </section>
    </main>
    <script type="module" src="/main.js"></script>
  </body>
</html>`,
  `// Ship the build once the checks pass
async function deploy(project) {
  const checks = await runChecks(project)
  if (checks.some((check) => !check.passed)) {
    throw new Error('Fix the failing checks first')
  }

  const build = await bundle({ minify: true, target: 'es2022' })
  const url = await upload(build, { region: 'ap-south-1' })

  console.log(\`Live at \${url}\`)
  return { url, size: build.size, time: Date.now() }
}

deploy({ name: 'portfolio', branch: 'main' })`,
]

type WallToken = { text: string; kind?: string }

const wallKeyword = /^(?:import|export|from|const|let|function|return|async|await|if|throw|new)$/

const wallTokenPattern =
  /(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|[{}()[\]]|<\/?[\w-]+|(?<!=)\/?>|\b(?:import|export|from|const|let|function|return|async|await|if|throw|new)\b|\b\d+(?:px|ms)?\b)/g

/** Splits a snippet into coloured tokens; bracket colour follows nesting depth across lines, as editors do. */
function wallTokens(snippet: string): WallToken[][] {
  let depth = 0
  return snippet.split('\n').map((line) =>
    line.split(wallTokenPattern).filter(Boolean).map((text) => {
      if (/^[{([]$/.test(text)) return { text, kind: `bracket-${depth++ % 3}` }
      if (/^[})\]]$/.test(text)) return { text, kind: `bracket-${--depth % 3}` }
      if (text.startsWith('//')) return { text, kind: 'comment' }
      if (/^['"`]/.test(text)) return { text, kind: 'string' }
      if (/^<\/?[\w-]|^\/?>$/.test(text)) return { text, kind: 'tag' }
      if (/^\d/.test(text)) return { text, kind: 'number' }
      if (wallKeyword.test(text)) return { text, kind: 'keyword' }
      return { text }
    }),
  )
}

const wallSnippetTokens = wallSnippets.map(wallTokens)
// Waves: one ripple every wallWaveEveryMs, travelling from the centre past the corners in wallWaveMs.
const wallWaveEveryMs = 2000
const wallWaveMs = 1400
/** How far the front travels, in card half-widths: past the corners (about 1.41) plus the band. */
const wallWaveReach = 1.6
/** Width of the scrambling, glowing band at the wave front. */
const wallWaveBand = 0.22
/** Every snippet gets this many waves; the first decrypts it into place from the centre. */
const wallWavesPerSnippet = 4
const wallTickMs = 50
/** Chance per tick that a settled character flickers to a random glyph. */
const wallShimmer = 0.008
const wallGlyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789+/=:.'

function wallGlyph() {
  return wallGlyphs[Math.floor(Math.random() * wallGlyphs.length)]
}

/**
 * One character as the wave passes. `distance` is how far it sits from the card's
 * centre (1 = the edge). Ahead of the front it shows its code, or nothing while a
 * new snippet decrypts; in the band it scrambles; behind it the code settles.
 */
function wallChar(char: string, distance: number, front: number, decrypting: boolean, shimmer: number) {
  if (char === ' ') return char
  if (distance > front) return decrypting ? ' ' : char
  if (distance > front - wallWaveBand) return wallGlyph()
  return Math.random() < shimmer ? wallGlyph() : char
}

/**
 * Text wall after reflect.app's hero: code that ripples. Waves start at the centre;
 * where the front passes, characters scramble and tokens glow, then settle back.
 * Text is written straight to the DOM on a timer (no React render per tick) and
 * pauses while the card is off-screen. Decorative, so hidden from screen readers.
 */
function TextWall() {
  const rootRef = useRef<HTMLSpanElement>(null)
  const [snippet, setSnippet] = useState(() => Math.floor(Math.random() * wallSnippetTokens.length))
  const lines = wallSnippetTokens[snippet]
  // A few tokens stay lit between waves, picked again for each snippet.
  const glowing = useMemo(
    () => lines.map((line) => line.map((token) => /\S/.test(token.text) && Math.random() < 0.06)),
    [lines],
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    // [layer][line][token] elements, so every layer gets the same text.
    const layers = [...root.querySelectorAll('.project-card-text-wall-layer')].map((layer) =>
      [...layer.children].map((line) => [...line.children] as HTMLElement[]),
    )

    // Each character's distance from the card's centre, in half-widths and half-heights,
    // so the wave front is an ellipse that matches the card. offset* ignores fisheye scaling.
    const width = root.offsetWidth
    const height = root.offsetHeight
    const probe = document.createElement('span')
    probe.textContent = 'M'.repeat(20)
    root.querySelector('.project-card-text-wall-layer')?.append(probe)
    const charWidth = probe.offsetWidth / 20 || 6
    probe.remove()
    const lineHeight = 16
    const padding = 14
    const top = (height - lines.length * lineHeight) / 2
    const distances = lines.map((line, row) => {
      let column = 0
      return line.map((token) => {
        const out = Array.from(token.text, (_, i) => {
          const x = padding + (column + i + 0.5) * charWidth
          const y = top + (row + 0.5) * lineHeight
          return Math.hypot((x - width / 2) / (width / 2), (y - height / 2) / (height / 2))
        })
        column += token.text.length
        return out
      })
    })

    const paint = (front: number, decrypting: boolean, shimmer: number) => {
      lines.forEach((line, row) => {
        line.forEach((token, index) => {
          const near = distances[row][index]
          let text = ''
          let inWave = false
          for (let i = 0; i < token.text.length; i += 1) {
            const char = token.text[i]
            if (char !== ' ' && near[i] <= front && near[i] > front - wallWaveBand) inWave = true
            text += wallChar(char, near[i], front, decrypting, shimmer)
          }
          for (const layer of layers) {
            const element = layer[row][index]
            if (element.textContent !== text) element.textContent = text
            element.classList.toggle('is-wave', inWave)
          }
        })
      })
    }

    if (window.matchMedia(reducedMotionQuery).matches) {
      paint(Infinity, false, 0)
      return
    }

    let visible = true
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(root)

    const begin = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - begin
      const wave = Math.floor(elapsed / wallWaveEveryMs)
      if (wave >= wallWavesPerSnippet) {
        window.clearInterval(timer)
        setSnippet((current) => (current + 1) % wallSnippetTokens.length)
        return
      }
      if (!visible) return
      const front = ((elapsed - wave * wallWaveEveryMs) / wallWaveMs) * wallWaveReach
      paint(front, wave === 0, wallShimmer)
    }, wallTickMs)

    return () => {
      window.clearInterval(timer)
      observer.disconnect()
    }
  }, [lines])

  return (
    <span ref={rootRef} className="project-card-text-wall" aria-hidden="true">
      {['is-sharp', 'is-soft'].map((layer) => (
        <span key={layer} className={`project-card-text-wall-layer ${layer}`}>
          {lines.map((line, index) => (
            <span key={`${snippet}-${index}`}>
              {line.length === 0 ? ' ' : null}
              {line.map((token, at) => (
                <i
                  key={at}
                  className={[token.kind ? `is-${token.kind}` : '', glowing[index][at] ? 'is-glow' : ''].filter(Boolean).join(' ') || undefined}
                >
                  {token.text.replace(/\S/g, ' ')}
                </i>
              ))}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

/*
  Node graph behind "Designing AI Product", after reflect.app's "connected" card:
  the centre pops in, lines draw out to each tool, and the tools pop in with their
  labels, on a 468-wide canvas whose y runs 0–100 (% of the space between header and title, so the graph sits centred there). Delays follow the reference; the
  nodes fan out above the title so every label has room. The centre is an AI blob.
*/
const aiGraphCentre = { x: 240, y: 78, rgb: '164, 121, 255' }
const aiGraphTools = [
  { name: 'Claude', x: 78, y: 52, rgb: '217, 119, 87', node: '0.25s', line: '0.5s', flow: '2.5s', logo: '/landing/tools/claude.webp' },
  { name: 'ChatGPT', x: 300, y: 20, rgb: '16, 163, 127', node: '1s', line: '1s', flow: '3.1s', logo: '/landing/tools/chatgpt.webp' },
  { name: 'Gemini', x: 402, y: 52, rgb: '66, 133, 244', node: '1.5s', line: '1.2s', flow: '3.7s', logo: null },
] as const

/** Gemini's four-point sparkle, drawn here since the project has no Gemini logo file. */
function GeminiMark({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285f4" />
          <stop offset="0.55" stopColor="#9b72cb" />
          <stop offset="1" stopColor="#d96570" />
        </linearGradient>
      </defs>
      <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z" fill={`url(#${id})`} />
    </svg>
  )
}

function AiGraph() {
  const rootRef = useRef<HTMLSpanElement>(null)
  const id = useId()

  // Plays each time the card comes into view, like the reference's on-scroll build.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia(reducedMotionQuery).matches) {
      root.classList.add('is-playing')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) root.classList.add('is-playing')
        else if (!entry.isIntersecting) root.classList.remove('is-playing')
      },
      { threshold: [0, 0.5] },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const at = (x: number, y: number) => ({ left: `${(x / 468) * 100}%`, top: `${y}%` })

  return (
    <span ref={rootRef} className="ai-graph" aria-hidden="true">
      <svg className="ai-graph-lines" viewBox="0 0 468 100" preserveAspectRatio="none">
        <defs>
          {aiGraphTools.map((tool) => (
            <linearGradient
              key={tool.name}
              id={`${id}-${tool.name}`}
              x1={tool.x}
              y1={tool.y}
              x2={aiGraphCentre.x}
              y2={aiGraphCentre.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={`rgb(${tool.rgb})`} />
              <stop offset="1" stopColor={`rgb(${aiGraphCentre.rgb})`} />
            </linearGradient>
          ))}
        </defs>
        {aiGraphTools.map((tool) => {
          const mid = aiGraphCentre.x + (tool.x - aiGraphCentre.x) / 2
          const d = `M${aiGraphCentre.x} ${aiGraphCentre.y}C${mid} ${aiGraphCentre.y} ${mid} ${tool.y} ${tool.x} ${tool.y}`
          return (
            <g key={tool.name}>
              <path d={d} pathLength={1} stroke={`url(#${id}-${tool.name})`} style={{ animationDelay: tool.line }} />
              {/* A bright pulse running from the tool into the orb, on repeat once the line has drawn. */}
              <path
                className="ai-graph-flow"
                d={d}
                pathLength={1}
                stroke={`url(#${id}-${tool.name})`}
                style={{ color: `rgb(${tool.rgb})`, animationDelay: tool.flow }}
              />
            </g>
          )
        })}
      </svg>
      <span
        className="ai-graph-node is-centre"
        style={{ ...at(aiGraphCentre.x, aiGraphCentre.y), '--rgb': aiGraphCentre.rgb, '--delay': '0s' } as CSSProperties}
      >
        <span className="ai-graph-node-inner">
          <span className="ai-graph-blob" />
        </span>
      </span>
      {aiGraphTools.map((tool) => (
        <span
          key={tool.name}
          className="ai-graph-node"
          style={{ ...at(tool.x, tool.y), '--rgb': tool.rgb, '--delay': tool.node } as CSSProperties}
        >
          <span className="ai-graph-node-inner">
            {tool.logo ? <img src={tool.logo} alt="" /> : <GeminiMark id={`${id}-gemini-mark`} />}
          </span>
          <span className="ai-graph-label">{tool.name}</span>
        </span>
      ))}
    </span>
  )
}

function ProjectCard({
  card,
  activeProject,
  onOpenProject,
}: {
  card: LandingCardContent
  activeProject?: ProjectId | null
  onOpenProject?: (id: ProjectId, opener: HTMLAnchorElement) => void
}) {
  const projectId = card.href ? projectIdFromHref(card.href) : null
  const showcase = Boolean(card.imageFrame || card.showcaseTone)
  const showcaseTone = card.showcaseTone ?? (showcase ? 'dark' : undefined)
  const className = [
    'project-card',
    `project-card-${card.id}`,
    card.href ? 'project-card-link' : '',
    card.statement ? 'project-card-statement-layout' : '',
    showcase ? 'is-showcase' : '',
    showcaseTone ? `is-showcase-${showcaseTone}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const style = !showcase && card.height ? { height: card.height } : undefined
  const surfaceClass = showcase
    ? showcaseTone === 'light'
      ? 'project-card-surface is-media is-light'
      : 'project-card-surface is-media is-dark'
    : card.surfacePadding === 14
      ? 'project-card-surface is-spacious'
      : 'project-card-surface'

  const openProject = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!projectId || !onOpenProject) return
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return
    }
    event.preventDefault()
    onOpenProject(projectId, event.currentTarget)
  }

  const body = (
    <span className={surfaceClass}>
      {card.textWall ? <TextWall /> : null}
      {card.aiGraph ? <AiGraph /> : null}
      <ProjectCardHeader card={card} />
      {card.statement ? (
        <p className="project-card-statement">{card.statement}</p>
      ) : card.tools ? (
        <ToolGrid tools={card.tools} />
      ) : (
        <ProjectCardMedia card={card} />
      )}
      {card.badges ? <ProjectCardBadges badges={card.badges} /> : null}
      {card.href ? <span className="visually-hidden">{cursorLabel}</span> : null}
    </span>
  )

  return (
    <HoverCard
      className={className}
      href={card.href}
      style={style}
      ariaExpanded={projectId ? activeProject === projectId : undefined}
      ariaControls={projectId ? 'project-drawer' : undefined}
      onClick={projectId ? openProject : undefined}
    >
      {body}
    </HoverCard>
  )
}

/** Slim card under the projects (Figma 352-825); its button opens the All Projects sheet. */
function AllProjectsCard({ onOpen }: { onOpen: (opener: HTMLElement) => void }) {
  return (
    <HoverCard className="project-card all-projects-card">
      <span className="project-card-surface all-projects-card-surface">
        <span className="all-projects-card-title">{allProjectsContent.title}</span>
        <button
          type="button"
          className="all-projects-card-action"
          aria-haspopup="dialog"
          onClick={(event) => onOpen(event.currentTarget)}
        >
          {allProjectsContent.action}
        </button>
      </span>
    </HoverCard>
  )
}

/** Plays the sheet's slide-down before closing; with reduced motion there is nothing to wait on. */
function closeSheet(dialog: HTMLDialogElement | null) {
  if (!dialog) return
  dialog.classList.add('is-closing')
  void Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished)).then(() => dialog.close())
}

/** Full-screen sheet of every project, filtered by category tab and type chip (Figma 352-843). */
function AllProjectsDialog({
  opener,
  onClose,
  onOpenProject,
}: {
  opener: HTMLElement
  onClose: () => void
  onOpenProject: (id: ProjectId, opener: HTMLElement) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [filterIndex, setFilterIndex] = useState(0)
  const category = allProjectsContent.categories[categoryIndex]
  const filter = category.filters[filterIndex]

  // Not modal: like the project drawer, the nav and chat stay on top, and useSheetKeys keeps focus in scope.
  useEffect(() => {
    dialogRef.current?.show()
    closeRef.current?.focus({ preventScroll: true })
  }, [])
  const requestClose = useCallback(() => closeSheet(dialogRef.current), [])
  useSheetKeys(dialogRef, requestClose)

  return (
    <dialog
      ref={dialogRef}
      // Shares How I Work's sheet classes: same padding, tabs on the controls row, same tab buttons.
      className="sheet-dialog how-i-work all-projects"
      aria-labelledby="all-projects-title"
      onClose={() => {
        if (opener.isConnected) opener.focus({ preventScroll: true })
        onClose()
      }}
    >
      <DrawerTools closeLabel="Close All Projects" onClose={requestClose} closeRef={closeRef} />
      <div className="how-i-work-shell">
        <h2 id="all-projects-title" className="visually-hidden">
          {allProjectsContent.title}
        </h2>
        <div className="how-i-work-tabs" role="group" aria-label="Project category">
          {allProjectsContent.categories.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className="how-i-work-tab"
              aria-pressed={index === categoryIndex}
              onClick={() => {
                setCategoryIndex(index)
                setFilterIndex(0)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {category.filters.length > 0 ? (
          <div className="how-i-work-tabs all-projects-filters" role="group" aria-label="Project type">
            {category.filters.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className="how-i-work-tab"
                aria-pressed={index === filterIndex}
                onClick={() => setFilterIndex(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        <div key={`${categoryIndex}-${filterIndex}`} className="all-projects-grid" aria-live="polite">
          {filter ? (
            filter.projects.map((key) => (
              <ProjectCard
                key={key}
                card={landingCards[key]}
                onOpenProject={(id) => {
                  // The project sheet slides over this one, so it closes without its own slide.
                  dialogRef.current?.close()
                  onOpenProject(id, opener)
                }}
              />
            ))
          ) : (
            <p className="all-projects-empty">{allProjectsContent.empty}</p>
          )}
        </div>
      </div>
    </dialog>
  )
}

function HeroIntroduction() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const themeLabel = isDark ? 'Dark Mode' : heroContent.themeLabel

  return (
    <header className="hero-introduction" data-repel="">
      <div className="hero-heading-block">
        <h1 className="hero-headline">{heroContent.headline}</h1>
        <div className="hero-role-row">
          <p className="hero-role">
            <span className="hero-role-design">{heroContent.roleDesign}</span>{' '}
            <span className="hero-role-engineer">{heroContent.roleEngineer}</span>
          </p>
          <HoverCard className="theme-status" tag="div">
            <button
              type="button"
              className="theme-status-surface"
              aria-pressed={isDark}
              aria-label={themeLabel}
              onClick={toggleTheme}
            >
              <span className="theme-status-label">{themeLabel}</span>
              <ThemeToggleVisual />
            </button>
          </HoverCard>
        </div>
      </div>
      <p className="hero-summary">{heroContent.summary}</p>
    </header>
  )
}

/**
 * Hero and theme switch for assistive tech and keyboard users; the visible
 * copies live inside the aria-hidden fisheye field.
 */
function AccessibleHero({ themeButton = true }: { themeButton?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header>
      <h1 className="visually-hidden">{heroContent.headline}</h1>
      <p className="visually-hidden">
        {heroContent.roleDesign} {heroContent.roleEngineer}.{' '}
        {heroContent.summary}
      </p>
      {themeButton ? (
        <button
          type="button"
          className="skip-link"
          aria-pressed={isDark}
          onClick={toggleTheme}
        >
          {isDark ? 'Dark Mode' : heroContent.themeLabel}
        </button>
      ) : null}
    </header>
  )
}

/**
 * Figma "Portfolio 2026", node 2-14 (Desktop 1440 × 1313): card rects in
 * design px, relative to the content frame at gutters 35 / 34. Item numbers
 * follow the field's child order (0 is the hero). The left group and the
 * case-study column loop vertically on their own heights.
 */
const fisheyeLayout: FisheyeLayout = {
  rowInsetX: 0,
  width: 1370,
  gutterX: 35,
  gutterY: 34,
  minScale: 0.85,
  maxScale: 1.2,
  strips: [
    {
      height: 1245,
      items: [
        { item: 0, x: 0, y: 0, w: 584, h: 173 },
        { item: 1, x: 0, y: 197, w: 584, h: 297 },
        { item: 2, x: 0, y: 518, w: 281, h: 297 },
        { item: 3, x: 303, y: 518, w: 281, h: 297 },
        { item: 4, x: 608, y: 0, w: 315, h: 351 },
        { item: 5, x: 608, y: 375, w: 315, h: 209 },
        { item: 6, x: 608, y: 608, w: 315, h: 207 },
        { item: 7, x: 0, y: 839, w: 449.5, h: 191 },
        { item: 8, x: 473.5, y: 839, w: 449.5, h: 191 },
        { item: 9, x: 0, y: 1054, w: 923, h: 191 },
      ],
    },
    {
      // Projects column: Quik, Agentic AI, Power Apps + CRM, then View All. The rest live in the All Projects sheet.
      height: 1204,
      items: [
        { item: 10, x: 947, y: 0, w: 423, h: 360 },
        { item: 11, x: 947, y: 384, w: 423, h: 360 },
        { item: 12, x: 947, y: 768, w: 423, h: 360 },
        { item: 13, x: 947, y: 1152, w: 423, h: 52 }, // All Projects
      ],
    },
  ],
}

/**
 * Phone sheet, drawn at 393px. One 361px column, centred with 16px each side
 * and an 8px gap so both neighbours peek in equally, in the exact top-to-bottom
 * order of Figma node 92-2, repeated across the sheet with each repeat shifted
 * vertically, so every column reads in that order. Rows start 61px down so the
 * first clears the nav, yet the loop seam stays 18px. Design Strategy isn't in
 * the frame; it sits last so it never interrupts the Figma sequence. Agentic AI
 * and Quik aren't either; they join the other projects.
 */
const phoneFisheyeLayout: FisheyeLayout = {
  viewWidth: 393,
  rowInsetX: 16,
  staggerColumns: true,
  width: 369,
  gutterX: 0,
  gutterY: 9,
  minScale: 0.8,
  maxScale: 1.45,
  strips: [
    {
      height: 3523,
      items: [
        { item: 0, x: 16, y: 61, w: 361, h: 240 }, // 1 Hero
        { item: 1, x: 16, y: 319, w: 361, h: 321 }, // 2 About Me
        { item: 2, x: 16, y: 658, w: 361, h: 323 }, // 3 Quik assistant
        { item: 3, x: 16, y: 999, w: 361, h: 323 }, // 4 Agentic AI
        { item: 4, x: 16, y: 1340, w: 361, h: 323 }, // 5 Power Apps + CRM
        { item: 13, x: 16, y: 1681, w: 361, h: 52 }, // All Projects
        { item: 5, x: 16, y: 1751, w: 361, h: 208 }, // Tools
        { item: 6, x: 16, y: 1977, w: 361, h: 158 }, // Building in Code
        { item: 7, x: 16, y: 2153, w: 361, h: 158 }, // Designing AI Product
        { item: 8, x: 16, y: 2329, w: 361, h: 158 }, // Storytelling + Play
        { item: 9, x: 16, y: 2505, w: 361, h: 212 }, // Testimonial
        { item: 10, x: 16, y: 2735, w: 361, h: 191 }, // Current
        { item: 11, x: 16, y: 2944, w: 361, h: 200 }, // Music: small turntable beside controls
        { item: 12, x: 16, y: 3162, w: 361, h: 300 }, // Design Strategy: wheel only
      ],
    },
  ],
}

const badgeSize = 96
const finePointerQuery = '(hover: hover) and (pointer: fine)'
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const followStiffness = 800
const followDamping = 35
const fadeStiffness = 500
const fadeDamping = 30

function stepSpring(
  value: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const acceleration = stiffness * (target - value) - damping * velocity
  return [value + (velocity + acceleration * dt) * dt, velocity + acceleration * dt] as const
}

function ProjectPointerBadge() {
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const badge = badgeRef.current
    if (!badge) return

    const finePointer = window.matchMedia(finePointerQuery)
    const reducedMotion = window.matchMedia(reducedMotionQuery)
    if (!finePointer.matches) return

    const half = badgeSize / 2
    const edge = 10
    let x = -100
    let y = -100
    let velocityX = 0
    let velocityY = 0
    let opacity = 0
    let velocityOpacity = 0
    let scale = 0.8
    let velocityScale = 0
    let targetX = -100
    let targetY = -100
    let shown = false
    let frame = 0
    let last = performance.now()

    const clampToViewport = (clientX: number, clientY: number) => ({
      x: Math.min(window.innerWidth - half - edge, Math.max(half + edge, clientX)),
      y: Math.min(window.innerHeight - half - edge, Math.max(half + edge, clientY)),
    })

    const cardFrom = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLElement>('.project-card-link')
        : null

    const paint = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000)
      last = now
      const targetOpacity = shown ? 1 : 0
      const targetScale = shown ? 1 : 0.8

      if (reducedMotion.matches) {
        x = targetX
        y = targetY
        opacity = targetOpacity
        scale = targetScale
        velocityX = 0
        velocityY = 0
        velocityOpacity = 0
        velocityScale = 0
      } else {
        ;[x, velocityX] = stepSpring(x, velocityX, targetX, followStiffness, followDamping, dt)
        ;[y, velocityY] = stepSpring(y, velocityY, targetY, followStiffness, followDamping, dt)
        ;[opacity, velocityOpacity] = stepSpring(
          opacity,
          velocityOpacity,
          targetOpacity,
          fadeStiffness,
          fadeDamping,
          dt,
        )
        ;[scale, velocityScale] = stepSpring(
          scale,
          velocityScale,
          targetScale,
          fadeStiffness,
          fadeDamping,
          dt,
        )
      }

      badge.style.opacity = String(Math.max(0, Math.min(1, opacity)))
      badge.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`

      const settled =
        Math.hypot(x - targetX, y - targetY) < 0.4 &&
        Math.abs(opacity - targetOpacity) < 0.01 &&
        Math.abs(scale - targetScale) < 0.01 &&
        Math.hypot(velocityX, velocityY) < 0.4
      frame = settled ? 0 : requestAnimationFrame(paint)
    }

    const ensureFrame = () => {
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(paint)
      }
    }

    const place = (clientX: number, clientY: number) => {
      const next = clampToViewport(clientX, clientY)
      targetX = next.x
      targetY = next.y
      ensureFrame()
    }

    const revealAt = (clientX: number, clientY: number) => {
      const wasHidden = !shown
      shown = true
      place(clientX, clientY)
      if (wasHidden && Math.hypot(targetX - x, targetY - y) > 48) {
        x = targetX
        y = targetY
        velocityX = 0
        velocityY = 0
        badge.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !finePointer.matches) return
      const card = cardFrom(event.target)
      if (card && !shown) {
        revealAt(event.clientX, event.clientY)
        return
      }
      shown = Boolean(card)
      place(event.clientX, event.clientY)
    }

    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const card = cardFrom(event.target)
      if (!card || cardFrom(event.relatedTarget)) return
      if (card.matches(':focus-visible')) return
      shown = false
      ensureFrame()
    }

    // Keyboard users reach projects through the fisheye field's link list
    // (the panned tiles are out of tab order); point the badge at the
    // matching card that is on screen, the nearest one to the centre.
    const onScreenCardFor = (link: Element) => {
      const href = link.getAttribute('href')
      if (!href || !link.closest('.project-fisheye-links')) return null
      let best: HTMLElement | null = null
      let bestDistance = Infinity
      document
        .querySelectorAll<HTMLElement>('.project-card-link')
        .forEach((candidate) => {
          if (candidate.getAttribute('href') !== href) return
          const rect = candidate.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return
          const distance = Math.hypot(
            x - window.innerWidth / 2,
            y - window.innerHeight / 2,
          )
          if (distance < bestDistance) {
            best = candidate
            bestDistance = distance
          }
        })
      return best as HTMLElement | null
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !target.matches(':focus-visible')) return
      const card = cardFrom(target) ?? onScreenCardFor(target)
      if (!card) return
      const rect = card.getBoundingClientRect()
      revealAt(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }

    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget
      if (
        cardFrom(next) ||
        (next instanceof Element && next.closest('.project-fisheye-links'))
      ) {
        return
      }
      shown = Boolean(document.querySelector('.project-card-link:hover'))
      ensureFrame()
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerout', onPointerOut)
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return createPortal(
    <div ref={badgeRef} className="view-project-badge" aria-hidden="true">
      <span className="view-project-badge-label">
        <span>View</span>
        <span>project</span>
      </span>
    </div>,
    document.body,
  )
}

/*
  dousanmiao.com entrance (from their bundle):
  ox/oy = (cardCenter - viewportCenter) * 0.6
  soft decelerate; delay = 0.25s + index * 0.04s
  Animates the fisheye field's [data-entrance] layers only: the tile above
  keeps the lens transform and the card below keeps hover/repel, so the three
  transforms never overwrite each other.
*/
const entranceOffsetFactor = 0.6
const entranceBaseDelayMs = 250
const entranceStaggerMs = 40
const entranceDurationMs = 1150
const entranceEasing = 'cubic-bezier(0.16, 1, 0.3, 1)'

function entranceOffset(
  rect: DOMRect,
  cx: number,
  cy: number,
  factor: number,
  maxTravel: number,
  minTravel: number,
) {
  const dx = rect.left + rect.width / 2 - cx
  const dy = rect.top + rect.height / 2 - cy
  let ox = dx * factor
  let oy = dy * factor
  const mag = Math.hypot(ox, oy)
  if (mag > maxTravel && mag > 0) {
    const scale = maxTravel / mag
    ox *= scale
    oy *= scale
  } else if (mag < minTravel) {
    const dir = Math.hypot(dx, dy) || 1
    ox = (dx / dir) * minTravel
    oy = (dy / dir) * minTravel
  }
  return [ox, oy] as const
}

/** Cards render hidden behind this class until the swoop starts. */
const entrancePendingOnLoad = () =>
  !window.matchMedia(reducedMotionQuery).matches

function useCardEntrance(
  rootRef: RefObject<HTMLElement | null>,
  onDone: () => void,
) {
  // A passive effect runs after the fisheye field has painted its tiles, so
  // every card is measured at its real (lens-warped) Figma position.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const runEntrance = () => {
      const stage = root.closest<HTMLElement>('.landing-stage')
      const reducedMotion = window.matchMedia(reducedMotionQuery)
      const viewW = window.innerWidth
      const viewH = window.innerHeight
      // Only cards on screen at load swoop; off-screen copies just appear.
      const tiles = Array.from(
        root.querySelectorAll<HTMLElement>('[data-entrance]'),
      ).filter((el) => {
        const rect = el.getBoundingClientRect()
        return (
          rect.right > 0 && rect.bottom > 0 && rect.left < viewW && rect.top < viewH
        )
      })

      const markDone = () => {
        root.classList.remove('is-entrance-pending')
        root.classList.add('is-entrance-done')
        stage?.classList.remove('is-entrance-pending')
        onDone()
      }

      // Windows "Animation effects" off → prefers-reduced-motion: reduce → skip swoop.
      if (reducedMotion.matches || tiles.length === 0) {
        markDone()
        return
      }

      const cx = viewW / 2
      const cy = viewH / 2
      const narrow = window.innerWidth < 768
      const factor = narrow ? 0.55 : entranceOffsetFactor
      const maxTravel = narrow
        ? Math.min(window.innerWidth, window.innerHeight) * 0.55
        : Math.max(window.innerWidth, window.innerHeight) * 0.7
      const minTravel = narrow ? 96 : 160

      root.classList.remove('is-entrance-done')
      root.classList.add('is-entrance-pending')
      stage?.classList.add('is-entrance-pending')

      const animations: Animation[] = tiles.map((el, index) => {
        const rect = el.getBoundingClientRect()
        const [ox, oy] = entranceOffset(rect, cx, cy, factor, maxTravel, minTravel)
        el.getAnimations().forEach((anim) => anim.cancel())
        return el.animate(
          [
            { transform: `translate3d(${ox}px, ${oy}px, 0)`, opacity: 0 },
            { transform: 'translate3d(0px, 0px, 0)', opacity: 1 },
          ],
          {
            duration: entranceDurationMs,
            delay: entranceBaseDelayMs + index * entranceStaggerMs,
            easing: entranceEasing,
            fill: 'both',
          },
        )
      })

      let cancelled = false
      const finish = () => {
        if (cancelled) return
        cancelled = true
        window.clearTimeout(failsafe)
        // Final keyframe is identity, so cancelling lands exactly in place.
        for (const anim of animations) anim.cancel()
        markDone()
      }
      // Never leave cards hidden if an animation stalls (e.g. a hidden tab).
      const failsafe = window.setTimeout(
        finish,
        entranceBaseDelayMs +
          tiles.length * entranceStaggerMs +
          entranceDurationMs +
          800,
      )
      void Promise.all(
        animations.map((anim) => anim.finished.catch(() => undefined)),
      ).then(finish)

      return () => {
        // Strict Mode remount: cancel and let the next run replay from hidden
        // (the pending class keeps the final layout from flashing early).
        cancelled = true
        window.clearTimeout(failsafe)
        for (const anim of animations) anim.cancel()
      }
    }

    // The loader goes first; the cards start swooping only once it has gone.
    startPageLoader(root)
    let stopEntrance: (() => void) | undefined
    let disposed = false
    void pageLoaderDone.then(() => {
      if (!disposed) stopEntrance = runEntrance()
    })
    return () => {
      disposed = true
      stopEntrance?.()
    }
  }, [rootRef, onDone])
}

function useTileHover(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }

    const finePointer = window.matchMedia(finePointerQuery)
    const reducedMotion = window.matchMedia(reducedMotionQuery)
    let pointerTile: HTMLElement | null = null
    let focusTile: HTMLElement | null = null
    let activeTile: HTMLElement | null = null

    const tileOf = (node: EventTarget | null) =>
      node instanceof Element
        ? node.closest<HTMLElement>('[data-hover-tile]')
        : null

    const centerOf = (tile: HTMLElement) => {
      const rect = tile.getBoundingClientRect()
      return [rect.left + rect.width / 2, rect.top + rect.height / 2]
    }

    const clearRepel = () => {
      root.querySelectorAll<HTMLElement>('[data-repel]').forEach((tile) => {
        tile.style.removeProperty('--repel-x')
        tile.style.removeProperty('--repel-y')
      })
    }

    const sync = () => {
      const next = focusTile ?? pointerTile
      if (next === activeTile) {
        return
      }
      activeTile?.classList.remove('is-tile-active')
      activeTile = next

      // Prefer CSS transitions driven by custom props — never React state per move.
      // Skip decorative repel/scale work when the OS asks for reduced motion.
      if (reducedMotion.matches) {
        clearRepel()
        next?.classList.add('is-tile-active')
        return
      }

      const tiles = root.querySelectorAll<HTMLElement>('[data-repel]')
      const origin = next ? centerOf(next) : null

      tiles.forEach((tile) => {
        if (!origin || !next || tile.contains(next)) {
          tile.style.removeProperty('--repel-x')
          tile.style.removeProperty('--repel-y')
          return
        }
        const [x, y] = centerOf(tile)
        const dx = x - origin[0]
        const dy = y - origin[1]
        const distance = Math.hypot(dx, dy)
        if (!distance) {
          return
        }
        const push = Math.min(5000 / distance, 30)
        tile.style.setProperty('--repel-x', `${(dx / distance) * push}px`)
        tile.style.setProperty('--repel-y', `${(dy / distance) * push}px`)
      })

      next?.classList.add('is-tile-active')
    }

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !finePointer.matches) {
        return
      }
      pointerTile = tileOf(event.target)
      sync()
    }

    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return
      }
      const next = tileOf(event.relatedTarget)
      if (next !== pointerTile) {
        pointerTile = next
        sync()
      }
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (target instanceof Element && target.matches(':focus-visible')) {
        focusTile = tileOf(target)
        sync()
      }
    }

    const onFocusOut = () => {
      focusTile = null
      sync()
    }

    const onMotionChange = () => {
      clearRepel()
      activeTile?.classList.remove('is-tile-active')
      activeTile = null
      sync()
    }

    root.addEventListener('pointerover', onPointerOver)
    root.addEventListener('pointerout', onPointerOut)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      root.removeEventListener('pointerover', onPointerOver)
      root.removeEventListener('pointerout', onPointerOut)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      reducedMotion.removeEventListener('change', onMotionChange)
      activeTile?.classList.remove('is-tile-active')
      clearRepel()
    }
  }, [rootRef])
}

function HoverCard({
  className,
  href,
  style,
  tag = 'article',
  ariaExpanded,
  ariaControls,
  onClick,
  children,
}: {
  className: string
  href?: string
  style?: CSSProperties
  tag?: 'article' | 'div'
  ariaExpanded?: boolean
  ariaControls?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  children: ReactNode
}) {
  const surfaceProps = {
    className,
    style,
    'data-hover-tile': '',
    'data-repel': tag === 'div' ? undefined : '',
    children,
  }

  if (href) {
    return (
      <a
        href={href}
        aria-haspopup={onClick ? 'dialog' : undefined}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        onClick={onClick}
        {...surfaceProps}
      />
    )
  }

  if (tag === 'div') {
    return <div {...surfaceProps} />
  }

  return <article {...surfaceProps} />
}

/*
  Phone layout, Figma "Portfolio 2026" node 92-2 (iPhone 16, 393px): the same
  cards in the Figma order down every column of a two-axis fisheye sheet that
  loops every way, with the menu top-left and the toggle top-right.
*/
const mobileLayoutQuery = '(max-width: 760px)'

function subscribeMobileLayout(onChange: () => void) {
  const query = window.matchMedia(mobileLayoutQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function useMobileLayout() {
  return useSyncExternalStore(
    subscribeMobileLayout,
    () => window.matchMedia(mobileLayoutQuery).matches,
  )
}

function MobileHero() {
  return (
    <header className="mobile-hero">
      <div className="mobile-hero-title">
        <h1 className="hero-headline">{heroContent.headline}</h1>{' '}
        <p className="hero-role">
          <span className="hero-role-design">{heroContent.roleDesign}</span>{' '}
          <span className="hero-role-engineer">{heroContent.roleEngineer}</span>
        </p>
      </div>
      <p className="hero-summary">{heroContent.summary}</p>
    </header>
  )
}

function MobileThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="mobile-theme-toggle"
      aria-pressed={isDark}
      aria-label={isDark ? 'Dark Mode' : heroContent.themeLabel}
      onClick={toggleTheme}
    >
      <ThemeToggleVisual />
    </button>
  )
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const { projectId, open, close } = useProjectDrawer()
  const askStudy = projectId && projectId in askStudies ? (projectId as AskStudy) : null
  const [drawerPresent, setDrawerPresent] = useState(
    () => projectFromHash(window.location.hash) !== null,
  )
  useTileHover(pageRef)
  const [entrancePending] = useState(entrancePendingOnLoad)
  // Held in state so a later className change (crossing the phone breakpoint)
  // can't bring back the hidden entrance state.
  const [entranceDone, setEntranceDone] = useState(false)
  const markEntranceDone = useCallback(() => setEntranceDone(true), [])
  useCardEntrance(pageRef, markEntranceDone)
  const isMobile = useMobileLayout()
  const [howIWorkOpener, setHowIWorkOpener] = useState<HTMLElement | null>(null)
  const [allProjectsOpener, setAllProjectsOpener] = useState<HTMLElement | null>(null)
  // The sheets bring their own theme toggle and close, so the page's floating ones step aside.
  const sheetOpen = allProjectsOpener !== null || howIWorkOpener !== null

  useEffect(() => {
    if (drawerPresent) return
    const opener = openerRef.current
    openerRef.current = null
    if (opener?.isConnected) {
      opener.focus({ preventScroll: true })
    }
  }, [drawerPresent])

  const openProject = (id: ProjectId, opener: HTMLElement) => {
    openerRef.current = opener
    open(id)
  }

  const fieldLinks = [
    {
      href: landingCards.titleColumnTop.href!,
      label: landingCards.titleColumnTop.label,
      onOpen: (opener: HTMLAnchorElement) => openProject('case-study-1', opener),
    },
    {
      href: landingCards.titleColumnMiddle.href!,
      label: landingCards.titleColumnMiddle.label,
      onOpen: (opener: HTMLAnchorElement) => openProject('case-study-2', opener),
    },
    {
      href: landingCards.titleColumnBottom.href!,
      label: landingCards.titleColumnBottom.label,
      onOpen: (opener: HTMLAnchorElement) => openProject('case-study-3', opener),
    },
    {
      href: landingCards.agenticAi.href,
      label: landingCards.agenticAi.label,
      onOpen: (opener: HTMLAnchorElement) => openProject('case-study-4', opener),
    },
    {
      href: landingCards.quikAssistant.href,
      label: landingCards.quikAssistant.label,
      onOpen: (opener: HTMLAnchorElement) => openProject('case-study-5', opener),
    },
  ]

  return (
    <>
      <div className="landing-stage">
        <div
          className={[
            'landing-stage-canvas',
            projectId ? 'is-covered' : drawerPresent ? 'is-revealing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          inert={drawerPresent || sheetOpen}
        >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div
        ref={pageRef}
        className={[
          'landing-page',
          'is-fisheye-page',
          isMobile ? 'is-mobile-stack' : '',
          entranceDone
            ? 'is-entrance-done'
            : entrancePending
              ? 'is-entrance-pending'
              : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <AccessibleHero themeButton={!isMobile} />
        {isMobile ? (
        <main
          id={drawerPresent ? undefined : 'main'}
          className="landing-fisheye-main"
        >
          <ProjectFisheyeField
            phone
            aria-label="Portfolio — drag in any direction to explore"
            layout={phoneFisheyeLayout}
            links={fieldLinks}
          >
            <MobileHero />
            <div id="about">
              <AboutMeCard
                content={aboutMeCard}
                onHowIWork={setHowIWorkOpener}
              />
            </div>
            <ProjectCard
              card={landingCards.quikAssistant}
              activeProject={projectId}
              onOpenProject={openProject}
            />
            <ProjectCard
              card={landingCards.agenticAi}
              activeProject={projectId}
              onOpenProject={openProject}
            />
            <ProjectCard card={landingCards.powerAppsCrm} />
            <ProjectCard card={landingCards.toolsShipped} />
            <ProjectCard card={landingCards.buildingInCode} />
            <ProjectCard card={landingCards.designingAiProduct} />
            <ProjectCard card={landingCards.storytellingPlay} />
            <TestimonialCard />
            <WorkExperienceCard />
            <MusicCard />
            <DesignStrategyCard />
            <AllProjectsCard onOpen={setAllProjectsOpener} />
          </ProjectFisheyeField>
        </main>
        ) : (
        <main
          id={drawerPresent ? undefined : 'main'}
          className="landing-fisheye-main"
        >
          <ProjectFisheyeField
            aria-label="Portfolio — drag to explore"
            layout={fisheyeLayout}
            links={[
              ...fieldLinks,
              // The card's own button is out of tab order, like every panned tile.
              {
                href: '#about',
                label: howIWorkContent.title,
                onOpen: setHowIWorkOpener,
              },
            ]}
          >
            <div className="fisheye-hero-tile">
              <HeroIntroduction />
            </div>
            <DesignStrategyCard />
            <ProjectCard card={landingCards.buildingInCode} />
            <ProjectCard card={landingCards.designingAiProduct} />
            <div id="about">
              <AboutMeCard
                content={aboutMeCard}
                onHowIWork={setHowIWorkOpener}
              />
            </div>
            <ProjectCard card={landingCards.toolsShipped} />
            <ProjectCard card={landingCards.storytellingPlay} />
            <WorkExperienceCard />
            <MusicCard />
            <TestimonialCard />
            <ProjectCard
              card={landingCards.quikAssistant}
              activeProject={projectId}
              onOpenProject={openProject}
            />
            <ProjectCard
              card={landingCards.agenticAi}
              activeProject={projectId}
              onOpenProject={openProject}
            />
            <ProjectCard card={landingCards.powerAppsCrm} />
            <AllProjectsCard onOpen={setAllProjectsOpener} />
          </ProjectFisheyeField>
        </main>
        )}
      </div>
        </div>
      </div>
      <ProjectPointerBadge />
      {!drawerPresent ? <ProgressiveBlur mode="fixed" /> : null}
      {isMobile && !drawerPresent && !sheetOpen ? <MobileThemeToggle /> : null}
      {allProjectsOpener ? (
        <AllProjectsDialog
          opener={allProjectsOpener}
          onClose={() => setAllProjectsOpener(null)}
          onOpenProject={openProject}
        />
      ) : null}
      {howIWorkOpener ? (
        <HowIWorkDialog
          opener={howIWorkOpener}
          onClose={() => setHowIWorkOpener(null)}
        />
      ) : null}
      <AskDock
        // A new key on opening a sheet resets the dock, so the nav button shows rather than the chat bar left over from panning.
        key={howIWorkOpener ? 'how-i-work' : allProjectsOpener ? 'all-projects' : (askStudy ?? 'site')}
        study={howIWorkOpener ? 'how-i-work' : askStudy}
        hidden={drawerPresent && !askStudy}
      />
      <PortfolioNav
        onHowIWork={isMobile && !drawerPresent ? setHowIWorkOpener : undefined}
        activeProject={projectId}
        onOpenProject={open}
        onCloseProject={close}
      />
      <ProjectDrawer
        projectId={projectId}
        onClose={close}
        onSelect={open}
        onPresenceChange={setDrawerPresent}
      />
    </>
  )
}
