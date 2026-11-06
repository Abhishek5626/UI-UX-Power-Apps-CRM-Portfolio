import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import './playground.css'

const brands = [
  { name: 'Blue', colour: '#1f4fbf' },
  { name: 'Green', colour: '#306e43' },
  { name: 'Brick red', colour: '#aa3320' },
  { name: 'Purple', colour: '#613ba3' },
]

const channels = ['Webshop', 'WhatsApp', 'Email', 'Voice', 'Sales rep'] as const
type Channel = (typeof channels)[number]

const specs: Record<Channel, { skill: string; lead: string; rest: string; tokens: string[] }> = {
  Webshop: {
    skill: 'skills/order-card.md',
    lead: 'The agent state and the total never drop.',
    rest: ' Room for the full card, in 4 sizes.',
    tokens: ['card.*', 'action.*', 'stamp.*', 'agent.*', 'fit.*'],
  },
  WhatsApp: {
    skill: 'skills/whatsapp-card.md',
    lead: 'WhatsApp allows 3 reply buttons at most.',
    rest: ' So the point comes first.',
    tokens: ['chat.*', 'action.*', 'agent.*'],
  },
  Email: {
    skill: 'skills/email-card.md',
    lead: 'It has to make sense read later, in any mail app.',
    rest: ' 3 links at most.',
    tokens: ['card.*', 'action.*', 'agent.*', 'stamp.*'],
  },
  Voice: {
    skill: 'skills/voice-readback.md',
    lead: 'There is no screen.',
    rest: ' Part, price and arrival first, then the source and the undo time.',
    tokens: [],
  },
  'Sales rep': {
    skill: 'skills/rep-case-card.md',
    lead: 'The rep never starts from zero.',
    rest: ' 1 line says why the agent stopped.',
    tokens: ['card.*', 'fit.*', 'agent.handed', 'action.*'],
  },
}

const sizes = [
  { name: 'S', note: 'In a list' },
  { name: 'M', note: 'The card' },
  { name: 'L', note: 'With the why' },
  { name: 'XL', note: 'The full order page' },
]

type Line = {
  part: string
  maker: string
  short: string
  price: string
  fit: number
  source: string
  why: string
  score?: string
}

type Order = {
  brand: string
  merchant: string
  code: string
  customer: string
  state: string
  stock: string
  lines: Line[]
  approved: string
  approver: string
  total: string
  age: string
  threshold: number
  voice: [string, string][]
  rep: {
    title: string
    from: string
    facts: [string, string][]
    why: string
    options: { name: string; fit: number; note: string; price?: string }[]
  }
}

