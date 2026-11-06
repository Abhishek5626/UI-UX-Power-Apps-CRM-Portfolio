import { useRef, useState, type MouseEvent } from 'react'
import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { CaseStudy4Journeys } from './CaseStudy4Journeys.tsx'
import { CaseStudy4Proposal } from './CaseStudy4Proposal.tsx'
import { CaseStudy4Prototype } from './CaseStudy4Prototype.tsx'
import { CaseStudy4Research } from './CaseStudy4Research.tsx'
import { CaseStudy4System } from './CaseStudy4System.tsx'
import { CaseStudy4Trust } from './CaseStudy4Trust.tsx'
import { CaseStudy4Vision } from './CaseStudy4Vision.tsx'
import { Beats, useReveal } from './caseStudyMotion.tsx'
import { DecisionNote } from './caseStudyParts.tsx'
import './case-study-system.css'
import './case-study-type.css'

/** The page's opening content; nothing else needs to change to replace it. */
const intro = {
  status: 'Case study in progress',
  title: 'Agentic AI for B2B ordering',
  summary:
    'A business case exploring AI agents for urgent B2B ordering. Buyers and merchants each get agents that work across WhatsApp, email and phone, within their own company’s rules.',
  metaTitle: 'Example case: AI agents for B2B ordering',
  metaDetail: 'Business case for Saga Commerce',
  mediaLabel: 'Placeholder: add a hero image or video',
}

const northStar = {
  label: 'North star',
  statement: 'Faster urgent orders, with no rise in wrong parts.',
  lead: 'Agents move quickly, and always stay inside the rules of both merchant and buyer.',
  facts: [
    {
      title: 'Business value',
      text: 'Urgent orders stop waiting on a sales rep, which gives reps their time back.',
    },
    {
      title: 'Trust',
      text: 'Each side’s rules hold on every single order.',
    },
    {
      title: 'Measured by',
      text: 'Time to order, with wrong-part returns staying within 1 percentage point of a sales rep’s.',
    },
  ],
}

const testCase = {
  title: 'The test case',
  summary:
    'The case follows an auto parts wholesaler on Saga and the independent garages it supplies. Urgency, exact vehicle fit and safety-critical parts make it a demanding test for agents.',
  sides: [
    {
      tone: 'a',
      title: 'Workshop side: buys from the merchant',
      roles: [
        {
          label: 'Buyer',
          title: 'Lead at an independent garage',
          points: [
            'Needs parts fast while a car waits on the lift',
            'Often has busy hands and no screen nearby',
          ],
        },
        {
          label: 'Approver',
          title: 'Garage owner',
          points: [
            'Approves orders above a limit the workshop sets, such as €300',
            'Is often away from the workshop',
          ],
        },
      ],
    },
    {
      tone: 'b',
      title: 'Merchant side: Saga’s customer',
      roles: [
        {
          label: 'Merchant admin',
          title: 'Runs the wholesaler’s Saga setup',
          points: [
            'Sets the fit score, out of 100, an agent needs to order alone',
            'Is the only role who can change the merchant’s rules',
          ],
        },
        {
          label: 'Sales rep',
          title: 'Inside sales at the merchant',
          points: [
            'Handles safety parts and matches scoring under 70',
            'Receives every handover with full context',
          ],
        },
      ],
    },
  ],
  assumption:
    'These four roles are assumptions, as no formal interviews have happened yet. Workshop visits will test the buyer and approver, and merchant interviews the other two.',
  decisionLabel: 'Why I decided this',
  decisions: [
    'Urgency, exact fit and safety rules make auto parts a hard test. What works here should suit calmer trades.',
    'The pilot stays with one auto parts merchant. A second trade follows only if it passes, though the prototype also shows a food wholesaler on the same design.',
    'Rules, agents and design stay the same for every merchant. Only trade data changes, such as car fit for parts or shelf life for food.',
    'So the case starts from an auto parts wholesaler.',
  ],
}

