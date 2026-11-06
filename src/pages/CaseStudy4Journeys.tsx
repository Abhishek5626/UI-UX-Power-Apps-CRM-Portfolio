import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { OrderPath } from './OrderPath.tsx'
import { ChannelsFrame } from './CaseStudyFigmaFrames.tsx'
import { JourneyBoard, type JourneyCard } from './JourneyBoard.tsx'

type PathStep = { code: string; title: string; hint: string; text: string; person?: boolean }

const orderPath: PathStep[] = [
  { code: 'M2', title: 'Setup agent', hint: 'Rules, set once', text: 'Before any call, the merchant admin approved the rules. Cooling passed its replay, so the agent can order alone from a fit score of 85.' },
  { code: 'B1', title: 'Trigger', hint: '3 ways in', text: 'The buyer calls about the Golf in bay 2. The agent says it’s an AI, then finds the car from the plate.' },
  { code: 'B2', title: 'Identify part', hint: 'Asks', text: 'Two water pumps fit this engine, so the agent asks one question. The buyer says metal.' },
  { code: 'B3', title: 'Search network', hint: 'Live ERP', text: 'Live from the merchant’s ERP: the original is out until tomorrow, and Hollen can arrive at 10:45.' },
  { code: 'B4', title: 'Decide', hint: '2 ways', person: true, text: 'The pump clears the threshold, with Hollen scoring 90 against 85, so the agent orders it. The belt kit has no fit data, so a sales rep picks it. Both rejoin at the approval.' },
  { code: 'M5', title: 'Sales rep', hint: 'On a stop', text: 'The rep gets one case card with the car, the part and why the agent stopped, and has a 5-minute answer target. The answer returns to the buyer’s thread, and the order moves to approval.' },
  { code: 'B5', title: 'Approve', hint: 'Approver', person: true, text: '€325.50 is over the workshop’s €300 limit. The buyer’s agent asks the approver, who agrees in one tap.' },
  { code: 'B6', title: 'Delivery', hint: 'Van booked', text: 'Stock has been held since the quote, and the van is booked to arrive at 10:45.' },
  { code: 'M6', title: 'Fulfilment agent', hint: 'Holds, books, writes', text: 'The fulfilment agent books the van and writes the order to the ERP, with no retyping. During the pilot, a sales rep books the van.' },
  { code: 'B7', title: 'Confirm', hint: 'Undo', person: true, text: 'The agent reads back the part, price and arrival. Undo stays open for 10 minutes, or until the van leaves.' },
  { code: 'B8', title: 'Record and return', hint: 'Logged', text: 'Each decision lands in the webshop log, with its rule, score and source.' },
  { code: 'M7', title: 'Review agent', hint: 'Every month', text: 'Each month the review agent summarises cooling. Only the merchant admin can change the threshold.' },
]

const control = [
  { code: 'B4', title: 'Act, ask or hand over', text: 'At or above the merchant’s threshold, 85 to start, the agent orders. From 70 up to it, the agent asks the buyer to confirm and explains why. Below 70, or on a hard rule, a sales rep takes over.' },
  { code: 'B5', title: 'Ask a person', text: 'Over €300, the buyer’s agent sends the exact amount to the approver’s own phone for a one-tap decision. The part stays held meanwhile.' },
  { code: 'B7', title: 'Be undone', text: 'Undo lasts 10 minutes, or until the van leaves. After that, one message starts a return.' },
]

