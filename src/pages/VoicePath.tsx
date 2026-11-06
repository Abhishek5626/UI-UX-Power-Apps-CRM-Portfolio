import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './voice-path.css'

// Moments measured on the reference, in ms after the buyer starts the call.
const FIRST_CHECK = 620
const SECOND_CHECK = 1230
const QUESTION = 1940
const ANSWERS = 2565
const LISTENING = 4460
const WORKING_ENDS = 1600

// B3: each source ticks in the phone, then in the side story.
const SEARCH_MOMENTS = [533, 632, 1058, 1240, 1581, 1860, 2547]
// B4: five decisions tick in turn, the call ends, and the order moves to WhatsApp.
const DECIDE_MOMENTS = [612, 1225, 1841, 2449, 3059, 3768, 7033]
const decisions = [
  { label: 'Hard rules passed', kind: 'ok' },
  { label: 'Fit score against the threshold', kind: 'ok', note: 'Water pump: Hollen scores 90 against the cooling threshold of 85. Timing belt kit: the original part scores 100 against the threshold of 85.' },
  { label: 'Preference', kind: 'ok' },
  { label: 'The buyer’s agent: over the company’s limit', kind: 'person', note: '€325.50 is over the €300 limit, so the workshop owner decides.' },
  { label: 'Outcome: orders, after approval', kind: 'wait', note: '€325.50, over the buyer’s limit.' },
]
// After approval: the second check, then the tick and the end of "Working".
const APPROVED_CHECK = 683
const APPROVED_SETTLES = 1400
// B6: three delivery checks, then the order is ready to confirm.
const DELIVER_MOMENTS = [651, 1263, 1870, 2597]
const deliveries = ['Stock held at the Utrecht branch', 'Van booked, by a sales rep in the pilot', 'Order written to the ERP']
// B7: the agent reads the order back, then the receipt offers undo. The chip's fill runs until the order moves on.
const CONFIRM_MOMENTS = [619, 1231]
const MOVES_ON = 4761
// B8: delivery checks, then the buyer confirms the fit.
const RECORD_MOMENTS = [624, 1231, 1842]
const FIT_SETTLES = 616
const records = [
  { label: 'Undo closed, the order stands' },
  { label: 'Delivered' },
  { label: '4 minutes from the first message to the order', note: 'It waited for the approver, so the pilot times it with the wait, in its own group.' },
]
const readBacks = ['Read back by voice', 'Receipt sent on WhatsApp']
const noteBars = [4, 8, 12, 7, 14, 9, 5, 11, 16, 8, 6, 13, 10, 5, 9, 14, 7, 11, 5, 8, 12, 6, 10, 4]
const receipt = [
  { name: '1 x Water pump, metal impeller', detail: 'Hollen, fit 90, arrives 10:45', price: '€148.60', icon: 'M8 2.500a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM8 2.500V6M8 10v3.500M2.5 8H6M10 8h3.5' },
  { name: '1 x Timing belt kit', detail: 'Original part, fit 100, arrives 10:45', price: '€176.90', icon: 'M5 4.500a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM11 7.500a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5.8 4.700l6.4 3M4.2 8.300l6 3' },
]
const sources = [
  { name: 'Main warehouse', detail: 'Stock and contract price', stamp: 'ERP, 2 min ago' },
  { name: 'Nearest branch', detail: 'Stock and van times', stamp: 'ERP, 2 min ago' },
  { name: 'Equivalent parts', detail: 'Cross-reference, same catalogue', stamp: 'Catalogue, 2 min ago' },
]

const bars = [0.3, 0.45, 0.6, 0.75, 0.9, 1, 0.85, 1, 0.9, 0.75, 0.6, 0.45, 0.3]
const barTimes = [1152, 1744, 1376, 1968, 1600, 1232, 1824, 1456, 2048, 1680, 1312, 1904, 1536]

