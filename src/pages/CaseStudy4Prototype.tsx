import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { useEffect, useRef, useState } from 'react'
import { VoicePath } from './VoicePath.tsx'

type Viewer = 'Buyer' | 'Sales rep' | 'Approver'

type Step = {
  code: string
  viewer: Viewer
  agent: string
  title: string
  text: string
  message: string
  /** What the person says or taps to move on. */
  action: string
}

const steps: Step[] = [
  {
    code: 'B1', viewer: 'Buyer', agent: 'Ordering agent', title: 'The buyer calls with busy hands',
    text: 'A call, a WhatsApp voice note or an email all start the order. The buyer’s agent checks the caller is on the company’s list, and the ordering agent finds the car.',
    message: 'This is Delta Parts’ AI ordering agent. I’ve found your Golf from the plate. What do you need?',
    action: 'A water pump and a belt kit',
  },
  {
    code: 'B2', viewer: 'Buyer', agent: 'Ordering agent', title: 'One question, never a form',
    text: 'Two versions fit this engine, so the agent asks the one question that separates them.',
    message: 'Two water pumps fit this engine. Is the one on the car metal or plastic?',
    action: 'Metal',
  },
  {
    code: 'B3', viewer: 'Buyer', agent: 'Ordering agent', title: 'Live stock, with its source',
    text: 'Stock and contract price come live from the merchant’s ERP, and every number shows where it came from.',
    message: 'The original is out until tomorrow. Hollen is in stock and can arrive at 10:45. Source: Delta Parts’ ERP, just now.',
    action: 'Go ahead',
  },
  {
    code: 'B4', viewer: 'Buyer', agent: 'Ordering agent', title: 'The order splits in two',
    text: 'Each line gets its own decision. The pump clears the threshold, with Hollen scoring 90 against 85. The belt kit has no fit data, so the agent stops rather than guesses.',
    message: 'I can order the Hollen pump. I have no fit data for the belt kit, so a sales rep is picking that now.',
    action: 'OK, thanks',
  },
  {
    code: 'M5', viewer: 'Sales rep', agent: 'Case card', title: 'A sales rep takes the stop',
    text: 'The rep gets one case card with the car, the part and why the agent stopped, and has a 5-minute answer target. The answer goes back to the buyer’s thread.',
    message: 'Golf in bay 2: timing belt kit. Stopped because there is no fit data. 5-minute target.',
    action: 'Pick the belt kit',
  },
  {
    code: 'B5', viewer: 'Approver', agent: 'Buyer’s agent', title: 'Over the limit, a person decides',
    text: '€325.50 is over the workshop’s €300 limit. The buyer’s agent sends the exact amount to the approver’s own phone, and the parts stay held meanwhile.',
    message: 'Water pump and belt kit for the Golf in bay 2: €325.50, over your €300 limit. The parts are held.',
    action: 'Approve',
  },
  {
    code: 'B6', viewer: 'Buyer', agent: 'Fulfilment agent', title: 'Held, booked and written',
    text: 'Stock has been held since the quote. The van gets booked and the order goes into the ERP with no retyping. During the pilot, a sales rep books the van.',
    message: 'Approved. The van is booked and arrives at 10:45.',
    action: 'Great',
  },
  {
    code: 'B7', viewer: 'Buyer', agent: 'Ordering agent', title: 'Read back, with undo',
    text: 'The agent reads back the part, price and arrival. Undo stays open for 10 minutes, or until the van leaves.',
    message: 'Hollen water pump and belt kit, €325.50, arriving 10:45. You can undo for 10 minutes, or until the van leaves.',
    action: 'Keep the order',
  },
  {
    code: 'B8', viewer: 'Buyer', agent: 'Webshop log', title: 'Every decision is on record',
    text: 'Each decision lands in the webshop log with its rule, score and source, whichever channel the order started in.',
    message: 'Your order and receipt are in your webshop account. A return takes one message.',
    action: 'Replay the order',
  },
]

export function CaseStudy4Prototype({ id }: { id: string }) {
  const [index, setIndex] = useState(0)
  // The rebuilt voice path covers B1 and B2; later steps still use the scripted walkthrough.
  const [onVoicePath, setOnVoicePath] = useState(true)
  const threadRef = useRef<HTMLOListElement>(null)
  const step = steps[index]
  const last = index === steps.length - 1
  // Each phone shows only its own side of the conversation so far.
  const thread = steps.slice(0, index + 1).filter((item) => item.viewer === step.viewer)

  useEffect(() => {
    const list = threadRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [index])

  return (
    <div id={id} className="cs-chapter">
      <section className="cs-block" aria-labelledby={`${id}-title`}>
        <div className="cs-block-head">
          <span className="cs-chapter-label"><ShippedBadge>06 Prototype</ShippedBadge></span>
          <h2 id={`${id}-title`} className="cs-h1">
            Play one urgent order.
          </h2>
          <p className="cs-b1 cs-block-summary">
            Step through the order as the buyer, the sales rep and the approver. This is a scripted
            walkthrough on mock data, with no live agent behind it.
          </p>
        </div>
        {onVoicePath ? (
          <VoicePath
            onContinue={(next) => {
              setIndex(next)
              setOnVoicePath(false)
            }}
          />
        ) : (
          <>
        <div className="cs-proto">
          <div className="cs-proto-phone">
            <p className="cs-proto-viewer">
              <span className="cs-status-dot" aria-hidden="true" />
              {step.viewer}’s phone
            </p>
            <ol
              ref={threadRef}
              className="cs-proto-thread"
              tabIndex={0}
              aria-label={`${step.viewer}’s conversation`}
            >
              {thread.map((item) => (
                <li key={item.code} className="cs-proto-pair">
                  <p className="cs-proto-bubble">{item.message}</p>
                  {item !== step ? <p className="cs-proto-bubble is-person">{item.action}</p> : null}
                </li>
              ))}
            </ol>
            <div className="cs-proto-actions">
              <button
                type="button"
                className="cs-proto-next"
                onClick={() => {
                  if (last) setOnVoicePath(true)
                  setIndex(last ? 0 : index + 1)
                }}
              >
                {step.action}
              </button>
              <button
                type="button"
                className="cs-show-all"
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
              >
                Back
              </button>
            </div>
          </div>
          <div className="cs-proto-story" role="status">
            <p className="cs-agent-label">
              {step.agent}, {step.code}
            </p>
            <h3 className="cs-h2">{step.title}</h3>
            <p className="cs-b1">{step.text}</p>
          </div>
        </div>
        <ol className="cs-proto-steps" aria-label="Steps">
          {steps.map((item, position) => (
            <li
              key={item.code}
              className={position === index ? 'is-now' : position < index ? 'is-done' : undefined}
              aria-current={position === index ? 'step' : undefined}
            >
              {item.code}
            </li>
          ))}
        </ol>
          </>
        )}
      </section>
    </div>
  )
}