const urgentOrder = {
  title: 'One urgent order',
  summary:
    'A Golf in bay 2 needs a new water pump today, and the car is stuck on the lift. A timing belt kit goes in as well while the engine is open. This one order runs through the whole case and the prototype.',
  sides: [
    {
      title: 'The urgent order today',
      summary:
        'I expect most urgent orders to arrive by phone or WhatsApp rather than the webshop. Workshop visits and a 2-week call count will test that.',
      tone: 'before',
      timing: 'About an hour',
      timingDetail:
        'First call to order placed, and most of it is waiting. To be timed on 30 to 50 of the pilot merchant’s phone orders before day 1.',
      steps: [
        {
          title: 'Call',
          text: 'With greasy hands and no part number, the buyer rings the merchant. If nobody answers, I expect them to try the next wholesaler, which the workshop visits will test.',
        },
        {
          title: 'Read out',
          text: 'A sales rep reads out candidate part numbers until one matches.',
        },
        {
          title: 'Check by hand',
          text: 'The rep checks stock, branches and equivalents in the ERP while the buyer waits.',
        },
        {
          title: 'Quote by email',
          text: 'The price goes by email, so the order never passes through the webshop.',
        },
        {
          title: 'Wait for sign off',
          text: 'The approver is elsewhere. Meanwhile the car stays on the lift and the bay earns nothing.',
        },
      ],
    },
    {
      title: 'With the agents',
      summary: 'The same order takes minutes, not an hour.',
      tone: 'after',
      timing: 'Minutes',
      timingDetail:
        'First message to order placed. To pass, the median must be 5 minutes or less on orders needing no approval, so agents are judged on what they control. Orders waiting on an approver are timed separately, wait included.',
      steps: [
        {
          title: 'Speak, type or send a photo',
          text: 'The buyer can call, send a WhatsApp voice note or a photo of the plate, or write an email. The merchant’s agent replies straight away and identifies the car. Bays are loud, so calls get tested in a real workshop, with voice notes as the backup.',
        },
        {
          title: 'Clarity first',
          text: 'When two versions of a part fit, or a detail is missing, the agent asks one short question rather than sending a form.',
        },
        {
          title: 'Live from the ERP',
          text: 'Stock and contract price come live from the ERP, along with the van time. Every number shows its source and age. One order record keeps the webshop, WhatsApp and email in step.',
        },
        {
          title: 'Act, ask or hand over',
          text: 'The agent scores each part’s fit out of 100. At or above the merchant’s threshold, 85 to start, it orders. From 70 up to the threshold, it asks the buyer to confirm. Below 70, a sales rep decides. Safety parts always go to a person.',
        },
        {
          title: 'People keep control',
          text: 'Above the workshop’s limit, the buyer’s agent sends the exact amount to the approver, who approves or declines with one tap on their phone. The part is held meanwhile. Undo lasts 10 minutes, or until the van leaves, whichever comes first.',
        },
      ],
    },
  ],
}

function RouteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M1.5 5.5 11 1 6.5 10.5 5.5 6.5 1.5 5.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Chapters without a built section are plain text until they get one. */
const chapters = [
  { name: 'Situation', detail: 'Where B2B buying stands', id: 'cs-situation' },
  { name: 'Research', detail: 'What I know, what to test', id: 'cs-research' },
  { name: 'Proposal', detail: 'One agent for the buyer, 4 for the merchant', id: 'cs-proposal' },
  { name: 'Trust', detail: 'When an agent can act on its own', id: 'cs-trust' },
  { name: 'Journeys', detail: 'The buyer’s side and the merchant’s side', id: 'cs-journeys' },
  { name: 'Prototype', detail: 'One urgent order, step by step', id: 'cs-prototype' },
  { name: 'System', detail: 'The design system foundation', id: 'cs-design-system' },
  { name: 'Vision', detail: 'Vision, team and impact', id: 'cs-vision' },
]

