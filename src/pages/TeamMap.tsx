import { useState } from 'react'
import { PlayButton, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import './team-map.css'

const roles = ['Me', 'Design team', 'Researcher', 'PM', '3 engineers', 'QA']

// One letter per mark: o owns it, s signs off, w does the work, a asked first. * rings as the row plays.
const groups = [
  {
    label: 'What I own and sign off',
    rows: [
      { title: 'The experience, end to end', text: 'Buyers and merchants, across every channel.', marks: ['o*', 'w', 'a', 'a', '', ''] },
      { title: 'The agent spec, written with the PM', text: 'Act, ask, explain, fall back and undo, which I sign off.', marks: ['ws*', 'w', 'a', 'w', 'w', 'w'] },
      { title: 'The AI-native design system', text: 'Tokens, skills and the card check.', marks: ['o*', 'w', '', '', 'a', ''] },
      { title: 'The research agenda', text: 'The researcher runs each study.', marks: ['o*', 'a', 'w', 'a', '', ''] },
      { title: 'Two sign-offs before anything ships', text: 'QA on function, and me on experience.', marks: ['s*', 'w', '', '', 'w', 's*'] },
      { title: 'Go or stop, called with the PM', text: 'At every gate, on evidence.', marks: ['o*', '', 'a', 'o*', '', ''] },
      { title: 'Coaching the design team and researcher', text: 'A monthly 1:1, and a quarterly focus they choose.', marks: ['o*', 'w', 'w', '', '', ''] },
    ],
  },
  {
    label: 'What the team decides',
    rows: [
      { title: 'Scope and sequence', text: 'Owned by the PM.', marks: ['a', 'a', 'a', 'o*', 'a', ''] },
      { title: 'How it gets built', text: 'Owned by the engineers.', marks: ['', 'a', '', '', 'o*', 'a'] },
    ],
  },
]

const names: Record<string, string> = { o: 'Owns it', s: 'Signs off', w: 'Does the work', a: 'Asked first' }
const legend = ['o', 's', 'w', 'a']

// Rows light 450ms apart, as measured on the reference.
const FIRST = 258
const STEP = 450
const ROWS = groups.flatMap((group) => group.rows).length
const ENDS = 4912

function Mark({ kind }: { kind: string }) {
  return (
    <span className="tm-mark-icon" data-mark={kind}>
      {kind === 's' ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 6.5 5 8.5 9 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  )
}

export function TeamMap() {
  const [now, setNow] = useState<number | null>(null)

  const { rootRef, replay } = useRun<HTMLElement>((root) => {
    if (prefersReducedMotion()) return []
    const cue = (delay: number, action: () => void) => {
      const animation = root.animate([], { delay, duration: 1 })
      animation.onfinish = action
      return animation
    }
    setNow(-1)
    return [...Array.from({ length: ROWS }, (_, i) => cue(FIRST + STEP * i, () => setNow(i))), cue(ENDS, () => setNow(null))]
  })

  let rowNumber = -1
  return (
    <section ref={rootRef} className="tm" aria-label="Who decides what">
      <div className="tm-top">
        <ul className="tm-legend">
          {legend.map((kind) => (
            <li key={kind}>
              <Mark kind={kind} />
              {names[kind]}
            </li>
          ))}
        </ul>
        <PlayButton label="Play the decisions" onClick={replay} />
      </div>
      <table className="tm-table">
        <thead>
          <tr>
            <td className="tm-corner" />
            {roles.map((role, i) => (
              <th key={role} scope="col" className={i === 0 ? 'tm-role is-me' : 'tm-role'}>
                {role}
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.label} className="tm-group">
            <tr>
              <th scope="rowgroup" className="tm-group-label">{group.label}</th>
              {roles.map((role, i) => (
                <td key={role} className={i === 0 ? 'tm-gap is-me' : 'tm-gap'} />
              ))}
            </tr>
            {group.rows.map((row) => {
              rowNumber += 1
              const state = now === null ? '' : rowNumber === now ? ' is-now' : rowNumber > now ? ' is-ahead' : ''
              return (
                <tr key={row.title} className={`tm-row${state}`}>
                  <th scope="row" className="tm-row-head">
                    <span className="tm-row-text">{row.title}</span>
                    <span className="tm-where">{row.text}</span>
                  </th>
                  {row.marks.map((mark, i) => {
                    const kinds = mark.replace('*', '').split('')
                    return (
                      <td key={roles[i]} className={`${mark ? 'tm-cell' : 'tm-cell is-empty'}${i === 0 ? ' is-me' : ''}${mark.includes('*') ? ' is-key' : ''}`}>
                        {mark ? (
                          <span className="tm-mark">
                            {kinds.map((kind) => (
                              <Mark key={kind} kind={kind} />
                            ))}
                            <span className="tm-chip-role">{roles[i]}</span>
                            <span className="tm-mark-label">{kinds.map((kind) => names[kind]).join(' and ')}</span>
                          </span>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>
    </section>
  )
}
