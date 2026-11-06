import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { TeamMap } from './TeamMap.tsx'
import { VisionBoard } from './VisionBoard.tsx'
import { OutcomesFrame } from './CaseStudyFigmaFrames.tsx'

const plan = [
  {
    code: '01', title: 'Listen', when: 'Weeks 1 to 4',
    text: 'Visits, interviews and the call count, with the replay under way.',
    owner: 'The researcher, with the design team',
    part: 'Write the agent spec with the PM, from the research questions.',
    gate: 'Moves on knowing where orders start',
  },
  {
    code: '02', title: 'Prove', when: 'Weeks 5 to 8',
    text: 'Read the replay, test voice, and build the eval set from past orders.',
    owner: 'The researcher, with an engineer and QA',
    part: 'Read the replay disagreements with the researcher, and call go or stop with the PM.',
    gate: 'Moves on at 90% rep agreement',
  },
  {
    code: '03', title: 'Pilot', when: 'From week 9',
    text: 'Filters and cooling at one merchant: shadow mode, then 6 to 10 weeks live.',
    owner: 'The PM, with the design team and the researcher',
    part: 'Sign off agent behaviour, and any change to a safety handover.',
    gate: 'Moves on when the pass marks hold',
  },
  {
    code: '04', title: 'Grow', when: 'Once the pass marks hold',
    text: 'More categories, then more merchants, with a monthly review feeding back in.',
    owner: 'The PM, with the whole team',
    part: 'Coach the team, and turn each lesson into the design system.',
  },
]

const quadrants = [
  { order: 1, title: 'First', scale: 'High impact, low effort', items: ['Source and age on each number in today’s webshop, from the same tokens and with no agent', 'The threshold replay on past orders, from week 1'] },
  { order: 2, title: 'Next', scale: 'High impact, high effort', items: ['The pilot in filters and cooling, shadow mode first', 'Voice, tested in a real workshop', 'More categories, each through the same gates'] },
  { order: 3, title: 'Then', scale: 'Lower impact, low effort', items: ['A second trade on the same template', 'More channels such as Teams or SMS, from the same design system'] },
  { order: 4, title: 'Not now', scale: 'Lower impact, high effort', items: ['Negotiation and custom quotes, and no second live merchant before the pilot passes'] },
]

export function CaseStudy4Vision({ id }: { id: string }) {
  return (
    <div id={id} className="cs-chapter">
      <section className="cs-block" aria-labelledby={`${id}-title`}>
        <div className="cs-block-head">
          <span className="cs-chapter-label"><ShippedBadge>08 Vision</ShippedBadge></span>
          <h2 id={`${id}-title`} className="cs-h1">
            From a phone call to a full record.
          </h2>
          <p className="cs-b1 cs-block-summary">
            By my reading, the urgent order still starts on the phone. Agents bring the decision
            online within both sides’ rules, and the webshop keeps the record of each order.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-plan`}>
        <div className="cs-block-head">
          <h3 id={`${id}-plan`} className="cs-h2">
            The whole plan
          </h3>
          <p className="cs-b1 cs-block-summary">
            Each step moves on evidence rather than a date, and I have a part in all of them. The
            weeks are targets.
          </p>
        </div>
        <div className="cs-block-body">
          <VisionBoard steps={plan}>
            <p>
            The fitment licence and the stock hold could move the pilot date, so both start in week 1.
            </p>
          </VisionBoard>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-lead`}>
        <div className="cs-block-head">
          <h3 id={`${id}-lead`} className="cs-h2">
            Lead and delegate
          </h3>
          <p className="cs-b1 cs-block-summary">
            I lead the design team and the researcher, alongside a PM, 3 engineers and QA. I own the
            experience and sign off what ships.
          </p>
        </div>
        <TeamMap />
      </section>

      <section className="cs-block" aria-labelledby={`${id}-first`}>
        <div className="cs-block-head">
          <h3 id={`${id}-first`} className="cs-h2">
            What comes first
          </h3>
          <p className="cs-b1 cs-block-summary">
            The order comes from impact against effort, with high impact and low effort first.
          </p>
        </div>
        <div className="cs-block-body">
          <ol className="cs-quadrants">
            {quadrants.map((quadrant) => (
              <li
                key={quadrant.title}
                className={quadrant.order === 1 ? 'cs-summary-fact is-first' : 'cs-summary-fact'}
              >
                <span className="cs-marker" aria-hidden="true">
                  {quadrant.order}
                </span>
                <h4 className="cs-card-label">{quadrant.title}</h4>
                <p className="cs-b3 cs-source">{quadrant.scale}</p>
                <ul className="cs-always-list">
                  {quadrant.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="cs-small cs-note-text">
            The placement is my call, and the pilot’s measures will confirm or change it.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-changes`}>
        <div className="cs-block-head">
          <h3 id={`${id}-changes`} className="cs-h2">
            What changes
          </h3>
          <p className="cs-b1 cs-block-summary">
            Value for the buyer, the merchant and Saga, each with its own measure.
          </p>
        </div>
        <OutcomesFrame />
      </section>

      <section className="cs-closing" aria-labelledby={`${id}-close`}>
        <h3 id={`${id}-close`} className="cs-h1">
          The Golf in bay 2 gets the right water pump, within minutes.
        </h3>
        <div className="cs-summary-facts cs-two-up">
          <div className="cs-summary-fact">
            <h4 className="cs-card-label">What the platform should count</h4>
            <p className="cs-b3">
              The webshop moved the transaction online, but never the decision. Webshop share only
              counts where an order was typed, so count the orders decided on Saga, in any channel.
            </p>
          </div>
          <div className="cs-summary-fact">
            <h4 className="cs-card-label">The next step</h4>
            <p className="cs-b3">
              First, 3 replay merchants sign before day 1, including the pilot merchant. Then in week
              1, we call 5 workshop leads and start the replay.
            </p>
          </div>
        </div>
        <a className="cs-closing-link" href="#cs-prototype">
          Play the order again
        </a>
      </section>
    </div>
  )
}
