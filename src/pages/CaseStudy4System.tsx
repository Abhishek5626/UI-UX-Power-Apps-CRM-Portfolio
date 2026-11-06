import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { DecisionNote } from './caseStudyParts.tsx'
import { SkillRun } from './SkillRun.tsx'
import { SystemFlow } from './SystemFlow.tsx'
import { TokenStory } from './TokenStory.tsx'
import { Playground } from './Playground.tsx'
import { EvidenceFrame, StateRulesFrame, VoiceRationaleFrame } from './SystemFrames.tsx'

const skillParts = [
  { title: 'Use when', text: 'The agent talks to a buyer or an approver in WhatsApp.', note: 'Who reads it, and where' },
  { title: 'Limits', text: 'At most 3 reply buttons per message, a list of up to 10 rows, and templates outside the 24-hour window.', note: 'Set by the channel itself' },
  { title: 'Must show', text: 'The sender and “AI ordering agent”, one short message with the point first, and up to 4 facts with the source and age on each number. Up to 3 buttons, with a way to reach a person. A safety part gets no order button.', note: 'The same facts, in the same order' },
  { title: 'Tokens', text: 'Chat, action and agent role tokens.', note: 'Role tokens, so any brand flows in' },
  { title: 'Checked', text: 'Against the rules file, and then by a person. A Teams card also runs through a script.', note: 'By a script, then a designer' },
]

const cardChecks = [
  { rule: 'Source and age on every number', good: '7 numbers, each stamped', bad: '€176.90 has none' },
  { rule: 'At most 3 actions', good: '2 actions', bad: '4 actions' },
  { rule: 'No action on a safety part', good: 'None in the card', bad: '“Order now” sits on the brake pads' },
]

export function CaseStudy4System({ id }: { id: string }) {
  return (
    <div id={id} className="cs-chapter">
      <section className="cs-block" aria-labelledby={`${id}-title`}>
        <div className="cs-block-head">
          <span className="cs-chapter-label"><ShippedBadge>07 System</ShippedBadge></span>
          <h2 id={`${id}-title`} className="cs-h1">
            One design system behind every channel.
          </h2>
          <p className="cs-b1 cs-block-summary">
            All channels run on one agent-first design system. AI tools and agents read it as files,
            and each build runs the checks.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-connects`}>
        <div className="cs-block-head">
          <h3 id={`${id}-connects`} className="cs-h2">
            How it connects
          </h3>
          <p className="cs-b1 cs-block-summary">
            One doc goes in, and the same order comes out everywhere. Each need becomes a hypothesis,
            and only what passes a test goes into the system.
          </p>
        </div>
        <div className="cs-block-body">
          <SystemFlow />
          <DecisionNote decision="Source stamps in today’s webshop come first at Saga." assumption>
            <p className="cs-b2">
              Each number carries its ERP source and age, from the connection Saga webshops already
              use, and the stamps need no agent. Channels such as Teams or SMS follow once the system
              holds.
            </p>
            <p className="cs-small">
              Assumption: a new merchant needs no design hours. The pilot counts them, and times one
              channel from prompt to a passing card.
            </p>
          </DecisionNote>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-evidence`}>
        <div className="cs-block-head">
          <h3 id={`${id}-evidence`} className="cs-h2">
            Evidence first
          </h3>
          <p className="cs-b1 cs-block-summary">
            A test decides what goes live. Each change starts as a line in one requirements doc,
            which the PM and I write as the agent behaviour spec.
          </p>
        </div>
        <EvidenceFrame />
      </section>

      <section className="cs-block" aria-labelledby={`${id}-tokens`}>
        <div className="cs-block-head">
          <h3 id={`${id}-tokens`} className="cs-h2">
            One change, everywhere
          </h3>
          <p className="cs-b1 cs-block-summary">
            Design, engineering and AI read one set of token files: primitive to semantic to role,
            plus one file per merchant.
          </p>
        </div>
        <div className="cs-block-body">
          <TokenStory />
          <StateRulesFrame />
          <VoiceRationaleFrame />
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-playground`}>
        <div className="cs-block-head">
          <h3 id={`${id}-playground`} className="cs-h2">
            The playground
          </h3>
          <p className="cs-b1 cs-block-summary">
            One order, in 5 channels and any brand. Each render uses the same tokens and skills, so
            choosing a colour changes all of them.
          </p>
        </div>
        <div className="cs-block-body">
          <Playground />
          <DecisionNote decision="A new trade means new values, not a new design." assumption>
            <p className="cs-b2">
              Lab supplies for hospitals use the same 3 rule types, with values like catalogue number,
              sterility, lot and expiry.
            </p>
            <p className="cs-small">
              The case runs 2 trades on one design. A third isn’t built yet, so its own replay would
              test it.
            </p>
          </DecisionNote>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-skill`}>
        <div className="cs-block-head">
          <h3 id={`${id}-skill`} className="cs-h2">
            Inside a skill
          </h3>
          <p className="cs-b1 cs-block-summary">
            A skill is one short file an AI tool follows to build one thing. Each channel skill has
            the same 5 parts in the same order, shown here for a WhatsApp card.
          </p>
        </div>
        <div className="cs-block-body">
          <SkillRun parts={skillParts} />
          <div className="cs-table-card">
            <table className="cs-table">
              <caption className="visually-hidden">The same script run on two Teams cards</caption>
              <thead>
                <tr>
                  <th scope="col">The script’s rule</th>
                  <th scope="col">Good card: passes 3 of 3</th>
                  <th scope="col">Bad card: fails 3 of 3</th>
                </tr>
              </thead>
              <tbody>
                {cardChecks.map((check) => (
                  <tr key={check.rule}>
                    <th scope="row">{check.rule}</th>
                    <td>{check.good}</td>
                    <td>{check.bad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cs-small cs-note-text">
            The script checks 3 rules on each Teams card, and a person judges the rest. In production,
            a card that fails goes to a sales rep.
          </p>
        </div>
      </section>
    </div>
  )
}