const icons = {
  phone: 'M4.5 2.5h2l1 3-1.5 1a7 7 0 0 0 3.5 3.500l1-1.5 3 1v2a1.5 1.5 0 0 1-1.5 1.500A9 9 0 0 1 3 4a1.5 1.5 0 0 1 1.5-1.500Z',
  chat: 'M8 2.500a5.5 5.5 0 0 0-4.7 8.300L2.5 13.500l2.7-.800A5.5 5.5 0 1 0 8 2.500Z',
  mail: 'M2.5 4h11v8h-11zM2.5 4.5 8 9l5.5-4.5',
  search: 'M7 2.500a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM10.5 10.500l3 3',
  mic: 'M8 2a2 2 0 0 0-2 2v4a2 2 0 0 0 4 0V4a2 2 0 0 0-2-2ZM4 7.500a4 4 0 0 0 8 0M8 11.500V14',
  hangup: 'M4.5 2.5h2l1 3-1.5 1a7 7 0 0 0 3.5 3.5l1-1.5 3 1v2a1.5 1.5 0 0 1-1.5 1.5A9 9 0 0 1 3 4a1.5 1.5 0 0 1 1.5-1.5ZM2.5 2.5l11 11',
  network: 'M8 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM3.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8 6v2M3.5 10V8h9v2',
  split: 'M2 8a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M11 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M11 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M5 7.25l6-2.5M5 8.75l6 2.5',
  speaker: 'M2.5 6v4h2.5L8.5 13V3L5 6ZM11 6a3 3 0 0 1 0 4M12.5 4a5.5 5.5 0 0 1 0 8',
  play: 'M5 3.5v9l7-4.5-7-4.5Z',
  calendar: 'M3 4h10v9.5H3ZM3 7h10M5.5 2.5V5M10.5 2.5V5',
  record: 'M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3Z',
  back: 'M10 3.5 5.5 8 10 12.5',
  swap: 'M2.5 5.5h10M10 3l2.5 2.5L10 8M13.5 10.5h-10M6 8l-2.5 2.5L6 13',
  approve: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM5.5 8l2 2 3-3.5',
  chevron: 'M6 3.5 10.5 8 6 12.5',
  person: 'M8 7.500a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 13.500c.5-2.5 2.2-3.8 4.5-3.800s4 1.3 4.5 3.8',
}

export function ReceiptLines() {
  return (
    <div className="vp-receipt">
      {receipt.map((line) => (
        <div key={line.name} className="vp-receipt-line">
          <span className="vp-thumb">
            <Icon path={line.icon} size={24} />
          </span>
          <span className="vp-receipt-text">
            <span className="vp-receipt-name">{line.name}</span>
            <span className="vp-receipt-detail">{line.detail}</span>
            <span className="vp-stamp">
              <span className="vp-stamp-dot" />
              ERP, 2 min ago
            </span>
          </span>
          <span className="vp-receipt-price">{line.price}</span>
        </div>
      ))}
    </div>
  )
}

