import './proposal-frames.css'

/** Figma 236:2584, "Why I decided this" under the agent diagram. */
export function WhyDecidedFrame() {
  return (
    <aside className="pf-why" aria-label="Why I decided this">
      <div className="pf-why-head">
        <span className="pf-mark is-small" aria-hidden="true">i</span>
        <p className="pf-why-label">Why I decided this</p>
      </div>
      <div className="pf-why-columns">
        <div className="pf-why-column">
          <p className="pf-why-title">1 job per agent.</p>
          <p className="pf-body">Each agent has limits that match its job. The agent that talks to buyers never writes rules. The agent that reviews never touches an order. The buyer’s agent never sells, and the merchant’s agents never approve for the buyer. So each side can trust its own agent, and a fault in 1 agent stays inside its job.</p>
        </div>
        <div className="pf-why-column">
          <p className="pf-why-title">Each side gets its own agent.</p>
          <p className="pf-body">The buyer’s agent keeps the buyer company’s rules, and the merchant’s agents keep the merchant’s. Every merchant on Saga offers the buyer’s agent to its buyers by default, so each order stays inside both sides’ rules, at the merchant’s prices.</p>
        </div>
      </div>
    </aside>
  )
}

/** Figma 236:2562, the buyer's agent. */
export function BuyerAgentFrame() {
  return (
    <article className="pf-agent">
      <div className="pf-agent-head">
        <img className="pf-mark-icon" src="/case-study-4/icons/checkmark-filled.svg" alt="" width="20" height="20" />
        <h4 className="pf-agent-name">Buyer’s Agent</h4>
      </div>
      <div className="pf-agent-columns">
        <div className="pf-agent-column">
          <div className="pf-agent-label">
            <p>Value</p>
            <span className="pf-tag">Assumption</span>
          </div>
          <p className="pf-agent-text">The buyer stays in control without watching every order.</p>
          <p className="pf-agent-test">Tested by the workshop visits and the pilot</p>
        </div>
        <div className="pf-agent-column">
          <div className="pf-agent-label">
            <p>Does</p>
          </div>
          <p className="pf-agent-text">Keeps the company’s rules: who may order, the spend limit and the approver. Checks every pick against them, asks the approver, and keeps the buyer’s record.</p>
        </div>
        <div className="pf-agent-column is-never">
          <div className="pf-agent-label is-never">
            <span className="pf-never-dot" aria-hidden="true" />
            <p>Never</p>
          </div>
          <p className="pf-agent-text">Spends over the limit without the approver, or takes the order to another merchant.</p>
        </div>
      </div>
    </article>
  )
}

const merchantAgents = [
  {
    name: 'Setup agent',
    icon: 'model-builder.svg',
    value: 'A merchant fills 1 template instead of running a setup project.',
    test: 'Tested by the replay and the days from signup to live',
    does: (
      <>
        Replays past orders and suggests each category’s <span className="pf-term">threshold</span>, 85 to start.
      </>
    ),
    never: 'Applies a setting. A person approves each one.',
  },
  {
    name: 'Ordering agent',
    icon: 'chat.svg',
    value: 'The buyer gets an answer without waiting for a sales rep.',
    test: 'Tested by the pilot’s 5 minute pass mark',
    does: (
      <>
        Finds the car, asks 1 question if 2 versions of a part fit, then <strong>orders, asks the buyer to confirm, or hands over, and says why.</strong>
      </>
    ),
    never: 'Decides a safety part.',
  },
  {
    name: 'Fulfilment agent',
    icon: 'transfer.svg',
    value: 'No rekeying, so no typing errors on the way to the ERP.',
    test: 'Checked in the pilot, against the ERP log',
    does: 'Holds stock, books the van and writes the order to the ERP. In the pilot, a sales rep books the van.',
    never: 'Changes a price outside the contract.',
  },
  {
    name: 'Review agent',
    icon: 'meter.svg',
    value: 'The merchant sees where to trust the agent more, with numbers.',
    test: 'Tested by the override rate and the monthly threshold review',
    does: 'Sums up each category and suggests threshold changes.',
    never: 'Applies a rule change.',
  },
]

/** Figma 236:2241 for content, in the reference's single row of 4. */
export function MerchantAgentsFrame() {
  return (
    <div className="pf-merchants-frame">
      <ul className="pf-merchants">
        {merchantAgents.map((agent) => (
          <li key={agent.name} className="pf-merchant">
            <div className="pf-merchant-head">
              <span className="pf-merchant-icon" aria-hidden="true">
                <img src={`/case-study-4/icons/${agent.icon}`} alt="" width="20" height="20" />
              </span>
              <h4 className="pf-merchant-name">{agent.name}</h4>
            </div>
            <div className="pf-merchant-field">
              <div className="pf-agent-label">
                <p>Value</p>
                <span className="pf-tag">Assumption</span>
              </div>
              <p className="pf-merchant-value">{agent.value}</p>
              <p className="pf-merchant-test">{agent.test}</p>
            </div>
            <div className="pf-merchant-field">
              <div className="pf-agent-label">
                <p>Does</p>
              </div>
              <p className="pf-merchant-text">{agent.does}</p>
            </div>
            <div className="pf-merchant-field is-never">
              <div className="pf-agent-label is-never">
                <span className="pf-never-dot" aria-hidden="true" />
                <p>Never</p>
              </div>
              <p className="pf-merchant-text">{agent.never}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Figma 236:2549, data and decisions. */
export function DataDecisionsFrame() {
  return (
    <div className="pf-data">
      <div className="pf-data-card">
        <span className="pf-data-icon" aria-hidden="true">
          <span style={{ maskImage: 'url(/case-study-4/transfer.svg)' }} />
        </span>
        <div className="pf-data-text">
          <p className="pf-data-title">Orders, stock and prices stay in the merchant’s ERP.</p>
          <p className="pf-body">Agents read them live through the connection Saga webshops already use, with SAP and Microsoft Dynamics, and write orders back. Fit data per car comes from a licensed catalogue.</p>
        </div>
      </div>
      <div className="pf-data-card">
        <span className="pf-data-icon" aria-hidden="true">
          <span style={{ maskImage: 'url(/case-study-4/sparkle.svg)' }} />
        </span>
        <div className="pf-data-text">
          <p className="pf-body">The language model only understands and words the reply. Rules and a score decide.</p>
        </div>
      </div>
    </div>
  )
}