const trades: Record<'Auto parts' | 'Food', Order> = {
  'Auto parts': {
    brand: '#1f4fbf',
    merchant: 'Delta Parts',
    code: 'DP-20418',
    customer: 'Garage Noord, Utrecht',
    state: 'Agent acted, workshop owner approved',
    stock: 'From Utrecht branch, arrives 10:45',
    lines: [
      {
        part: '1 x Water pump, metal impeller',
        maker: 'Hollen, HP-2241',
        short: 'Water pump',
        price: '€148.60',
        fit: 90,
        source: 'ERP, 2 min ago',
        why: 'Fit 90 of 100, above the cooling threshold of 85. The agent orders it, with undo.',
        score: 'Cross-reference 50, fits the VIN 30, key specs 10',
      },
      {
        part: '1 x Timing belt kit',
        maker: 'Original part, OE 04L 198 119 A',
        short: 'Timing belt kit',
        price: '€176.90',
        fit: 100,
        source: 'ERP, 2 min ago',
        why: 'Exact match, 100 of 100. The agent orders it, with undo.',
        score: 'Exact OE part, so it scores 100',
      },
    ],
    approved: 'Approved by the workshop owner, exact amount. Undo until 07:54',
    approver: 'workshop owner',
    total: '€325.50',
    age: '2 min ago',
    threshold: 85,
    voice: [
      ['Part', '1 Hollen water pump with a metal impeller, and 1 original timing belt kit.'],
      ['Price', '325 euros 50, at your contract price.'],
      ['Arrival', 'At your workshop by 10:45.'],
      ['Source', 'Checked in the ERP 2 minutes ago.'],
      ['Undo', 'You have 10 minutes to undo.'],
    ],
    rep: {
      title: 'Garage Noord, Utrecht, water pump',
      from: 'Workshop lead, by voice. Order DP-20418',
      facts: [
        ['Vehicle', 'The Golf in bay 2'],
        ['Needed by', 'Car on the lift'],
        ['Part', 'Water pump'],
      ],
      why: 'Why the agent stopped: this merchant sends cooling parts to a person.',
      options: [
        { name: 'Original part', fit: 100, note: 'Out until tomorrow, 09:30' },
        { name: 'Hollen HP-2241', fit: 90, note: 'Fits this VIN, arrives 10:45', price: '€148.60' },
        { name: 'Vantor', fit: 70, note: 'Arrives 13:30, not listed for this VIN' },
      ],
    },
  },
  // shortcut: sample data written for this demo, swap it if a real food order exists.
  Food: {
    brand: '#306e43',
    merchant: 'Noord Foodservice',
    code: 'NF-3120',
    customer: 'Hotel Centraal, Rotterdam',
    state: 'Agent acted, kitchen manager approved',
    stock: 'From Rotterdam depot, arrives 14:00',
    lines: [
      {
        part: '4 x Whipping cream 35%, 6 x 1 L',
        maker: 'Dairy, DY-0635',
        short: 'Whipping cream',
        price: '€96.00',
        fit: 90,
        source: 'ERP, 4 min ago',
        why: 'Fit 90 of 100, above the dairy threshold of 85. The agent orders it, with undo.',
        score: 'Same product, same pack size, enough shelf life left',
      },
      {
        part: '6 kg Beef tenderloin',
        maker: 'Butchery, BF-5120',
        short: 'Beef tenderloin',
        price: '€188.50',
        fit: 100,
        source: 'ERP, 4 min ago',
        why: 'Exact match, 100 of 100. The agent orders it, with undo.',
        score: 'The product this kitchen always orders, so it scores 100',
      },
    ],
    approved: 'Approved by the kitchen manager, exact amount. Undo until 11:35',
    approver: 'kitchen manager',
    total: '€284.50',
    age: '4 min ago',
    threshold: 85,
    voice: [
      ['Part', '4 packs of whipping cream, and 6 kilos of beef tenderloin.'],
      ['Price', '284 euros 50, at your contract price.'],
      ['Arrival', 'At the hotel by 14:00.'],
      ['Source', 'Checked in the ERP 4 minutes ago.'],
      ['Undo', 'You have 10 minutes to undo.'],
    ],
    rep: {
      title: 'Hotel Centraal, Rotterdam, whipping cream',
      from: 'Head chef, by WhatsApp. Order NF-3120',
      facts: [
        ['Allergens', 'Milk'],
        ['Needed by', 'Today, 14:00'],
        ['Part', 'Whipping cream 35%'],
      ],
      why: 'Why the agent stopped: the shelf life left is under what this kitchen allows.',
      options: [
        { name: 'Dairy DY-0635', fit: 90, note: 'Pack of 6, arrives 14:00', price: '€96.00' },
        { name: 'Dairy DY-0410', fit: 70, note: 'Pack of 10, arrives 14:00' },
      ],
    },
  },
}

