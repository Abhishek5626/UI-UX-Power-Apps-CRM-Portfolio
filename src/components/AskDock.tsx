import { useEffect, useRef, useState, type FormEvent } from 'react'
import './ask-dock.css'

const calLink = 'abhishek-kashid-nqthrz/15min'
/** Add these to show the matching buttons. A button with no value stays hidden. */
const contact = { email: '', whatsapp: '', resume: '/resume.pdf' }

const suggestions = [
  { label: 'Your team', question: 'What would you build for my team?' },
  { label: 'Pricing', question: 'How much would a project cost?' },
  { label: 'Build it', question: 'How fast can you build our AI tool?' },
  { label: 'Adoption', question: 'Why does nobody use the AI we shipped?' },
]

/** The case studies with their own facts in api/ask.ts. Each gets its own chat. */
export const askStudies = {
  'case-study-4': {
    greeting: 'I’m Abhishek’s AI assistant. Ask me anything about the Agentic AI case study.',
    prompt: 'What result is this aiming for?',
    suggestions: [
      { label: 'Outcome', question: 'What is the outcome of this project?' },
      { label: 'Time', question: 'How much time does an urgent order take now, and with the agents?' },
      { label: 'Easier', question: 'How does it make life easier for buyers and merchants?' },
      { label: 'Proof', question: 'How will you know it worked?' },
    ],
  },
  'case-study-5': {
    greeting: 'I’m Abhishek’s AI assistant. Ask me anything about the Quik assistant case study.',
    prompt: 'What is the outcome of this project?',
    suggestions: [
      { label: 'Outcome', question: 'What is the outcome of this project?' },
      { label: 'Results', question: 'What results is it aiming for?' },
      { label: 'Easier', question: 'How does it make life easier for people using Quik?' },
      { label: 'Time', question: 'How fast could a new user launch with it?' },
    ],
  },
} as const

export type AskStudy = keyof typeof askStudies

const noReply = 'I can’t answer right now. Please book a call with Abhishek instead.'
const SWAP_AFTER_PX = 24
const OPEN_MS = 420
const CLOSE_MS = 240
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)'
const PANEL_REST = 'translateY(24px) scale(0.96)'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Message = { role: 'user' | 'assistant'; content: string }
type CalApi = ((...args: unknown[]) => void) & { loaded?: boolean; q?: unknown[]; ns?: object }