function Icon({ path, size }: { path: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Stage = 'lock' | 'call' | 'search' | 'decide' | 'deliver' | 'confirm' | 'record'

export function VoicePath({ onContinue }: { onContinue: (index: number) => void }) {
  const [stage, setStage] = useState<Stage>('lock')
  const [clock, setClock] = useState(0)
  const [muted, setMuted] = useState(false)
  const [moment, setMoment] = useState(0)
  const [working, setWorking] = useState(false)
  const [answer, setAnswer] = useState('')
  const [onOwnerPhone, setOnOwnerPhone] = useState(false)
  const [ownerOpened, setOwnerOpened] = useState(false)
  const [approved, setApproved] = useState(0)
  const [receiptAt, setReceiptAt] = useState(0)
  const [fit, setFit] = useState(0)
  const approvalTimers = useRef<number[]>([])
  const captionsRef = useRef<HTMLDivElement>(null)

  const moveToRecord = () => {
    setMoment(0)
    setWorking(true)
    setStage('record')
  }

  useEffect(() => {
    if (stage === 'lock') return
    const moments = stage === 'call' ? [FIRST_CHECK, SECOND_CHECK, QUESTION, ANSWERS, LISTENING] : stage === 'search' ? SEARCH_MOMENTS.slice(0, 6) : stage === 'decide' ? DECIDE_MOMENTS : stage === 'deliver' ? DELIVER_MOMENTS.slice(0, 3) : stage === 'confirm' ? CONFIRM_MOMENTS : RECORD_MOMENTS
    const timers = moments.map((at, i) => window.setTimeout(() => setMoment(i + 1), at))
    if (stage === 'call') timers.push(window.setTimeout(() => setWorking(false), WORKING_ENDS))
    if (stage === 'decide') timers.push(window.setTimeout(() => setWorking(false), DECIDE_MOMENTS[6]))
    if (stage === 'confirm') {
      timers.push(window.setTimeout(() => setWorking(false), CONFIRM_MOMENTS[1]))
      timers.push(window.setTimeout(moveToRecord, MOVES_ON))
    }
    if (stage === 'record') timers.push(window.setTimeout(() => setWorking(false), RECORD_MOMENTS[2]))
    if (stage === 'deliver') {
      timers.push(
        window.setTimeout(() => {
          setMoment(0)
          setStage('confirm')
        }, DELIVER_MOMENTS[3]),
      )
    }
    if (stage === 'search') {
      timers.push(
        window.setTimeout(() => {
          setMoment(0)
          setStage('decide')
        }, SEARCH_MOMENTS[6]),
      )
    }
    const tick = window.setInterval(() => setClock((seconds) => seconds + 1), 1000)
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      window.clearInterval(tick)
    }
  }, [stage])

  const startCall = () => {
    setClock(0)
    setMoment(0)
    setMuted(false)
    setWorking(true)
    setOnOwnerPhone(false)
    setOwnerOpened(false)
    setApproved(0)
    setFit(0)
    setStage('call')
  }

  const openOwnerPhone = () => {
    setOnOwnerPhone(true)
    setOwnerOpened(true)
  }

  const approve = () => {
    setApproved(1)
    setWorking(true)
    approvalTimers.current = [
      window.setTimeout(() => setApproved(2), APPROVED_CHECK),
      window.setTimeout(() => setWorking(false), APPROVED_SETTLES),
    ]
  }

  const confirmFit = () => {
    setFit(1)
    setWorking(true)
    approvalTimers.current = [
      window.setTimeout(() => {
        setFit(2)
        setWorking(false)
      }, FIT_SETTLES),
    ]
  }

  const backToBuyer = () => {
    approvalTimers.current.forEach((timer) => window.clearTimeout(timer))
    setOnOwnerPhone(false)
    setMoment(0)
    setWorking(true)
    setStage('deliver')
  }

  useEffect(() => {
    if (stage === 'confirm') setReceiptAt(clock)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  useEffect(() => () => approvalTimers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const giveAnswer = (word: string) => {
    setAnswer(word)
    setMoment(0)
    setWorking(true)
    setStage('search')
  }

  useEffect(() => {
    const captions = captionsRef.current
    if (captions) captions.scrollTop = captions.scrollHeight
  }, [stage, moment])

  const deciding = stage === 'decide'
  const delivering = stage === 'deliver'
  const confirming = stage === 'confirm'
  const recording = stage === 'record'
  const receipted = confirming || recording
  const ordered = delivering || receipted
  const typing = delivering || (confirming && moment < 2) || (recording && moment < 3) || fit === 1
  const searching = stage === 'search' || deciding || ordered
  const onChat = (deciding && moment >= 6) || ordered
  // The undo window counts down from the moment the receipt arrives.
  const undoLeft = 600 - Math.max(0, clock - receiptAt)
  const approving = deciding && moment >= 7
  const asking = searching || moment >= 3
  const listening = !searching && moment >= 5
  const voiceState = deciding ? (moment >= 5 ? 'thinking' : 'ended') : muted ? 'muted' : searching ? 'thinking' : listening ? 'listening' : 'speaking'

  return (
    <div className="vp">
      <div className="vp-deck">
        {approving ? (
          <div className="vp-tabs">
            <button
              type="button"
              className={approved ? 'vp-tab is-target' : 'vp-tab'}
              aria-pressed={!onOwnerPhone}
              onClick={() => (approved ? backToBuyer() : setOnOwnerPhone(false))}
            >
              <span className="vp-tab-dot" />
              Buyer’s phone
            </button>
            {approved && onOwnerPhone ? <Icon path={icons.back} size={10} /> : ownerOpened ? null : <Icon path={icons.chevron} size={10} />}
            <button type="button" className={ownerOpened ? 'vp-tab' : 'vp-tab is-target'} aria-pressed={onOwnerPhone} onClick={openOwnerPhone}>
              <span className="vp-tab-dot" />
              Buyer’s workshop owner
            </button>
          </div>
        ) : (
          <span className="vp-tab" aria-current="true">
            <span className={stage !== 'lock' ? 'vp-tab-dot is-live' : 'vp-tab-dot'} />
            Buyer’s phone
          </span>
        )}
        <div className="vp-phone">
          <div className="vp-screen">
            {stage === 'lock' ? (
              <div className="vp-lock">
                <p className="vp-time">07:40</p>
                <div className="vp-contact">
                  <span className="vp-avatar">DP</span>
                  <span className="vp-contact-name">Delta Parts order line</span>
                  <span className="vp-contact-note">Answered by an AI ordering agent, day and night</span>
                </div>
                <div className="vp-ways">
                  <div className="vp-way">
                    <button type="button" className="vp-way-button is-voice" aria-label="Voice line, call Delta Parts" onClick={startCall}>
                      <Icon path={icons.phone} size={32} />
                    </button>
                    <span className="vp-way-label">Voice line</span>
                  </div>
                  <div className="vp-way">
                    <button type="button" className="vp-way-button is-chat" aria-label="WhatsApp, message Delta Parts" onClick={() => onContinue(1)}>
                      <Icon path={icons.chat} size={32} />
                    </button>
                    <span className="vp-way-label">WhatsApp</span>
                  </div>
                  <div className="vp-way">
                    <button type="button" className="vp-way-button is-mail" aria-label="Email, write to Delta Parts" onClick={() => onContinue(1)}>
                      <Icon path={icons.mail} size={32} />
                    </button>
                    <span className="vp-way-label">Email</span>
                  </div>
                </div>
              </div>
            ) : onChat ? (
              <div className="vp-chat" inert={onOwnerPhone}>
                <header className="vp-chat-head">
                  <span className="vp-chat-avatar">DP</span>
                  <span className="vp-chat-who">
                    <span className="vp-chat-name">
                      Delta Parts <span className="vp-verified" aria-label="Verified business" role="img">✓</span>
                    </span>
                    <span className="vp-chat-sub">
                      {typing ? <span className="vp-typing-word">typing…</span> : 'AI ordering agent, business account'}
                    </span>
                  </span>
                </header>
                <div className="vp-chat-thread">
                  <span className="vp-chat-note">Call ended. The order goes on here.</span>
                  <div className="vp-bubble">
                    <p>Everything fits and is in stock for the Golf in bay 2. The original water pump is out until tomorrow at 09:30, so I picked Hollen HP-2241. It fits this VIN and arrives at 10:45.</p>
                    <ReceiptLines />
                    <div className="vp-total">
                      <span>Total</span>
                      <strong>€325.50</strong>
                    </div>
                    <span className="vp-bubble-time">07:43</span>
                  </div>
                  <div className="vp-bubble">
                    <span className="vp-who is-agent">Buyer’s AI agent</span>
                    <p>That’s €325.50, over your €300 limit. I’m asking the workshop owner and will tell you the moment they answer.</p>
                    <span className="vp-bubble-time">07:43</span>
                  </div>
                  {approving || ordered ? <span className="vp-chat-note">Sent to the workshop owner for approval, €325.50</span> : null}
                  {ordered ? (
                    <>
                      <div className="vp-bubble is-short">
                        <span className="vp-who is-agent">Buyer’s AI agent</span>
                        <p>The workshop owner approved €325.50.</p>
                        <span className="vp-bubble-time">07:44</span>
                      </div>
                      <div className="vp-bubble">
                        <span className="vp-who is-agent">AI fulfilment agent</span>
                        <p>Ordered. Stock stays held at the Utrecht branch, and the van reaches the workshop by 10:45.</p>
                        <span className="vp-bubble-time">07:44</span>
                      </div>
                      {delivering ? (
                        <div className="vp-bubble is-typing" aria-label="Typing" role="img">
                          <span />
                          <span />
                          <span />
                        </div>
                      ) : null}
                      {receipted ? (
                        <>
                          <div className="vp-bubble">
                            <span className="vp-who is-agent">AI ordering agent</span>
                            <div className="vp-voice-note">
                              <span className="vp-note-play" aria-hidden="true">
                                <Icon path={icons.play} size={12} />
                              </span>
                              <span className="vp-note-wave" aria-hidden="true">
                                {noteBars.map((height, i) => (
                                  <span key={i} style={{ height }} />
                                ))}
                              </span>
                              <span className="vp-note-time">0:17</span>
                            </div>
                            <p className="vp-transcript">That’s 1 water pump, metal impeller, Hollen, and 1 timing belt kit, the original part. €325.50 at your contract price, checked with the ERP 2 minutes ago. At the workshop by 10:45. You can undo for 10 minutes.</p>
                            <span className="vp-bubble-time">07:44</span>
                          </div>
                          <div className="vp-bubble">
                            <p>Your receipt.</p>
                            <ReceiptLines />
                            <div className="vp-total">
                              <span>Total</span>
                              <strong>€325.50</strong>
                            </div>
                            {recording ? (
                              <p className="vp-closed">Undo has closed. Delivered.</p>
                            ) : (
                              <div className="vp-undo">
                                <span className="vp-undo-ring" aria-hidden="true" />
                                <span className="vp-undo-text">
                                  <span className="vp-undo-left">{`Undo, ${String(Math.floor(undoLeft / 60)).padStart(2, '0')}:${String(undoLeft % 60).padStart(2, '0')} left`}</span>
                                  <span className="vp-undo-when">Closes at 07:54, or when the van leaves</span>
                                </span>
                              </div>
                            )}
                            <span className="vp-bubble-time">07:44</span>
                          </div>
                          {recording ? (
                            <>
                              <div className="vp-bubble">
                                <p>10 minutes are up, so undo has closed. Your order stands, and a change is now a return, in one message.</p>
                                <span className="vp-bubble-time">07:54</span>
                              </div>
                              <div className="vp-bubble is-short">
                                <span className="vp-who is-agent">AI fulfilment agent</span>
                                <p>Delivered to the workshop. Does it fit?</p>
                                <span className="vp-bubble-time">10:45</span>
                              </div>
                            </>
                          ) : null}
                          {fit ? (
                            <>
                              <div className="vp-bubble is-out">
                                <p>Part fits</p>
                                <span className="vp-bubble-time">10:45 ✓✓</span>
                              </div>
                              <div className="vp-bubble">
                                <span className="vp-who is-agent">AI ordering agent</span>
                                <p>Good. The full log is in your webshop account, and the invoice comes by email.</p>
                                <span className="vp-bubble-time">10:45</span>
                                {fit === 2 ? (
                                  <div className="vp-bubble-links">
                                    <button type="button" className="vp-bubble-link" onClick={() => onContinue(8)}>
                                      Open in the webshop
                                      <Icon path={icons.chevron} size={10} />
                                    </button>
                                    <button type="button" className="vp-bubble-link" onClick={() => setStage('lock')}>Play again</button>
                                  </div>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                          {typing ? (
                            <div className="vp-bubble is-typing" aria-label="Typing" role="img">
                              <span />
                              <span />
                              <span />
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  ) : null}
                </div>
                {confirming && moment >= 2 ? (
                  <>
                    <button type="button" className="vp-jump" onClick={moveToRecord}>
                      <span className="vp-jump-fill" aria-hidden="true" />
                      <span className="vp-jump-label">
                        <Icon path={icons.calendar} size={12} />
                        10:45, the van arrives
                      </span>
                    </button>
                    <div className="vp-replies">
                      <button type="button" className="vp-reply" onClick={() => onContinue(7)}>Undo order</button>
                      <button type="button" className="vp-reply" onClick={() => onContinue(7)}>Track the van</button>
                    </div>
                  </>
                ) : null}
                {recording && moment >= 3 && !fit ? (
                  <div className="vp-replies">
                    <button type="button" className="vp-reply" onClick={confirmFit}>Part fits</button>
                    <button type="button" className="vp-reply" onClick={() => onContinue(8)}>It does not fit</button>
                  </div>
                ) : null}
                <button type="button" className={fit === 2 ? 'vp-chat-rep is-cue' : 'vp-chat-rep'} onClick={() => onContinue(4)}>
                  <Icon path={icons.phone} size={14} />
                  Talk to a sales rep
                </button>
                <div className="vp-chat-input">
                  <span className="vp-chat-field">Type a message</span>
                  <span className="vp-chat-mic" aria-hidden="true">
                    <Icon path={icons.mic} size={18} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="vp-voice" data-state={voiceState}>
                <header className="vp-head">
                  <span className="vp-name">Delta Parts</span>
                  <span className="vp-sub">Ordering agent, on the merchant’s number</span>
                  <span className="vp-timer">
                    <span className="vp-live" />
                    {`0:${String(clock).padStart(2, '0')}`}
                  </span>
                </header>
                <div ref={captionsRef} className="vp-captions">
                  <div className={`vp-line is-buyer ${searching ? 'is-past' : 'is-recent'}`}>
                    <span className="vp-who">Buyer</span>
                    <span className="vp-text is-said">The water pump on the Golf in bay 2 has gone. I need one today, plus the timing belt kit while it’s open.</span>
                  </div>
                  <div className={`vp-line ${searching ? 'is-past' : asking ? 'is-recent' : 'is-now'}`}>
                    <span className="vp-who is-agent">Ordering agent</span>
                    <span className="vp-text">Hello, this is the Delta Parts AI ordering agent. This call is recorded for your order and to improve the service. I have the Golf 1.6 TDI, plate K-482-GH, from your March order. I’ll find the parts.</span>
                  </div>
                  {asking ? (
                    <div className={`vp-line ${searching ? 'is-past' : 'is-now'}`}>
                      <span className="vp-who is-agent">Ordering agent</span>
                      <span className="vp-text">Two water pumps fit this engine. Is the impeller metal or plastic?</span>
                    </div>
                  ) : null}
                  {searching ? (
                    <>
                      <div className="vp-line is-buyer is-recent">
                        <span className="vp-who">Buyer</span>
                        <span className="vp-text is-said">{answer}</span>
                      </div>
                      <div className="vp-line is-recent">
                        <span className="vp-who is-agent">Ordering agent</span>
                        <span className="vp-text">Checking the main warehouse, the nearest branch and equivalent parts.</span>
                      </div>
                      <div className="vp-line is-recent">
                        <div className="vp-card">
                          <ul className="vp-sources">
                            {sources.map((source, i) => {
                              const done = moment >= i * 2 + 1
                              return (
                                <li key={source.name} className="vp-source">
                                  <span className={done ? 'vp-source-icon is-done' : 'vp-source-icon is-busy'}>{done ? '✓' : null}</span>
                                  <span>
                                    <span className="vp-source-name">{source.name}</span>
                                    <span className="vp-source-detail">{source.detail}</span>
                                  </span>
                                  {done ? (
                                    <span className="vp-stamp">
                                      <span className="vp-stamp-dot" />
                                      {source.stamp}
                                    </span>
                                  ) : null}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : null}
                  {deciding ? (
                    <div className="vp-line is-now">
                      <span className="vp-who is-agent">Ordering agent</span>
                      <span className="vp-text">The original pump is out until tomorrow at 09:30, so I picked Hollen HP-2241. It fits this VIN and arrives at 10:45. It’s over your limit, so your agent is asking the workshop owner. I’ll send the order to your WhatsApp now, so you can keep working.</span>
                    </div>
                  ) : null}
                </div>
                <div className="vp-foot">
                  <div className="vp-glow" aria-hidden="true">
                    <span className="vp-blob is-blue" />
                    <span className="vp-blob is-orange" />
                    <span className="vp-blob is-soft" />
                  </div>
                  {!searching && moment >= 4 ? (
                    <div className="vp-say">
                      <button type="button" className="vp-chip" onClick={() => giveAnswer('Metal')}>
                        <span className="vp-chip-label">Say</span> Metal
                      </button>
                      <button type="button" className="vp-chip" onClick={() => giveAnswer('Plastic')}>
                        <span className="vp-chip-label">Say</span> Plastic
                      </button>
                    </div>
                  ) : null}
                  <div className="vp-level">
                    <div className="vp-meter" aria-hidden="true">
                      {bars.map((height, i) => (
                        <span key={i} className="vp-bar" style={{ '--h': height, '--time': `${barTimes[i]}ms`, '--delay': `${-173 * i}ms`, '--index': i } as CSSProperties} />
                      ))}
                    </div>
                    <span className="vp-state">{voiceState === 'ended' ? 'Call ended' : voiceState === 'muted' ? 'Muted' : searching ? 'Thinking' : listening ? 'Listening' : 'Agent'}</span>
                  </div>
                  <div className="vp-controls">
                    <button type="button" className="vp-round is-mute" aria-label="Mute" aria-pressed={muted} onClick={() => setMuted((value) => !value)}>
                      <Icon path={icons.mic} size={20} />
                    </button>
                    <span className="vp-ask-slot">
                      {deciding ? null : (
                        <button type="button" className={searching || moment >= 4 ? 'vp-ask is-cue' : 'vp-ask'} onClick={() => onContinue(3)}>
                          <Icon path={icons.phone} size={14} />
                          Say sales rep
                        </button>
                      )}
                    </span>
                    <button type="button" className="vp-round is-end" aria-label="Hang up and start again" onClick={() => setStage('lock')}>
                      <Icon path={icons.hangup} size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {approving && onOwnerPhone ? (
              <div className="vp-chat is-owner">
                <header className="vp-chat-head">
                  <span className="vp-chat-avatar">GN</span>
                  <span className="vp-chat-who">
                    <span className="vp-chat-name">
                      Garage Noord <span className="vp-verified" aria-label="Verified business" role="img">✓</span>
                    </span>
                    <span className="vp-chat-sub">Buyer’s AI agent, your company’s account</span>
                  </span>
                </header>
                <div className="vp-chat-thread is-top">
                  <span className="vp-chat-note">Today</span>
                  <div className="vp-bubble">
                    <span className="vp-who is-agent">Buyer’s AI agent</span>
                    <p>The workshop lead needs 2 parts for the Golf in bay 2. €325.50, over the €300 limit.</p>
                    <span className="vp-approval">€325.50</span>
                    <span className="vp-approval-note">Over the €300 limit your company set</span>
                    <ReceiptLines />
                    <span className="vp-approval-note">On account, paid on your normal 30-day terms.</span>
                    <span className="vp-approval-note">Approval is for this amount. If the price moves, I’ll ask again. Stock is held until 09:43.</span>
                    <span className="vp-bubble-time">07:43</span>
                  </div>
                  {approved ? (
                    <div className="vp-bubble is-out">
                      <p>Approve €325.50</p>
                      <span className="vp-bubble-time">07:44 ✓✓</span>
                    </div>
                  ) : null}
                </div>
                {approved ? null : (
                  <div className="vp-replies">
                    <button type="button" className="vp-reply" onClick={approve}>Approve €325.50</button>
                    <button type="button" className="vp-reply" onClick={() => onContinue(5)}>Decline</button>
                    <button type="button" className="vp-reply" onClick={() => onContinue(5)}>
                      <Icon path={icons.phone} size={14} />
                      Call the workshop lead
                    </button>
                  </div>
                )}
                <div className="vp-chat-input">
                  <span className="vp-chat-field">Type a message</span>
                  <span className="vp-chat-mic" aria-hidden="true">
                    <Icon path={icons.mic} size={18} />
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="vp-panel">
        <div className="vp-beat" key={stage === 'lock' ? 'lock' : fit ? 'b8-done' : recording ? 'b8' : confirming ? 'b7' : delivering ? 'b6' : approved ? 'b5-done' : approving ? 'b5' : deciding ? 'b4' : searching ? 'b3' : asking ? 'b2' : 'b1'} role="status">
          <div className="vp-meta">
            <span className={recording || delivering ? 'vp-agent-icon is-forest' : confirming ? 'vp-agent-icon' : approving ? 'vp-agent-icon is-buyer' : 'vp-agent-icon'}>
              <Icon path={recording ? icons.record : confirming ? icons.speaker : delivering ? icons.swap : approving ? icons.approve : deciding ? icons.split : searching ? icons.network : asking ? icons.search : icons.phone} size={20} />
              {(stage === 'call' && !asking && moment >= 2) || (stage === 'search' && moment >= 6) || (fit ? fit === 2 : recording ? moment >= 3 : confirming ? moment >= 2 : delivering ? moment >= 3 : approved === 2) ? (
                <span className="vp-tick">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 12.5 10.5 17 18 8" />
                  </svg>
                </span>
              ) : null}
            </span>
            <span className="vp-agent-text">
              <span className={recording || delivering ? 'vp-agent-name is-forest' : confirming ? 'vp-agent-name' : approving ? 'vp-agent-name is-buyer' : 'vp-agent-name'}>{fit ? 'Ordering agent' : recording ? 'Fulfilment agent' : confirming ? 'Ordering agent' : delivering ? 'Fulfilment agent' : approving ? 'Buyer’s agent' : 'Ordering agent'}</span>
              <span className="vp-step">{recording ? 'B8  Record and return' : confirming ? 'B7  Confirm' : delivering ? 'B6  Delivery' : approving ? 'B5  Approve' : deciding ? 'B4  Decide' : searching ? 'B3  Search network' : asking ? 'B2  Identify part' : 'B1  Trigger'}</span>
            </span>
            {stage !== 'lock' && working ? (
              <span className="vp-working">
                <span className="vp-working-dot" />
                Working
              </span>
            ) : null}
          </div>
          <h3 className="vp-title">
            {stage === 'lock'
              ? 'The buyer calls or writes, with busy hands'
              : fit
                ? 'Done, and every decision is in the webshop log'
                : recording
                ? 'Delivered, and every decision is in the log'
                : confirming
                ? 'The agent reads it back, then sends a receipt with undo'
                : delivering
                ? 'The stock is held and the van is booked'
                : approved
                ? 'Approved, for the exact amount'
                : approving
                ? 'It’s over the limit, so the buyer’s agent asks the workshop owner'
                : deciding
                ? 'It fits, but it’s over the limit, so the workshop owner decides'
                : searching
                ? 'The agent checks live stock across the network'
                : asking
                ? 'Two versions of the pump fit, so the agent asks one question'
                : 'The number is known, so the agent finds the car'}
          </h3>
          <p className="vp-copy">
            {fit
              ? 'The full log is in the webshop: who decided, which score, which rule, which source. Open it, or play again with a different setting.'
              : recording
              ? 'Every decision lands in the webshop log. If the part does not fit, the return is one message. Returns teach preference, never the fit rules.'
              : confirming
              ? 'The buyer has gloves on, so the agent reads the order back: part, price and arrival time. Then comes a receipt with undo, open for 10 minutes or until the van leaves.'
              : delivering
              ? 'Stock has been held since the quote. The order is written to the ERP with no rekeying. In the pilot, a sales rep books the van, and the agent reads the van times.'
              : approving
              ? 'Over the company’s limit, the buyer’s agent sends the exact amount to the approver’s own phone. One tap approves or declines it. The fulfilment agent holds the part meanwhile, and no agent ever approves.'
              : deciding
              ? 'Each line is scored on its own: hard rules first, then the fit score out of 100 against the category’s threshold, then preference picks the best part that fits.'
              : searching
              ? 'The main warehouse, the nearest branch, then equivalent parts. Everything is live from the merchant’s ERP, with the source and age shown on every number.'
              : asking
              ? 'Two versions of a part fit this engine. A wrong part is the costliest mistake, so the agent asks one short question before it searches, and never sends a form.'
              : 'The buyer calls, sends a WhatsApp voice note or emails the merchant’s order line, hands busy. The buyer’s agent checks the caller against their company’s list, and the ordering agent finds the car from the plate and past orders.'}
          </p>
          {stage !== 'lock' ? (
            <div className="vp-checks">
              <p className="vp-checks-label">{recording ? 'On delivery' : confirming ? 'Before the receipt' : delivering ? 'Once the order is placed' : approving ? 'The approval' : deciding ? 'How it decided' : searching ? 'Checked with the ERP' : asking ? 'Before it searches' : 'Checked on the call'}</p>
              <ul className="vp-check-list">
                {recording ? (
                  <>
                    {records.map(({ label, note }, i) => {
                      const done = moment > i
                      return (
                        <li key={label} className={done ? 'is-ok' : moment === i ? 'is-running' : 'is-queued'}>
                          <span className="vp-mark">{done ? '✓' : null}</span>
                          <span className="vp-check-text">
                            <span className={moment === i ? 'vp-sweep' : undefined}>{label}</span>
                            {done && note ? <span className="vp-note">{note}</span> : null}
                          </span>
                        </li>
                      )
                    })}
                    {fit ? (
                      <li className={fit === 2 ? 'is-ok' : 'is-running'}>
                        <span className="vp-mark">{fit === 2 ? '✓' : null}</span>
                        <span className="vp-check-text">
                          <span className={fit === 2 ? undefined : 'vp-sweep'}>The buyer confirmed it fits</span>
                        </span>
                      </li>
                    ) : null}
                  </>
                ) : ordered ? (
                  (confirming ? readBacks : deliveries).map((label, i) => {
                    const done = moment > i
                    return (
                      <li key={label} className={done ? 'is-ok' : moment === i ? 'is-running' : 'is-queued'}>
                        <span className="vp-mark">{done ? '✓' : null}</span>
                        <span className="vp-check-text">
                          <span className={moment === i ? 'vp-sweep' : undefined}>{label}</span>
                        </span>
                      </li>
                    )
                  })
                ) : approved ? (
                  <>
                    <li className="is-ok">
                      <span className="vp-mark">✓</span>
                      <span className="vp-check-text">
                        <span>The buyer’s agent sent the approval card to the workshop owner</span>
                      </span>
                    </li>
                    <li className={approved === 2 ? 'is-ok' : 'is-running'}>
                      <span className="vp-mark">{approved === 2 ? '✓' : null}</span>
                      <span className="vp-check-text">
                        <span className={approved === 2 ? undefined : 'vp-sweep'}>Approved by the workshop owner</span>
                      </span>
                    </li>
                  </>
                ) : approving ? (
                  <li className="is-wait">
                    <span className="vp-mark">?</span>
                    <span className="vp-check-text">
                      <span>The buyer’s agent sent the approval card to the workshop owner</span>
                      <span className="vp-note">€325.50, the exact amount. The fulfilment agent holds the stock until 09:43.</span>
                    </span>
                  </li>
                ) : deciding ? (
                  decisions.map((decision, i) => {
                    const done = moment > i
                    const status = done ? `is-${decision.kind}` : moment === i ? 'is-running' : 'is-queued'
                    return (
                      <li key={decision.label} className={status}>
                        <span className="vp-mark">{done ? (decision.kind === 'ok' ? '✓' : decision.kind === 'person' ? <Icon path={icons.person} size={12} /> : '?') : null}</span>
                        <span className="vp-check-text">
                          <span className={moment === i ? 'vp-sweep' : undefined}>{decision.label}</span>
                          {done && decision.note ? <span className="vp-note">{decision.note}</span> : null}
                        </span>
                      </li>
                    )
                  })
                ) : searching ? (
                  sources.map((source, i) => {
                    const done = moment >= i * 2 + 2
                    const running = i === 0 ? !done : moment >= i * 2 && !done
                    return (
                      <li key={source.name} className={done ? 'is-ok' : running ? 'is-running' : 'is-queued'}>
                        <span className="vp-mark">{done ? '✓' : null}</span>
                        <span className="vp-check-text">
                          <span className={running ? 'vp-sweep' : undefined}>{source.name}</span>
                        </span>
                      </li>
                    )
                  })
                ) : asking ? (
                  <li className="is-wait">
                    <span className="vp-mark">?</span>
                    <span className="vp-check-text">
                      <span>Two versions fit, so it asks one question</span>
                      <span className="vp-note">Two water pumps fit this engine. Is the impeller metal or plastic?</span>
                    </span>
                  </li>
                ) : (
                  <>
                    <li className={moment >= 1 ? 'is-ok' : 'is-running'}>
                      <span className="vp-mark">{moment >= 1 ? '✓' : null}</span>
                      <span className="vp-check-text">
                        <span className={moment >= 1 ? undefined : 'vp-sweep'}>The buyer’s agent checked the caller</span>
                      </span>
                    </li>
                    <li className={moment >= 2 ? 'is-ok' : moment >= 1 ? 'is-running' : 'is-queued'}>
                      <span className="vp-mark">{moment >= 2 ? '✓' : null}</span>
                      <span className="vp-check-text">
                        <span className={moment === 1 ? 'vp-sweep' : undefined}>Car found from the plate</span>
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          ) : null}
        </div>
        {stage === 'lock' || (!searching && moment >= 4) ? (
          <div className="vp-action">
            <p className="vp-turn">Your turn, as the buyer.</p>
          </div>
        ) : null}
        {recording && moment >= 3 && !fit ? (
          <div className="vp-action">
            <p className="vp-turn">Your turn, as the buyer.</p>
          </div>
        ) : null}
        {confirming && moment >= 2 ? (
          <div className="vp-action">
            <p className="vp-turn">The order moves on in a moment. Tap 10:45 to go now, or undo until then.</p>
          </div>
        ) : null}
        {approving ? (
          <div className="vp-action">
            {approved ? (
              <>
                <p className="vp-turn">Done on this phone. Follow the answer back to the buyer.</p>
                <button type="button" className="vp-follow is-back" onClick={backToBuyer}>
                  <Icon path={icons.back} size={14} />
                  Back to the buyer’s phone
                </button>
              </>
            ) : onOwnerPhone ? (
              <p className="vp-turn">Your turn, as the workshop owner.</p>
            ) : (
              <>
                <p className="vp-turn">The order has gone to the buyer’s workshop owner.</p>
                <button type="button" className="vp-follow" onClick={openOwnerPhone}>
                  Open the workshop owner’s phone
                  <Icon path={icons.chevron} size={14} />
                </button>
              </>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  )
}