const buyerCards: JourneyCard[] = [
  {
    code: 'B1', title: 'Trigger', channel: 'Voice, WhatsApp, Email', bold: 1,
    points: ['Says it is the merchant’s AI agent, then finds the car', 'The buyer’s agent checks the caller is on the company’s list'],
    edge: 'Unknown number: the approver confirms the caller', test: 'visits, voice test', links: ['M2'],
    why: {
      title: 'The order starts where the buyer already is.',
      decided: 'Urgent parts get ordered from the workshop floor with busy hands, so a call, WhatsApp or email starts the order, and never a form.',
      favour: 'Voice and chat agents exist elsewhere, but Saga’s edge sits behind them: live ERP data and the merchant’s rules. Phone orders that bypass the webshop today end up in it.',
      watch: 'A loud bay could break a call, so calls get tested and tuned in a real workshop, with WhatsApp voice notes as the backup.',
    },
  },
  {
    code: 'B2', title: 'Identify part', channel: 'Voice, WhatsApp, Email', bold: 0,
    points: ['2 versions fit: 1 question, never a form', 'Each line of a multi-part job is scored on its own'],
    edge: 'No fit data: a sales rep picks the part, the agent never guesses', test: 'visits', links: ['M1'],
  },
  {
    code: 'B3', title: 'Search network', channel: 'Merchant ERP', bold: 1,
    points: ['Warehouse, branch, then equivalents, live from the ERP', 'Source and age on every number'],
    edge: 'ERP not reachable: a sales rep checks stock by phone', today: true, links: ['M1'],
  },
  {
    code: 'B4', title: 'Decide', channel: 'Agent', bands: true, bold: 0,
    points: ['Hard rules first: a safety part always goes to a person', 'Then the fit score, then preference among parts that fit'],
    edge: 'Credit hold: a sales rep decides, whatever the score', test: 'replay', links: ['M2', 'M4', 'M5'],
    why: {
      title: 'Right part first, best part second.',
      decided: 'Is this the right part, and is it the best one? The agent answers those separately, so a perfect fit never gets held back by its brand.',
      favour: 'The rules come from the merchant’s catalogue and ERP plus licensed fitment data. Each merchant tunes its own thresholds, so one design serves many businesses.',
      watch: '85 is a starting point rather than a finding. The threshold replay tests it on past orders by asking where the sales rep would agree.',
    },
  },
  {
    code: 'B5', title: 'Approve', channel: 'WhatsApp', bold: 1,
    points: ['Inside the limit: no approval', 'Over €300: the approver decides in 1 tap'],
    edge: 'No reply in 15 minutes: a reminder, the part stays held', test: 'visits, pilot', links: ['M6'],
    why: {
      title: 'The buyer’s own agent asks the approver.',
      decided: 'An urgent repair can’t wait in an inbox. The buyer’s agent sends one WhatsApp card with the exact part, price and reason, for a one-tap answer.',
      favour: 'Spend limits, approvals and contract prices are B2B rules that, by my reading, consumer agents and simple webshops rarely handle. Keeping them inside the order sets Saga apart.',
      watch: 'After 15 minutes with no reply, a reminder goes out and the buyer is offered a call. The agent never approves alone, and asks again if the price moves.',
    },
  },
  {
    code: 'B6', title: 'Delivery', channel: 'WhatsApp, Email', bold: 1,
    points: ['Stock held since the quote', 'Order in the ERP, van booked with its arrival time'],
    edge: 'Van late: the buyer hears the new time first', test: 'pilot', links: ['M6'],
  },
  {
    code: 'B7', title: 'Confirm', channel: 'Voice, WhatsApp, Email', bold: 1,
    points: ['Reads back part, price and arrival, then a receipt', 'Undo for 10 minutes, or until the van leaves'],
    edge: 'Undo after the van left: it becomes a return', test: 'pilot',
  },
  {
    code: 'B8', title: 'Record and return', channel: 'Webshop, Email', bold: 0,
    points: ['Every decision in the webshop log: rule, score, source', 'A return takes 1 message, and teaches preference only'],
    edge: 'Merchant’s mistake: a free urgent resend', test: 'pilot', links: ['M7'],
  },
]