/** Cal.com's own loader, run on the first click so visitors who never book don't download it. */
function openCalendar() {
  const host = window as unknown as { Cal?: CalApi }
  if (!host.Cal) {
    const cal: CalApi = (...args) => {
      cal.q!.push(args)
    }
    cal.q = []
    cal.ns = {}
    host.Cal = cal
    document.head.appendChild(document.createElement('script')).src = 'https://app.cal.com/embed/embed.js'
    cal('init', { origin: 'https://cal.com' })
  }
  host.Cal('modal', {
    calLink,
    config: { theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light' },
  })
}

function Sparkles({ size }: { size: number }) {
  return (
    <svg className="ask-sparkles" width={size} height={size} viewBox="0 0 16 15" fill="currentColor" aria-hidden="true">
      <path d="M16 6.89C10.88 8.82 11.34 8.11 9.53 13.4 7.72 8.11 8.19 8.82 3.07 6.89 8.19 4.97 7.72 5.68 9.53.39 11.34 5.68 10.88 4.97 16 6.89ZM6.04 11.97C3.65 12.87 3.87 12.53 3.02 15 2.18 12.53 2.39 12.87 0 11.97 2.39 11.07 2.18 11.4 3.02 8.92 3.87 11.4 3.65 11.07 6.04 11.97ZM6.3 2.07C4.67 2.68 4.82 2.46 4.24 4.14 3.67 2.46 3.82 2.68 2.19 2.07 3.82 1.46 3.67 1.68 4.24 0 4.82 1.68 4.67 1.46 6.3 2.07Z" />
    </svg>
  )
}

function Arrow({ size }: { size: number }) {
  return (
    <svg className="ask-arrow" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="12" />
      <path d="M12 16V8M15.2 11.5 12 8l-3.2 3.5" fill="none" strokeWidth=".76" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Send() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth=".83" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.55 5.45a.95.95 0 0 0-.28-.18L.96 3.94a.21.21 0 0 1 .01-.39L8.89.84a.21.21 0 0 1 .27.27L6.45 9.03a.21.21 0 0 1-.39.01L4.73 5.73a.95.95 0 0 0-.18-.28Zm0 0L9.1.9" />
    </svg>
  )
}

function Avatar({ size }: { size: 'large' | 'small' }) {
  return (
    <span className={`ask-avatar is-${size}`} aria-hidden="true">
      <img src="/case-study-1/avatar-abhishek.webp" alt="" />
      <span className="ask-avatar-badge">
        <Sparkles size={11} />
      </span>
    </span>
  )
}

export function AskDock({ hidden, study = null }: { hidden: boolean; study?: AskStudy | null }) {
  const copy = study ? askStudies[study] : null
  const [showing, setShowing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const closingRef = useRef(false)

  // The landing page pans rather than scrolls, so direction comes from the wheel, drags and keys.
  // A case study scrolls its drawer, so direction there comes from the scroll position.
  useEffect(() => {
    if (hidden) return
    let travelled = 0
    let lastY = 0
    let dragY: number | null = null
    const move = (down: number) => {
      if (dialogRef.current?.open) return
      travelled = Math.sign(down) === Math.sign(travelled) ? travelled + down : down
      if (Math.abs(travelled) >= SWAP_AFTER_PX) setShowing(travelled > 0)
    }
    const onField = (target: EventTarget | null) => target instanceof Element && target.closest('.project-fisheye-field')
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.matches('.project-drawer-scroll')) return
      const y = event.target.scrollTop
      move(y - lastY)
      lastY = y
    }
    const onWheel = (event: WheelEvent) => {
      if (onField(event.target) && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) move(event.deltaY)
    }
    const onDown = (event: PointerEvent) => {
      dragY = onField(event.target) ? event.clientY : null
    }
    const onMove = (event: PointerEvent) => {
      if (dragY === null) return
      move(dragY - event.clientY)
      dragY = event.clientY
    }
    const onUp = () => {
      dragY = null
    }
    const onKey = (event: KeyboardEvent) => {
      if (!onField(event.target)) return
      if (event.key === 'ArrowDown' || event.key === 'PageDown') setShowing(true)
      if (event.key === 'ArrowUp' || event.key === 'PageUp') setShowing(false)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
    }
  }, [hidden])

  // The nav button lives in PortfolioNav, so it reads this state from the page.
  useEffect(() => {
    const root = document.documentElement
    if (showing && !hidden) root.dataset.askDock = 'chat'
    return () => {
      delete root.dataset.askDock
    }
  }, [showing, hidden])

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages])

  if (hidden) return null

  const ask = async (question: string) => {
    const text = question.trim().slice(0, 500)
    if (!text || busy) return
    const history = [...messages, { role: 'user' as const, content: text }].slice(-9)
    const controller = new AbortController()
    requestRef.current = controller
    setDraft('')
    setBusy(true)
    setMessages([...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    const write = (content: string) =>
      setMessages((current) => [...current.slice(0, -1), { role: 'assistant', content }])
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, study }),
        signal: controller.signal,
      })
      if (!response.ok || !response.body) throw new Error('No reply')
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let reply = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        reply += value
        write(reply)
      }
      if (!reply) write(noReply)
    } catch {
      if (!controller.signal.aborted) write(noReply)
    } finally {
      if (requestRef.current === controller) setBusy(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void ask(draft)
  }

  const newChat = () => {
    requestRef.current?.abort()
    requestRef.current = null
    setBusy(false)
    setMessages([])
    setDraft('')
  }

  // Focusing on phones would open the keyboard over the suggestions.
  const openPanel = () => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
    if (reducedMotion()) return
    // The panel rises out of the bar, then its contents settle in order.
    const timing = { duration: OPEN_MS, easing: EASE_OUT }
    dialog.animate({ opacity: [0, 1], transform: [PANEL_REST, 'none'] }, timing)
    dialog.animate({ opacity: [0, 1] }, { ...timing, pseudoElement: '::backdrop' })
    dialog.querySelectorAll('.ask-head, .ask-log, .ask-compose').forEach((part, index) => {
      part.animate(
        { opacity: [0, 1], transform: ['translateY(8px)', 'none'] },
        { ...timing, delay: 60 + index * 50, fill: 'backwards' },
      )
    })
  }

  const closePanel = () => {
    const dialog = dialogRef.current
    if (!dialog?.open || closingRef.current) return
    if (reducedMotion()) {
      dialog.close()
      return
    }
    closingRef.current = true
    const timing = { duration: CLOSE_MS, easing: EASE_IN, fill: 'forwards' as const }
    const runs = [
      dialog.animate({ opacity: [1, 0], transform: ['none', PANEL_REST] }, timing),
      dialog.animate({ opacity: [1, 0] }, { ...timing, pseudoElement: '::backdrop' }),
    ]
    void Promise.allSettled(runs.map((run) => run.finished)).then(() => {
      dialog.close()
      runs.forEach((run) => run.cancel())
      closingRef.current = false
    })
  }

  // Cal.com's popup can't sit above a modal dialog, so the chat closes first and keeps its messages.
  const book = () => {
    dialogRef.current?.close()
    openCalendar()
  }

  const bookLink = (className: string, label: string) => (
    <a
      className={className}
      href={`https://cal.com/${calLink}`}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        event.preventDefault()
        book()
      }}
    >
      {label}
    </a>
  )

  return (
    <>
      <div className={showing ? 'ask-dock is-showing' : 'ask-dock'}>
        <div className="ask-glass">
          <div className="ask-tint">
            <button type="button" className="ask-open" onClick={openPanel}>
              <span className="ask-open-text">
                <Sparkles size={16} />
                <span className="ask-prompt is-wide">{copy?.prompt ?? 'How fast can you build our AI tool?'}</span>
                <span className="ask-prompt is-narrow">{copy ? 'Ask about this work' : 'Ask about my work'}</span>
              </span>
              <Arrow size={24} />
            </button>
            {contact.resume && !study ? (
              <a className="ask-chip ask-dock-resume" href={contact.resume} download="Abhishek Kashid Resume.pdf">
                <Send />
                Download Resume
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="ask-panel"
        aria-label="Ask Abhishek"
        onCancel={(event) => {
          event.preventDefault()
          closePanel()
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) closePanel()
        }}
      >
        <div className="ask-panel-inner">
          <header className="ask-head">
            <div className="ask-head-who">
              <Avatar size="large" />
              <div>
                <h2 className="ask-title">Ask Abhishek</h2>
                <p className="ask-subtitle">
                  AI assistant <span aria-hidden="true">·</span> answers from this site
                </p>
              </div>
            </div>
            <div className="ask-head-actions">
              {bookLink('ask-book', 'Book a call')}
              <button type="button" className="ask-new" onClick={newChat}>
                New Chat
              </button>
              <button type="button" className="ask-close" aria-label="Close" onClick={closePanel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            </div>
          </header>

          <div ref={logRef} className="ask-log" aria-live="polite">
            <div className="ask-column">
              <div className="ask-card">
                <div className="ask-card-who">
                  <Avatar size="small" />
                  <p className="ask-card-name">Abhishek’s assistant</p>
                </div>
                <p className="ask-card-text">{copy?.greeting ?? 'I’m Abhishek’s AI assistant. I answer from this site only.'}</p>
              </div>
              {messages.length === 0 ? (
                <div className="ask-suggestions">
                  {(copy?.suggestions ?? suggestions).map(({ label, question }) => (
                    <button key={label} type="button" className="ask-card ask-suggestion" onClick={() => void ask(question)}>
                      <span className="ask-suggestion-label">{label}</span>
                      <span className="ask-card-text">{question}</span>
                    </button>
                  ))}
                </div>
              ) : (
                messages.map((message, index) =>
                  message.role === 'user' ? (
                    <p key={index} className="ask-mine">
                      {message.content}
                    </p>
                  ) : (
                    <div key={index} className="ask-card">
                      <div className="ask-card-who">
                        <Avatar size="small" />
                        <p className="ask-card-name">Abhishek’s assistant</p>
                      </div>
                      {message.content ? (
                        <p className="ask-card-text">{message.content}</p>
                      ) : (
                        <p className="ask-card-text ask-thinking">Thinking…</p>
                      )}
                    </div>
                  ),
                )
              )}
            </div>
          </div>

          <div className="ask-compose">
            <div className="ask-chips">
              {bookLink('ask-chip ask-chip-book', 'Book a call')}
              {contact.email ? (
                <a className="ask-chip" href={`mailto:${contact.email}`}>
                  <Send />
                  Email me
                </a>
              ) : null}
              {contact.whatsapp ? (
                <a className="ask-chip" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">
                  <Send />
                  WhatsApp me
                </a>
              ) : null}
              {contact.resume ? (
                <a className="ask-chip" href={contact.resume} download="Abhishek Kashid Resume.pdf">
                  <Send />
                  Download Resume
                </a>
              ) : null}
            </div>
            <form className="ask-form" onSubmit={onSubmit}>
              <Sparkles size={16} />
              <input
                ref={inputRef}
                className="ask-input"
                aria-label="Ask about Abhishek’s work"
                placeholder={copy?.prompt ?? 'How fast can you build our AI tool?'}
                maxLength={500}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit" className="ask-send" aria-label="Send" disabled={!draft.trim() || busy}>
                <Arrow size={24} />
              </button>
            </form>
            <p className="ask-note">
              AI-generated replies <span aria-hidden="true">·</span> grounded in this site
            </p>
          </div>
        </div>
      </dialog>
    </>
  )
}