function Pressable({ pressed, onClick, children, className = '' }: { pressed: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" className={`pg-option ${className}`} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  )
}

function Meter({ fit, threshold }: { fit: number; threshold: number }) {
  return (
    <span className="pg-meter" style={{ '--fit': `${fit}%`, '--at': `${threshold}%` } as CSSProperties} aria-hidden="true">
      <span className="pg-meter-fill" />
      <span className="pg-meter-tick" />
    </span>
  )
}

function OrderCard({ order, size }: { order: Order; size: string }) {
  if (size === 'S') {
    return (
      <div className="pg-card pg-row">
        <span className="pg-row-code">{order.code}</span>
        <span className="pg-row-parts">{order.lines.map((line) => line.short).join(', ')}</span>
        <span className="pg-badge">Agent acted</span>
        <strong className="pg-row-total">{order.total}</strong>
      </div>
    )
  }
  return (
    <div className="pg-card">
      <div className="pg-head">
        <div className="pg-identity">
          <p className="pg-merchant">{order.merchant}</p>
          <p className="pg-soft">
            Order {order.code}, {order.customer}
          </p>
        </div>
        <div className="pg-state">
          <span className="pg-badge">Agent acted</span>
          <p className="pg-soft">{order.state}</p>
        </div>
      </div>
      {order.lines.map((line, i) => (
        <div key={line.part} className="pg-line">
          <div className="pg-summary">
            <p className="pg-part">
              <strong>{line.part}</strong> {line.maker}
            </p>
            <p className="pg-price">{line.price}</p>
          </div>
          <p className="pg-source">{line.source}</p>
          {size !== 'M' || i === 0 ? (
            <div className="pg-fit">
              <span className="pg-fit-score">
                <strong>Fit {line.fit}</strong>
                <Meter fit={line.fit} threshold={order.threshold} />
              </span>
              <span className="pg-small">{order.stock}</span>
            </div>
          ) : null}
          {size !== 'M' ? <p className="pg-small">{line.why}</p> : null}
          {size === 'XL' && line.score ? <p className="pg-small">{line.score}</p> : null}
        </div>
      ))}
      <div className="pg-total">
        <p className="pg-small">{order.approved}</p>
        <p className="pg-total-price">{order.total}</p>
      </div>
    </div>
  )
}

function Receipt({ order, email }: { order: Order; email?: boolean }) {
  return (
    <div className="pg-card">
      {email ? (
        <div className="pg-mail">
          <p className="pg-receipt-title">Your receipt, order {order.code}</p>
          <p className="pg-soft">{order.merchant}, AI ordering agent, to you</p>
        </div>
      ) : (
        <div className="pg-head">
          <div className="pg-identity">
            <p className="pg-merchant">{order.merchant}</p>
            <p className="pg-soft">AI ordering agent</p>
          </div>
          <span className="pg-badge">Agent acted</span>
        </div>
      )}
      {order.lines.map((line) => (
        <div key={line.part} className="pg-line">
          <div className="pg-summary">
            <p className="pg-part">
              <strong>{line.part}</strong> {line.maker}
            </p>
            <p className="pg-price">{line.price}</p>
          </div>
          <p className="pg-small">
            Fit {line.fit}. {order.stock}
          </p>
        </div>
      ))}
      <div className="pg-total">
        <p className="pg-small">Contract prices, ERP, {order.age}. Undo for 10 minutes, or until the van leaves</p>
        <p className="pg-total-price">{order.total}</p>
      </div>
      <div className="pg-actions" aria-hidden="true">
        <span className="pg-action is-brand">Undo order</span>
        <span className="pg-action">Track the delivery</span>
        <span className="pg-action">Talk to a sales rep</span>
      </div>
    </div>
  )
}

function VoiceCard({ order }: { order: Order }) {
  useEffect(() => () => window.speechSynthesis?.cancel(), [])
  const speak = () => {
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(order.voice.map(([, line]) => line).join(' ')))
  }
  return (
    <div className="pg-card">
      <div className="pg-head">
        <div className="pg-identity">
          <p className="pg-merchant">Voice read-back</p>
          <p className="pg-soft">{order.merchant}, AI ordering agent</p>
        </div>
        {'speechSynthesis' in window ? (
          <button type="button" className="pg-action is-brand" onClick={speak}>
            Play it aloud
          </button>
        ) : null}
      </div>
      <dl className="pg-voice">
        {order.voice.map(([label, line]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{line}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function RepCard({ order }: { order: Order }) {
  const { rep } = order
  return (
    <div className="pg-card">
      <div className="pg-head">
        <div className="pg-identity">
          <p className="pg-merchant">{rep.title}</p>
          <p className="pg-soft">{rep.from}</p>
        </div>
        <span className="pg-badge is-handed">Handed to a person</span>
      </div>
      <dl className="pg-facts">
        {rep.facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="pg-rep-why">{rep.why}</p>
      {rep.options.map((option) => (
        <div key={option.name} className="pg-line">
          <div className="pg-summary">
            <p className="pg-part">
              <strong>{option.name}</strong>
            </p>
            {option.price ? <p className="pg-price">{option.price}</p> : null}
          </div>
          <div className="pg-fit">
            <span className="pg-fit-score">
              <strong>Fit {option.fit}</strong>
              <Meter fit={option.fit} threshold={order.threshold} />
            </span>
            <span className="pg-small">{option.note}</span>
          </div>
        </div>
      ))}
      <div className="pg-actions" aria-hidden="true">
        <span className="pg-action is-brand">Confirm</span>
        <span className="pg-action">Suggest another</span>
        <span className="pg-action">Call the buyer</span>
      </div>
    </div>
  )
}

/** Figma 272:753. Only the Webshop state at size L is drawn there. */
export function Playground() {
  const [channel, setChannel] = useState<Channel>('Webshop')
  const [trade, setTrade] = useState<keyof typeof trades>('Auto parts')
  const [size, setSize] = useState('L')
  const [brand, setBrand] = useState(brands[0].colour)
  const order = trades[trade]
  const spec = specs[channel]

  const chooseTrade = (next: keyof typeof trades) => {
    setTrade(next)
    setBrand(trades[next].brand)
  }

  return (
    <div className="pg" style={{ '--pg-brand': brand } as CSSProperties}>
      <div className="pg-nav">
        <div className="pg-tabs" role="group" aria-label="Channel">
          {channels.map((name) => (
            <Pressable key={name} className="is-tab" pressed={channel === name} onClick={() => setChannel(name)}>
              {name}
            </Pressable>
          ))}
        </div>
      </div>
      <div className="pg-body">
        <div className="pg-preview">
          {channel === 'Webshop' ? <OrderCard order={order} size={size} /> : null}
          {channel === 'WhatsApp' ? <Receipt order={order} /> : null}
          {channel === 'Email' ? <Receipt order={order} email /> : null}
          {channel === 'Voice' ? <VoiceCard order={order} /> : null}
          {channel === 'Sales rep' ? <RepCard order={order} /> : null}
        </div>
        <aside className="pg-specs" aria-label={`${channel} specification`}>
          <div className="pg-spec">
            <p className="pg-spec-label">Input</p>
            <p className="pg-file">schema/order.schema.json</p>
          </div>
          <div className="pg-spec">
            <p className="pg-spec-label">Skill</p>
            <p className="pg-file">{spec.skill}</p>
          </div>
          <div className="pg-spec">
            <p className="pg-spec-label">Channel limits</p>
            <p className="pg-limits">
              <strong>{spec.lead}</strong>
              {spec.rest}
            </p>
          </div>
          <div className="pg-spec">
            <p className="pg-spec-label">Tokens</p>
            {spec.tokens.length ? (
              <ul className="pg-tokens">
                {spec.tokens.map((token) => (
                  <li key={token}>{token}</li>
                ))}
              </ul>
            ) : (
              <p className="pg-limits">Speaking rules, no colour</p>
            )}
          </div>
          {channel === 'Webshop' ? (
            <div className="pg-spec">
              <p className="pg-spec-label">Size</p>
              <div className="pg-sizes" role="group" aria-label="Card size">
                {sizes.map(({ name }) => (
                  <Pressable key={name} pressed={size === name} onClick={() => setSize(name)}>
                    {name}
                  </Pressable>
                ))}
              </div>
              <p className="pg-size-note">{sizes.find(({ name }) => name === size)!.note}</p>
            </div>
          ) : null}
        </aside>
      </div>
      <div className="pg-controls">
        <div className="pg-trade">
          <span className="pg-control-label">Trade</span>
          <div className="pg-trades" role="group" aria-label="Trade">
            {(Object.keys(trades) as (keyof typeof trades)[]).map((name) => (
              <Pressable key={name} pressed={trade === name} onClick={() => chooseTrade(name)}>
                {name}
              </Pressable>
            ))}
          </div>
          <span className="pg-control-label">{order.merchant}</span>
        </div>
        <div className="pg-brand">
          <span className="pg-control-label is-strong">Change the brand</span>
          <div className="pg-swatches" role="group" aria-label="Brand colour">
            {brands.map(({ name, colour }) => (
              <button
                key={name}
                type="button"
                className="pg-swatch"
                aria-label={name}
                aria-pressed={brand === colour}
                style={{ '--swatch': colour } as CSSProperties}
                onClick={() => setBrand(colour)}
              />
            ))}
            <label className="pg-picker">
              <span className="visually-hidden">Any colour</span>
              <input type="color" value={brand} onChange={(event) => setBrand(event.target.value)} />
            </label>
          </div>
          <div className="pg-token">
            <span className="pg-token-dot" aria-hidden="true" />
            <span className="pg-token-name">color.brand.base</span>
            <span className="pg-token-value">{brand}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