const merchantCards: JourneyCard[] = [
  {
    group: 'Set up once', code: 'M1', title: 'Connect', channel: 'Merchant settings', bold: 1,
    points: ['ERP, catalogue and cross-references connected', 'Prices and stock read live'],
    edge: 'No OE number or cross-reference: never ordered alone', test: 'replay', links: ['B2, B3'],
  },
  {
    code: 'M2', title: 'Set rules', channel: 'Merchant settings', bold: 1,
    points: ['The setup agent suggests each threshold, 85 to start. The admin approves', 'Safety categories: always a person'],
    edge: 'A buyer’s company can only make the rules stricter', test: 'replay', links: ['B1, B4'],
    why: {
      title: 'One template for every merchant.',
      decided: 'Each merchant fills the same template per category, and only the values change. The setup agent suggests them and the merchant admin approves.',
      favour: 'Three rule types suit auto parts and food alike: must match exactly, adds points, and only ranks. Safety always goes to a person, whether brakes and airbags, or allergen swaps and alcohol.',
      watch: 'Thresholds differ by category: cooling 85 and electrics 90 for parts, dry goods 85 and dairy 90 for food. A buyer’s company can only tighten them.',
    },
  },
  {
    code: 'M3', title: 'Test, then go live', channel: 'Merchant settings', bold: 1,
    points: ['The setup agent replays past orders, and shows where the rep disagreed', 'A category goes live only at 90% rep agreement'],
    edge: 'Under 90%: adjust the threshold, replay again', test: 'replay, interviews',
    why: {
      title: 'Replay before any real order.',
      decided: 'I don’t expect any merchant to let an agent sell on day one. Replaying past orders shows where it would be right before it touches a real one.',
      favour: 'Each merchant starts from its own evidence rather than ours. Below 90% rep agreement, a category only asks the buyer to confirm.',
      watch: 'The replay needs past orders with a plate or VIN. Without them, shadow mode is the gate, with the agent suggesting and the rep deciding, so going live takes longer.',
    },
  },
  {
    group: 'Run every day', code: 'M4', title: 'Case arrives', channel: 'Chat', bold: 0,
    points: ['A hard rule or a fit under 70: 1 case card for a sales rep', 'No rep free: the buyer hears when, stock stays held'],
    edge: 'Opening a case locks it, so 2 reps never take the same one', test: 'rep queue pilot', links: ['B4'],
  },
  {
    code: 'M5', title: 'Review and decide', channel: 'Chat', bold: 1,
    points: ['The card shows the car, why the agent stopped, every option', '5 minute answer target, then the next rep'],
    edge: 'Part not confirmed: the rep swaps it or calls the buyer', test: 'rep queue pilot', links: ['B4'],
  },
  {
    code: 'M6', title: 'Quote and fulfil', channel: 'Chat, ERP', bold: 1,
    points: ['Quote at contract price, held for the approver over the limit', 'Stock held, van booked, order in the ERP'],
    edge: 'Price moves after approval: the approver is asked again', test: 'pilot', links: ['B5, B6'],
  },
  {
    group: 'Review every month', code: 'M7', title: 'Review and tune', channel: 'Webshop, Email', bold: 1,
    points: ['Acted, asked and handed over, with undo and return rates', 'A person changes rules, the agent only suggests'],
    edge: 'Returns rise in a category: pause it in 1 click', test: 'pilot', links: ['B8'],
    why: {
      title: 'Only a person tunes the rules.',
      decided: 'A merchant lets the agent do more only after seeing it be right.',
      favour: 'Each merchant gets its own proof, from the same view for every business.',
      watch: 'Few cases can also mean the threshold is too loose, which returns per category will show.',
    },
  },
]

export function CaseStudy4Journeys({ id }: { id: string }) {
  return (
    <div id={id} className="cs-chapter">
      <section className="cs-block" aria-labelledby={`${id}-title`}>
        <div className="cs-block-head">
          <span className="cs-chapter-label"><ShippedBadge>05 Journeys</ShippedBadge></span>
          <h2 id={`${id}-title`} className="cs-h1">
            Two journeys, one order.
          </h2>
          <p className="cs-b1 cs-block-summary">
            The buyer’s side and the merchant’s side of the same urgent order. Where the agent
            stops, a sales rep picks it up with the whole case in hand.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-follow`}>
        <div className="cs-block-head">
          <h3 id={`${id}-follow`} className="cs-h2">
            Follow the order
          </h3>
          <p className="cs-b1 cs-block-summary">
            The Golf in bay 2 is waiting on the lift for a water pump. Choose any step. At B4 the
            order splits: the pump clears the threshold, and the belt kit stops.
          </p>
        </div>
        <div className="cs-block-body">
          <OrderPath
            steps={orderPath}
            control={control}
            summary="Inside the threshold, the agent orders alone. On a stop, a sales rep decides, and the approver signs off anything over the limit."
          />
          <p className="cs-small cs-note-text">
            Based on the prototype’s missing-fit-data path, using its mock ERP data.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-steps`}>
        <div className="cs-block-head">
          <h3 id={`${id}-steps`} className="cs-h2">
            Step by step
          </h3>
          <p className="cs-b1 cs-block-summary">
            Both sides in full. Each card notes the study testing it, and links to the other side
            of any handover.
          </p>
        </div>
        <JourneyBoard buyer={buyerCards} merchant={merchantCards} id={id} />
      </section>

      <section className="cs-block" aria-labelledby={`${id}-channels`}>
        <div className="cs-block-head">
          <h3 id={`${id}-channels`} className="cs-h2">
            Channel map
          </h3>
          <p className="cs-b1 cs-block-summary">
            Who uses each channel, and for what. Every order lands in the webshop, wherever it
            started.
          </p>
        </div>
        <div className="cs-block-body">
          <ChannelsFrame />
          <p className="cs-small cs-note-text">
            The same two journeys work for a food wholesaler. Only the trade data changes, with
            allergens and pack sizes replacing car fit.
          </p>
        </div>
      </section>
    </div>
  )
}
