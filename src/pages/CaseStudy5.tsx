import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { useReveal } from './caseStudyMotion.tsx'
import { QuikDemo } from './QuikDemo.tsx'
import { ActionSchema, BeforeAfter, BuildingBlocks, Directions, ResearchMap, VisualDirections } from './QuikFigures.tsx'
import './case-study-system.css'
import './case-study-type.css'
import './case-study-5.css'

/** Uses the Agentic AI shell, trail and type. A labelled concept: Quik's product and the targets are assumed. */
const chapters = [
  { name: 'Overview', detail: 'What was built, and for whom', id: 'q-overview' },
  { name: 'Who and why', detail: 'The gap, and who it affected', id: 'q-who' },
  { name: 'Foundation', detail: 'The core experience', id: 'q-foundation' },
  { name: 'Visual', detail: 'Direction and components', id: 'q-visual' },
  { name: 'Outcome', detail: 'What changed', id: 'q-outcome' },
]

const sections = [
  {
    id: 'q-who',
    label: '02 Who and why',
    title: 'Who and why',
    lead: 'Quik asks people to learn its menus before they can get anything done. Beginners stall at that step, and experts leave for their own tools.',
    blocks: [
      { title: 'Research process', text: 'For this concept, I’d have an AI research agent read Quik’s docs, public support threads and my own persona notes, and flag every point in a new user’s first hour where they stop to look something up. I’d rank those stops by how often they happen and how much they block, and turn the top three into the brief. The ranking below is my assumption until user interviews confirm it.', ratio: '901 / 393', figure: <ResearchMap /> },
      { title: 'Target customers and their pain points', text: 'Two groups matter most. First-time builders know what they want to launch, but not which Quik feature does it. Experienced developers know exactly what to do, and work faster in a terminal than in any dashboard. Both lose time for the same reason: Quik is organised around its features, not around their goals.', ratio: '901 / 518' },
    ],
  },
  {
    id: 'q-foundation',
    label: '03 Foundation',
    title: 'Define the foundational experience',
    lead: 'One workspace had to suit both groups without becoming two products. People describe a goal, see the plan, and stay in control of each step.',
    blocks: [
      { title: 'Design process', text: 'I compared three directions: a chat added to the current dashboard, a separate assistant app, and a new workspace built around tasks. The first left the menu problem in place, and the second split people from their projects. The workspace solved both, so I took it forward.', ratio: '901 / 462', figure: <Directions /> },
      { title: 'Identify building blocks and define interface layout', text: 'The experience needs four parts: a place to ask, a place to type commands, a plan to check, and a result to review. These became three panels. The terminal sits on the left, the conversation in the centre, and the plan and results on the right.', ratio: '901 / 623', figure: <BuildingBlocks /> },
      { title: 'Motion and interaction', text: 'Panels open and close as the work changes. Beginners start with the conversation alone, and the plan slides in once there is something to check. Experts can widen the terminal and keep the rest out of the way. Each move stays short, so it shows what changed without slowing anyone down.', ratio: '901 / 589' },
      { title: 'Backend structure and syntax', text: 'Each assistant action needs a clear structure behind it: what it will do, what it needs, what it costs, and whether it can be undone. The same structure drives the plan on screen and the matching terminal command, so the two views always agree.', ratio: '901 / 435', figure: <ActionSchema /> },
    ],
  },
  {
    id: 'q-visual',
    label: '04 Visual',
    title: 'Detailed design and visual exploration',
    lead: 'A quiet interface suits a tool people work in all day. The visual direction gives the content the most weight, and keeps colour for status and decisions.',
    blocks: [
      { title: 'Visual exploration', text: 'I tested a dense, technical look against a softer, more open one. The final direction sits between them: compact text for experts, with enough space that a beginner can find the next step.', ratio: '901 / 501', figure: <VisualDirections /> },
      { title: 'Component decisions', text: 'I removed borders that only separated things space could separate, along with decorative icons and repeated labels. Plans became simple numbered steps. Colour now appears only where someone needs to act or something needs attention.', ratio: '901 / 819', figure: <BeforeAfter /> },
    ],
  },
]

const highlights = [
  { title: 'Flexible layout', text: 'The panels follow the work from left to right: command, conversation, then review. Each one can resize or close, so people arrange the workspace to suit the task.', ratios: ['901 / 484', '901 / 502', '901 / 502'] },
  { title: 'Light and dark', text: 'Both themes share the same structure and status colours. Many developers work in dark mode all day, so it gets the same care as light mode.', ratios: ['901 / 507', '901 / 502', '901 / 502'] },
  { title: 'Core principle', text: 'Start from the goal, not the feature. Someone says what they want to launch or fix, the assistant proposes the steps, and nothing runs until they approve it.', ratios: ['901 / 507'] },
]

