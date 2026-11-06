import { useEffect, useRef } from 'react'
import './quik-demo.css'

/**
 * The Quik workspace from Figma "Portfolio 2026" 303:381, 328:2, 328:124 and 328:290, played as a looping film:
 * chat alone, then the console, the agents and the review panel open in turn, then dark mode. Drawn at 1440 by 1024 and scaled to fit.
 */
const icon = (name: string) => `/case-study-5/${name}.svg`

const agents = [
  { icon: 'square-text', name: 'Cost Optimizer', text: 'Surface savings across your Quik resources' },
  { icon: 'lock', name: 'Security Auditor', text: 'Scan for public access and IAM risks' },
  { icon: 'search', name: 'Resource Explorer', text: 'Find and describe resources across regions' },
  { icon: 'repeat', name: 'Resource Migration', text: 'Move resources across regions accounts' },
]

function PanelHead({ title, trash }: { title: string; trash?: boolean }) {
  return (
    <div className="qd-head">
      <p>{title}</p>
      <span>
        {trash ? <img src={icon('trash')} alt="" /> : null}
        <img src={icon('x')} alt="" />
      </span>
    </div>
  )
}

export function QuikDemo() {
  const frameRef = useRef<HTMLDivElement>(null)

  // CSS can't divide one length by another, so the scale comes from the frame's width.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(([entry]) => {
      frame.style.setProperty('--qd-scale', String(entry.contentRect.width / 1440))
    })
    observer.observe(frame)
    const seen = new IntersectionObserver(([entry]) => frame.classList.toggle('is-visible', entry.isIntersecting))
    seen.observe(frame)
    return () => {
      observer.disconnect()
      seen.disconnect()
    }
  }, [])

  return (
    <div
      ref={frameRef}
      className="qd"
      role="img"
      aria-label="The Quik assistant opening its panels in turn: chat first, then the console, the agents and the review panel, then switching to dark mode."
    >
      <div className="qd-canvas" aria-hidden="true">
        <div className="qd-app">
          <nav className="qd-rail">
            <span className="qd-rail-icons">
              <span className="is-on">
                <img src={icon('message-square')} alt="" />
              </span>
              <span>
                <img src={icon('square-terminal')} alt="" />
              </span>
              <span>
                <img src={icon('bot')} alt="" />
              </span>
            </span>
            <span className="qd-rail-foot">
              <span className="qd-avatar">
                <img src="/case-study-1/avatar-abhishek.webp" alt="" />
              </span>
              <img className="qd-moon" src={icon('moon')} alt="" />
            </span>
          </nav>

          <section className="qd-left">
            <div className="qd-console">
              <PanelHead title=">_ QUIK-CONSOLE - ZSH" trash />
              <div className="qd-body">
                <p className="qd-prompt">quik-console - %</p>
              </div>
            </div>
            <div className="qd-agents">
              <PanelHead title="AGENTS" />
              <div className="qd-body">
                {agents.map((agent) => (
                  <div className="qd-agent" key={agent.name}>
                    <span className="qd-tile">
                      <img src={icon(agent.icon)} alt="" />
                    </span>
                    <span className="qd-agent-text">
                      <b>{agent.name}</b>
                      <small>{agent.text}</small>
                    </span>
                    <img src={icon('chevron-right')} alt="" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="qd-chat">
            <div className="qd-tabs">
              <span className="qd-tab">New Chat</span>
              <img src={icon('plus')} alt="" />
            </div>
            <div className="qd-title-bar">Quik Assistant</div>
            <div className="qd-stage">
              <h3>
                Hi, I am your
                <br />
                Quik Assistant
              </h3>
              <div className="qd-input">
                <p>
                  <img src={icon('sparkles')} alt="" />
                  Ask AI a question or make a request...
                </p>
                <div className="qd-input-foot">
                  <span className="qd-chips">
                    <span>
                      <img src={icon('send')} alt="" />
                      Attach Files
                    </span>
                    <span>
                      Writing Styles
                      <img src={icon('chevron-down')} alt="" />
                    </span>
                  </span>
                  <img src={icon('arrow')} alt="" />
                </div>
              </div>
              <div className="qd-cards">
                {[0, 1, 2].map((card) => (
                  <div className={card === 0 ? 'qd-card is-picked' : 'qd-card'} key={card}>
                    <p>List my lambda functions in us-west-2</p>
                    <img src={icon('send')} alt="" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="qd-review">
            <PanelHead title="REVIEW" />
            <div className="qd-body qd-review-body">
              <span className="qd-tile">
                <img src={icon('square-text')} alt="" />
              </span>
              <b>Your Action results will appear here</b>
              <small>
                Complete an action like exporting a table
                <br />
                to S3 and this panel shows a summary of what
                <br />
                happened and the details of what was created.
              </small>
            </div>
          </section>
        </div>

        <span className="qd-cursor">
          <span className="qd-ring" />
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M5 3l14 8-6.5 1.5L9.5 19 5 3z" fill="#151617" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  )
}
