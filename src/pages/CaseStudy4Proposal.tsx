import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { DecisionNote } from './caseStudyParts.tsx'
import { AgentFlow } from './AgentFlow.tsx'
import { BuyerAgentFrame, DataDecisionsFrame, MerchantAgentsFrame, WhyDecidedFrame } from './ProposalFrames.tsx'

const alwaysPerson = [
  'Safety parts: brakes, steering, airbags',
  'Weak matches under 70',
  'Spend over the buyer’s limit',
  'Credit hold',
  'Missing contract price',
  'No fit data for the part',
  'Data older than the merchant allows',
  'ERP not reachable',
  'Any change to the rules',
]

const roles = [
  { name: 'Buyer', tone: 'buyer', text: 'The workshop lead. Can undo for 10 minutes or until the van leaves, and can ask for a person at any step.' },
  { name: 'Approver', tone: 'buyer', text: 'The workshop owner. Signs off the exact amount over the limit.' },
  { name: 'Merchant admin', tone: 'merchant', text: 'Sets and changes the merchant’s rules. Nobody else can.' },
  { name: 'Sales rep', tone: 'merchant', text: 'Takes each case the agents shouldn’t decide, with overrides logged.' },
]

export function CaseStudy4Proposal({ id }: { id: string }) {

  return (
    <div id={id} className="cs-chapter">
      <section className="cs-block" aria-labelledby={`${id}-title`}>
        <div className="cs-block-head">
          <span className="cs-chapter-label"><ShippedBadge>03 Proposal</ShippedBadge></span>
          <h2 id={`${id}-title`} className="cs-h1">
            One agent for the buyer, 4 for the merchant.
          </h2>
          <p className="cs-b1 cs-block-summary">
            Each buyer gets an agent that follows their company’s rules, and each merchant gets 4
            single-purpose agents. They meet on Saga, and an order only goes through when both
            sides’ rules agree.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-who`}>
        <div className="cs-block-head">
          <h3 id={`${id}-who`} className="cs-h2">
            Who acts, and for whom
          </h3>
          <p className="cs-b1 cs-block-summary">
            Follow the water pump for the Golf in bay 2: one agent for the buyer, 4 for the
            merchant, a single job each, and the people they hand over to.
          </p>
        </div>
        <div className="cs-block-body">
          <AgentFlow />
          <WhyDecidedFrame />
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-detail`}>
        <div className="cs-block-head">
          <h3 id={`${id}-detail`} className="cs-h2">
            The agents in detail
          </h3>
          <p className="cs-b1 cs-block-summary">
            What each is worth and how that gets tested, what it does, and what it never does.
          </p>
        </div>
        <div className="cs-block-body">
          <p className="cs-agent-side">For the buyer</p>
          <BuyerAgentFrame />
          <DecisionNote decision="The merchant hosts the buyer’s agent. The buyer owns its rules." assumption>
            <p className="cs-b2">
              The merchant offers the agent because Saga is the merchant’s store, and Saga pays to
              run it from the merchant’s fee. The rules on who may order, the limit and the approver
              belong to the buyer’s company, which can take them back at any time. The merchant’s
              agents only see whether an order is inside the limit, never the figure.
            </p>
            <p className="cs-b2">
              At first, a workshop buying from 4 merchants keeps its rules in 4 accounts. With the
              buyer’s consent, that can become one set of rules read by every Saga merchant it buys
              from. Prices and stock never pass between merchants.
            </p>
            <p className="cs-small">
              Whether workshops trust an agent their merchant hosts is still an assumption, tested
              by the workshop visits and the pilot.
            </p>
          </DecisionNote>
          <p className="cs-agent-side">For the merchant</p>
          <MerchantAgentsFrame />
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-data`}>
        <div className="cs-block-head">
          <h3 id={`${id}-data`} className="cs-h2">
            Data and decisions
          </h3>
          <p className="cs-b1 cs-block-summary">
            Where things live, and where the language model stops.
          </p>
        </div>
        <DataDecisionsFrame />
      </section>

      <section className="cs-block" aria-labelledby={`${id}-people`}>
        <div className="cs-block-head">
          <h3 id={`${id}-people`} className="cs-h2">
            Where people decide
          </h3>
          <p className="cs-b1 cs-block-summary">
            A merchant can add to this list, but never remove from it.
          </p>
        </div>
        <div className="cs-people">
          <div className="cs-people-always">
            <p className="cs-person-pill">Always a person</p>
            <ul className="cs-person-list">
              {alwaysPerson.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="cs-person-why">
              A wrong decision here costs more than the time an agent would save.
            </p>
          </div>
          <ul className="cs-people-roles">
            {roles.map((role) => (
              <li key={role.name} className={`cs-person-role is-${role.tone}`}>
                <h4 className="cs-person-role-name">{role.name}</h4>
                <p className="cs-person-role-text">{role.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-open`}>
        <div className="cs-block-head">
          <h3 id={`${id}-open`} className="cs-h2">
            Open to any buyer’s agent
          </h3>
          <p className="cs-b1 cs-block-summary">
            The same rules, plus a check on who it is. That check gets built after the pilot.
          </p>
        </div>
        <p className="cs-callout">
          An agent from another provider first proves who it is and that the buyer’s company allows
          it. It then reads the same rules, contract prices and live stock as the buyer’s agent on
          Saga, and each order lands in the same log and review.
        </p>
      </section>
    </div>
  )
}