function Blank({ ratio }: { ratio: string }) {
  return <div className="cs-media q-blank" style={{ aspectRatio: ratio }} aria-hidden="true" />
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="q-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

/** A chapter's title, as in Agentic AI: grey badge, h1-sized heading, larger body text. */
function ChapterHead({ id, label, title, lead }: { id: string; label: string; title: string; lead: string }) {
  return (
    <section className="cs-block" aria-labelledby={`${id}-title`}>
      <div className="cs-block-head">
        <span className="cs-chapter-label">
          <ShippedBadge>{label}</ShippedBadge>
        </span>
        <h2 id={`${id}-title`} className="cs-h1">
          {title}
        </h2>
        <p className="cs-b1 cs-block-summary">{lead}</p>
      </div>
    </section>
  )
}

/** Header, then body text, then the image. */
function Block({ id, title, text, ratios, figure }: { id: string; title: string; text: string; ratios: string[]; figure?: ReactNode }) {
  return (
    <section className="cs-block" aria-labelledby={id}>
      <div className="cs-block-head">
        <h3 id={id} className="cs-h2">
          {title}
        </h3>
        <p className="cs-b1 cs-block-summary">{text}</p>
      </div>
      <div className="cs-block-body">
        {figure ?? ratios.map((ratio, index) => (
          <Blank ratio={ratio} key={index} />
        ))}
      </div>
    </section>
  )
}

export function CaseStudy5() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState(chapters[0].id)
  useReveal(rootRef, activeId)
  const nextChapter = chapters[chapters.findIndex(({ id }) => id === activeId) + 1]
  const section = sections.find(({ id }) => id === activeId)

  // Chapters are tabs, and a link to one that isn't rendered would change the route.
  const onChapterLink = (event: MouseEvent) => {
    const href = (event.target as Element).closest('a')?.getAttribute('href')
    if (!chapters.some(({ id }) => `#${id}` === href)) return
    event.preventDefault()
    setActiveId(href!.slice(1))
    rootRef.current?.closest('.project-drawer-scroll')?.scrollTo(0, 0)
  }

  return (
    <div ref={rootRef} className="cs-system q-page" onClick={onChapterLink}>
      <div className="cs-shell">
        <nav className="cs-toc" aria-label="Case study sections">
          <ol className="cs-toc-list">
            {chapters.map(({ name, detail, id }, index) => {
              const current = id === activeId
              return (
                <li key={id} className={current ? 'is-current' : undefined}>
                  <a className="cs-toc-row" href={`#${id}`} aria-current={current ? 'page' : undefined}>
                    <span className="cs-toc-number">{index + 1}</span>
                    <span className="cs-toc-text">
                      <span className="cs-toc-name">{name}</span>
                      {current ? <span className="cs-toc-detail">{detail}</span> : null}
                    </span>
                  </a>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="cs-content">
          {/* The drawer is named by this heading, so every tab needs it. */}
          {activeId === 'q-overview' ? (
            <div id="q-overview" className="cs-chapter">
              <section className="cs-opening" aria-labelledby="case-title">
                <div className="q-intro">
                  <header className="cs-opening-head">
                    <div className="cs-opening-copy">
                      <span className="cs-chapter-label">
                        <ShippedBadge>Concept case study</ShippedBadge>
                      </span>
                      <h1 id="case-title" className="cs-h1">
                        Quik assistant
                      </h1>
                    </div>
                    <div className="cs-opening-meta">
                      <p className="cs-meta-title">Product design concept</p>
                      <p className="cs-meta-detail">2026, AI assistant</p>
                    </div>
                  </header>
                  <p className="cs-b1 cs-opening-summary">
                    A concept for an AI assistant inside Quik, a platform for launching and running web apps.
                    Beginners get stuck learning its menus, and experienced developers would rather stay in their
                    terminal. This project explores one workspace that serves both.
                  </p>
                </div>
                <QuikDemo />
              </section>
            </div>
          ) : (
            <h1 id="case-title" className="visually-hidden">
              Quik assistant
            </h1>
          )}

          {section ? (
            <div id={section.id} className="cs-chapter">
              <ChapterHead id={section.id} label={section.label} title={section.title} lead={section.lead} />
              {section.blocks.map((block, index) => (
                <Block key={block.title} id={`${section.id}-${index}`} title={block.title} text={block.text} ratios={[block.ratio]} figure={block.figure} />
              ))}
            </div>
          ) : null}

          {activeId === 'q-outcome' ? (
            <div id="q-outcome" className="cs-chapter">
              <ChapterHead
                id="q-outcome"
                label="05 Outcome"
                title="Outcome"
                lead="Beginners reach their first launch without learning the menus, and experts keep their terminal and gain a faster way to plan."
              />
              <section className="cs-block" aria-labelledby="q-results">
                <div className="cs-block-head">
                  <h3 id="q-results" className="cs-h2">
                    Results
                  </h3>
                  <p className="cs-b1 cs-block-summary">This is a concept, so these are the targets a pilot would test, not measured results.</p>
                </div>
                <div className="q-bento">
                  <Metric value="10 min" label="Target: time to a new user’s first launch" />
                  <i />
                  <Metric value="30%" label="Target: fewer steps in common tasks" />
                  <div className="q-bento-image" aria-hidden="true" />
                  <i />
                  <Metric value="50%" label="Target: new users who start a task in chat" />
                  <Metric value="4.5/5" label="Target: satisfaction with the assistant" />
                  <i />
                </div>
              </section>
              {highlights.map((item, index) => (
                <Block key={item.title} id={`q-highlight-${index}`} title={item.title} text={item.text} ratios={item.ratios} />
              ))}
              <section className="cs-block" aria-labelledby="q-change">
                <div className="cs-block-head">
                  <h3 id="q-change" className="cs-h2">
                    What changed
                  </h3>
                  <p className="cs-b1 cs-block-summary">
                    People work from what they want to achieve, instead of hunting for the right feature. The next
                    step would be a small pilot with both groups, to test these targets and the three-panel layout.
                  </p>
                </div>
              </section>
            </div>
          ) : null}

          {nextChapter ? (
            <nav className="cs-next" aria-label="Next chapter">
              <a className="cs-next-button" href={`#${nextChapter.id}`}>
                Next: {nextChapter.name}
              </a>
              <p className="cs-next-text">{nextChapter.detail}</p>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  )
}