export function CaseStudy4() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState('cs-research')
  useReveal(rootRef, activeId)
  const nextChapter = chapters[chapters.findIndex(({ id }) => id === activeId) + 1]

  // Chapters are tabs, and a link to one that isn't rendered would change the route.
  const onChapterLink = (event: MouseEvent) => {
    const href = (event.target as Element).closest('a')?.getAttribute('href')
    if (!chapters.some(({ id }) => `#${id}` === href)) return
    event.preventDefault()
    setActiveId(href!.slice(1))
    rootRef.current?.closest('.project-drawer-scroll')?.scrollTo(0, 0)
  }

  return (
    <div ref={rootRef} className="cs-system" onClick={onChapterLink}>
      <div className="cs-shell">
        <nav className="cs-toc" aria-label="Case study sections">
          <ol className="cs-toc-list">
            {chapters.map(({ name, detail, id }, index) => {
              const current = id === activeId
              const body = (
                <>
                  <span className="cs-toc-number">{index + 1}</span>
                  <span className="cs-toc-text">
                    <span className="cs-toc-name">{name}</span>
                    {current && detail ? <span className="cs-toc-detail">{detail}</span> : null}
                  </span>
                </>
              )
              return (
                <li key={name} className={current ? 'is-current' : undefined}>
                  {id ? (
                    <a
                      className="cs-toc-row"
                      href={`#${id}`}
                      aria-current={current ? 'page' : undefined}
                    >
                      {body}
                    </a>
                  ) : (
                    <span className="cs-toc-row">{body}</span>
                  )}
                </li>
              )
            })}
          </ol>
          <p className="cs-toc-note">Earlier work: the first proposal</p>
        </nav>

        <div className="cs-content">
          {/* The drawer is named by this heading, so every tab needs it. */}
          {activeId === 'cs-situation' ? null : (
            <h1 id="case-title" className="visually-hidden">
              {intro.title}
            </h1>
          )}
          {activeId === 'cs-situation' ? (
          <div id="cs-situation" className="cs-chapter">
          <section className="cs-opening" aria-labelledby="case-title">
            <header className="cs-opening-head">
              <div className="cs-opening-copy">
                <span className="cs-chapter-label">
                  <ShippedBadge>{intro.status}</ShippedBadge>
                </span>
                <h1 id="case-title" className="cs-h1">
                  {intro.title}
                </h1>
                <p className="cs-b1 cs-opening-summary">{intro.summary}</p>
              </div>
              <div className="cs-opening-meta">
                <p className="cs-meta-title">{intro.metaTitle}</p>
                <p className="cs-meta-detail">{intro.metaDetail}</p>
              </div>
            </header>
            <figure className="cs-media">
              <figcaption className="cs-media-placeholder">{intro.mediaLabel}</figcaption>
            </figure>
          </section>

          <section className="cs-summary" aria-labelledby="cs-north-star">
            <p className="cs-tag">{northStar.label}</p>
            <div className="cs-summary-copy">
              <h2 id="cs-north-star" className="cs-h3">
                {northStar.statement}
              </h2>
              <p className="cs-b2">{northStar.lead}</p>
            </div>
            <Beats steps=".cs-summary-fact">
              <ul className="cs-summary-facts">
                {northStar.facts.map((fact, index) => (
                  <li key={fact.title} className="cs-summary-fact">
                    <span className="cs-marker" aria-hidden="true">
                      {index + 1}
                    </span>
                    <h3 className="cs-card-label">{fact.title}</h3>
                    <p className="cs-b3">{fact.text}</p>
                  </li>
                ))}
              </ul>
            </Beats>
          </section>

          <section className="cs-block" aria-labelledby="cs-test-case">
            <div className="cs-block-head">
              <h2 id="cs-test-case" className="cs-h2">
                {testCase.title}
              </h2>
              <p className="cs-b1 cs-block-summary">{testCase.summary}</p>
            </div>
            <div className="cs-block-body">
              <div className="cs-roles">
                {testCase.sides.map((side) => (
                  <div key={side.title} className={`cs-role-side is-${side.tone}`}>
                    <p className="cs-role-header">{side.title}</p>
                    <div className="cs-role-cards">
                      {side.roles.map((role) => (
                        <article key={role.label} className="cs-role-card">
                          <div className="cs-role-head">
                            <p className="cs-role-label">{role.label}</p>
                            <h3 className="cs-h4">{role.title}</h3>
                          </div>
                          <ul className="cs-role-points">
                            {role.points.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="cs-notes">
                <p className="cs-tag">Assumption</p>
                <p className="cs-small cs-note-text">{testCase.assumption}</p>
                <aside className="cs-decision" aria-label={testCase.decisionLabel}>
                  <p className="cs-decision-label">
                    <span className="cs-marker" aria-hidden="true">
                      i
                    </span>
                    {testCase.decisionLabel}
                  </p>
                  <ul className="cs-decision-rows">
                    {testCase.decisions.map((decision) => (
                      <li key={decision}>{decision}</li>
                    ))}
                  </ul>
                </aside>
              </div>
            </div>
          </section>

          <section className="cs-block" aria-labelledby="cs-urgent-order">
            <div className="cs-block-head">
              <h2 id="cs-urgent-order" className="cs-h2">
                {urgentOrder.title}
              </h2>
              <p className="cs-b1 cs-urgent-summary">{urgentOrder.summary}</p>
            </div>
            <div className="cs-compare">
              {urgentOrder.sides.map((side) => (
                <div key={side.title} className="cs-compare-side">
                  <div className="cs-compare-head">
                    <span className="cs-marker" aria-hidden="true" />
                    <h3 className="cs-step-title">{side.title}</h3>
                    <p className="cs-small">{side.summary}</p>
                  </div>
                  <div className="cs-compare-timing">
                    <div className={`cs-timing is-${side.tone}`}>
                      <div className="cs-timing-route" aria-hidden="true">
                        <RouteIcon />
                        <span className="cs-timing-line" />
                        <RouteIcon />
                      </div>
                      <div className="cs-timing-copy">
                        <p className="cs-timing-label">
                          {side.timing}
                          <span className="cs-tag">Assumption</span>
                        </p>
                        <p className="cs-timing-text">{side.timingDetail}</p>
                      </div>
                    </div>
                  </div>
                  <ol className="cs-steps">
                    {side.steps.map((step, index) => (
                      <li key={step.title} className="cs-step">
                        <span className="cs-marker" aria-hidden="true">
                          {side.tone === 'after' ? '✓' : index + 1}
                        </span>
                        <div className="cs-step-copy">
                          <h4 className="cs-step-title">{step.title}</h4>
                          <p className="cs-small">{step.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          <DecisionNote decision="The agents build on the ERP data Saga already reads.">
            <p className="cs-b2">
              An agent is only as good as its data and rules. Saga webshops already read live
              stock and contract prices from SAP or Dynamics; the missing piece is per-car fit
              data, licensed from a catalogue provider. An outside WhatsApp agent has neither the
              live ERP data nor the merchant’s rules. Today calls and quotes happen outside Saga,
              while with agents every decision happens on Saga and gets logged.
            </p>
            <p className="cs-small">
              The SAP and Dynamics link exists in Saga today. What outside agents lack is my
              reading, not a study.
            </p>
          </DecisionNote>
          </div>
          ) : null}

          {activeId === 'cs-research' ? <CaseStudy4Research id="cs-research" /> : null}
          {activeId === 'cs-proposal' ? <CaseStudy4Proposal id="cs-proposal" /> : null}
          {activeId === 'cs-trust' ? <CaseStudy4Trust id="cs-trust" /> : null}
          {activeId === 'cs-journeys' ? <CaseStudy4Journeys id="cs-journeys" /> : null}
          {activeId === 'cs-prototype' ? <CaseStudy4Prototype id="cs-prototype" /> : null}
          {activeId === 'cs-design-system' ? <CaseStudy4System id="cs-design-system" /> : null}
          {activeId === 'cs-vision' ? <CaseStudy4Vision id="cs-vision" /> : null}
          <nav className="cs-next" aria-label="Next chapter">
            <a className="cs-next-button" href={nextChapter ? `#${nextChapter.id}` : '#cs-prototype'}>
              {nextChapter ? `Next: ${nextChapter.name}` : 'Play the prototype'}
            </a>
            <p className="cs-next-text">
              {nextChapter ? nextChapter.detail : 'That’s the whole case. See it run in the prototype.'}
            </p>
          </nav>
        </div>
      </div>
    </div>
  )
}
