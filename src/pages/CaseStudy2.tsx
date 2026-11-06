import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ShippedBadge } from '../components/ShippedBadge.tsx'
import './case-study.css'
import './case-study-2.css'

const facts = [
  { label: 'PRODUCT', value: 'LMS' },
  { label: 'TIMELINE', value: 'Q2 2023 - Q2 2024' },
  { label: 'MY ROLE', value: 'Sole Designer' },
]

const roles = ['Product Design', 'Dashboard', 'Strategy & Execution']

const stats = [
  { label: 'ARR', value: '10,000,00 RPS' },
  { label: 'ARR', value: '10,000,00 RPS' },
  { label: 'STUDENTS ENROLLED', value: '100+' },
  { label: 'PLACEMENT RATE', value: '90%' },
]

const problems = [
  {
    label: 'STUDENT SET 1',
    text: 'Students who missed live lectures felt left behind.',
    panels: [
      { src: '/case-study-2/set-1a.webp', color: '#2d4354' },
      { src: '/case-study-2/set-1b.webp', color: '#e8e8e8' },
    ],
  },
  {
    label: 'STUDENT SET 2',
    text: 'There was no motivation',
    panels: [
      { src: '/case-study-2/set-2a.webp', color: '#4d3c2c' },
      { src: '/case-study-2/set-2b.webp', color: '#e8e8e8' },
    ],
  },
  {
    label: 'STUDENT SET 3',
    text: 'No way to view the sessions again',
    panels: [
      { src: '/case-study-2/set-3a.webp', color: '#969696' },
      { src: '/case-study-2/set-3b.webp', color: '#e8e8e8' },
    ],
  },
]

function ProblemSlides() {
  return (
    <>
      {problems.map((problem) => (
        <article className="cs2-slide" key={problem.label}>
          <div className="cs2-slide-media">
            {problem.panels.map((panel) => (
              <div
                className="cs2-panel"
                key={panel.src}
                style={{ background: panel.color }}
              >
                <img
                  src={panel.src}
                  width={142}
                  height={142}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          <div className="cs2-slide-copy">
            <p className="cs2-set-label">{problem.label}</p>
            <p className="cs2-set-quote">{problem.text}</p>
          </div>
        </article>
      ))}
    </>
  )
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.8 19.2h9.3c.5 0 1-.5.9-1-.3-1.5-1.3-4.2-4.6-4.2s-4.3 2.7-4.6 4.2c-.1.5.3 1 .9 1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.8 14c1.4.3 2.4 1.6 2.7 2.7.1.5-.3 1-.9 1h-.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="9.5"
        cy="7.5"
        r="2.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16.5 10.2c0-1.5-1.2-2.7-2.7-2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function VisionSentence() {
  return (
    <>
      I didn’t want to make another boring LMS that looks like a 2008 admin
      dashboard. The vision was simple{' '}
      <strong>
        make learning feel like a game and a journey at the same time.
      </strong>
    </>
  )
}

const featurePills = [
  'Gamification',
  'Gamification',
  'AI-driven insights',
  'Pre-recorded courses',
  'Showcase tab',
]

function StackGrid() {
  const gridRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    const spot = spotRef.current
    if (!grid || !spot) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let x = 0
    let y = 0
    const paint = () => {
      frame = 0
      spot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      spot.style.opacity = '1'
    }
    const onMove = (event: PointerEvent) => {
      const rect = grid.getBoundingClientRect()
      x = event.clientX - rect.left - 100
      y = event.clientY - rect.top - 100
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onLeave = () => {
      spot.style.opacity = '0'
    }
    grid.addEventListener('pointermove', onMove)
    grid.addEventListener('pointerleave', onLeave)
    return () => {
      grid.removeEventListener('pointermove', onMove)
      grid.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="cs2-stack-card">
      <div className="cs2-stack-grid" ref={gridRef}>
        <div className="cs2-spot-layer" aria-hidden="true">
          <div className="cs2-spot" ref={spotRef} />
        </div>
        <div className="cs2-orbs" role="group" aria-label="Figma, React, and Claude">
          <div className="cs2-orb cs2-orb-figma">
            <span className="cs2-orb-glow" aria-hidden="true" />
            <span className="cs2-orb-fill">
              <svg viewBox="0 0 16 24" width="16" height="24" aria-hidden="true">
                <path d="M4.001 23.995C6.208 23.995 8 22.204 8 19.996V15.997H4.001C1.793 15.997.002 17.788.002 19.996.002 22.204 1.793 23.995 4.001 23.995Z" fill="#0acf83" />
                <path d="M.002 11.998C.002 9.79 1.793 7.998 4.001 7.998H8v7.999H4.001C1.793 15.997.002 14.205.002 11.998Z" fill="#a259ff" />
                <path d="M.002 3.999C.002 1.792 1.793 0 4.001 0H8v7.998H4.001C1.793 7.998.002 6.207.002 3.999Z" fill="#f24e1e" />
                <path d="M8 0h3.999C14.207 0 15.998 1.792 15.998 3.999c0 2.208-1.791 3.999-3.999 3.999H8V0Z" fill="#ff7262" />
                <path d="M15.998 11.998c0 2.207-1.791 3.999-3.999 3.999-2.207 0-3.999-1.792-3.999-3.999 0-2.208 1.792-4 3.999-4 2.208 0 3.999 1.792 3.999 4Z" fill="#1abcfe" />
              </svg>
            </span>
          </div>
          <div className="cs2-orb">
            <span className="cs2-orb-glow" aria-hidden="true" />
            <span className="cs2-orb-fill">
              <svg viewBox="0 0 23.681 23.999" width="24" height="24" aria-hidden="true">
                <path d="M22.12 9.823C22.664 8.189 22.477 6.398 21.606 4.912 20.297 2.632 17.664 1.459 15.093 2.011 13.949.722 12.306-.01 10.583 0 7.955-.006 5.624 1.686 4.815 4.187 3.127 4.532 1.67 5.589.817 7.087-.502 9.361-.202 12.227 1.561 14.177 1.016 15.812 1.204 17.602 2.075 19.088 3.384 21.368 6.017 22.541 8.588 21.989 9.731 23.278 11.375 24.011 13.097 23.999 15.727 24.006 18.059 22.313 18.868 19.81 20.556 19.464 22.013 18.407 22.866 16.91 24.184 14.636 23.882 11.771 22.121 9.821ZM13.099 22.431C12.047 22.433 11.027 22.064 10.22 21.39c.036-.019.1-.055.141-.08l4.779-2.76c.245-.139.395-.399.393-.68V11.132l2.02 1.167c.022.01.036.031.039.055v5.579c-.003 2.481-2.012 4.493-4.493 4.498ZM3.436 18.304c-.527-.911-.717-1.978-.536-3.014.035.021.097.06.141.085l4.779 2.76c.243.142.543.142.786 0l5.834-3.369v2.333c.001.024-.01.047-.029.062l-4.83 2.789C7.429 21.189 4.681 20.453 3.437 18.304ZM2.178 7.872c.525-.912 1.354-1.609 2.341-1.972v5.686c-.002.281.148.541.392.68l5.834 3.368-2.02 1.166c-.02.014-.045.016-.068.006l-4.831-2.791C1.676 12.771.94 10.024 2.177 7.873ZM18.773 11.734l-5.835-3.369 2.02-1.166c.02-.013.046-.015.068-.006l4.832 2.79c2.151 1.242 2.888 3.994 1.645 6.145-.525.911-1.353 1.608-2.34 1.971v-5.686c.003-.28-.147-.54-.39-.679ZM20.783 8.708c-.036-.021-.098-.059-.142-.084l-4.779-2.76a.86.86 0 0 0-.785 0L9.242 9.233V6.9c-.001-.024.01-.047.029-.062l4.831-2.787c2.151-1.241 4.902-.503 6.143 1.65.524.909.714 1.973.536 3.007h.002ZM8.144 12.866 6.124 11.699c-.022-.01-.036-.031-.039-.055V6.065C6.086 3.581 8.102 1.568 10.586 1.569c1.05 0 2.067.369 2.875 1.041-.037.02-.1.055-.142.08l-4.779 2.76c-.244.139-.394.399-.393.68l-.003 6.734v.002ZM9.242 10.5 11.84 8.999 14.439 10.499v3L11.84 15l-2.598-1.5V10.5Z" fill="#fff" />
              </svg>
            </span>
          </div>
          <div className="cs2-orb">
            <span className="cs2-orb-glow" aria-hidden="true" />
            <span className="cs2-orb-fill">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path transform="translate(0 0.132)" d="M4.679 15.872 9.373 13.239l.079-.229-.079-.127h-.229l-.784-.049-2.682-.072-2.326-.097-2.253-.121L.532 12.424 0 11.723l.055-.35.477-.32.682.059 1.51.104 2.264.156 1.643.096L9.065 11.721h.387l.055-.156-.133-.097-.103-.096-2.343-1.588L4.391 8.105 3.062 7.139l-.718-.49-.363-1.002.652-.718.877.059.223.06.888.683 1.896 1.467 2.476 1.824.362.301.145-.103.018-.073-.163-.272-1.347-2.434L6.416 3.507l-.64-1.026-.169-.616C5.547 1.612 5.504 1.4 5.504 1.14L6.246.132 6.657 0l.991.132.417.362.615 1.408.997 2.217 1.547 3.013.452.894.242.828.09.253h.156V8.962l.128-1.698.235-2.084.228-2.682.079-.755.374-.905.743-.49.579.277.477.683-.066.441-.283 1.843-.556 2.886-.362 1.933.211 0 .241-.241.978-1.299 1.643-2.053.725-.815.845-.901.543-.428 1.026 0 .756 1.123-.339 1.159-1.056 1.34-.876 1.136-1.257 1.691-.784 1.353.072.108.187-.018 2.838-.604 1.534-.277 1.829-.314.828.387.09.393-.325.804-1.957.483-2.295.459-3.418.809-.042.03.048.06 1.54.145.659.035 1.612 0 3.003.224.784.519.47.634-.079.484-1.208.615-1.63-.387-3.804-.905-1.305-.325h-.18v.108l1.087 1.063 1.992 1.799 2.495 2.319.128.574-.321.452-.338-.048-2.192-1.649-.846-.743-1.915-1.612h-.127v.169l.441.646 2.331 3.503.121 1.074-.17.35-.604.211-.663-.121-1.365-1.915-1.407-2.157-1.136-1.933-.138.079-.67 7.218-.315.369-.724.277-.604-.459-.321-.743.321-1.467.386-1.915.314-1.522.284-1.629.169-.629-.011-.041-.139.017-1.425 1.957-2.168 2.93-1.716 1.836-.411.163-.712-.369.066-.658.398-.587 2.375-3.02 1.431-1.872.925-1.08-.061-.157-.055 0-6.306 4.095-1.123.145-.483-.453.059-.742.229-.242 1.896-1.305-.006.007Z" fill="#d97757" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductMock() {
  return (
    <div className="cs2-ui">
      <div className="cs2-ui-bar">
        <div className="cs2-ui-brand">
          <svg viewBox="0 0 26 26" width="13" height="13" aria-hidden="true">
            <defs>
              <linearGradient id="cs2-star" x1="21.7" y1="5.76" x2="3.98" y2="20.79" gradientUnits="userSpaceOnUse">
                <stop stopColor="#217bfe" />
                <stop offset="1" stopColor="#bd99fe" />
              </linearGradient>
            </defs>
            <path d="M13.374.801C12.966 7.56 7.557 12.969.798 13.377v.048c6.759.408 12.168 5.817 12.576 12.576h.048c.408-6.759 5.817-12.168 12.576-12.576v-.048C19.239 12.969 13.83 7.56 13.422.801h-.048Z" fill="url(#cs2-star)" />
          </svg>
          <p>MasterClass</p>
        </div>
        <div className="cs2-ui-tools">
          <svg viewBox="0 0 16 19" width="15" height="15" aria-hidden="true">
            <path fill="#a6a6a6" fillRule="evenodd" d="M2.56 4.676C2.806 2.203 4.923.5 7.366.5h1.267c2.443 0 4.56 1.703 4.806 4.176l.423 4.496c.14 1.393.741 2.799 1.69 3.808.52.551.524 1.315.323 1.862-.202.548-.72 1.152-1.535 1.152h-3.382a2.5 2.5 0 0 1-4.917 0H1.658C.843 15.994.325 15.39.123 14.842c-.201-.547-.197-1.311.322-1.862.95-1.009 1.551-2.415 1.69-3.808L2.56 4.676ZM6.585 16a1.5 1.5 0 0 0 2.829 0H6.585Z" />
          </svg>
          <img src="/case-study-2/avatar.png" width={120} height={120} alt="" />
        </div>
      </div>
      <div className="cs2-ui-body">
        <p className="cs2-ui-continue">
          <svg viewBox="0 0 12 15" width="11" height="11" aria-hidden="true">
            <path fill="#fff" d="M6.01.3c.22.08.35.3.33.52L5.95 4.5h3.55c.19 0 .37.1.46.27.09.17.08.37-.03.52L4.9 13.1c-.13.2-.38.28-.6.2-.22-.08-.36-.3-.34-.53l.3-3.62H.9c-.2 0-.37-.11-.46-.27-.09-.17-.08-.37.03-.52L5.4.5c.14-.2.38-.27.61-.2Z" />
          </svg>
          Continue Learning
        </p>
        <img
          className="cs2-ui-art"
          src="/case-study-2/empty-courses.webp"
          width={1200}
          height={700}
          alt=""
        />
        <div className="cs2-ui-empty">
          <p>Course</p>
          <p>You don’t have any active courses</p>
          <p>Select a cpurse and start improving your skills.</p>
        </div>
        <p className="cs2-ui-browse">Browse Courses</p>
      </div>
    </div>
  )
}

const motionLine = 'まるで魔法のようなデザインのディ'
const motionApps = [
  ['Apple TV', '/case-study-2/icon-apple-tv.svg'],
  ['Photos', '/case-study-2/icon-photos.svg'],
  ['Playground', '/case-study-2/icon-playground.svg'],
  ['Notes', '/case-study-2/icon-notes.svg'],
] as const

function MotionPhone() {
  return (
    <div className="cs2-app cs2-app-tall cs2-motion">
      <div className="cs2-motion-scale">
        <img
          className="cs2-motion-phone"
          src="/case-study-2/motion-phone.png"
          width={1450}
          height={2936}
          alt=""
        />
        <div className="cs2-motion-ui">
          <p className="cs2-motion-kicker">English</p>
          <p className="cs2-motion-headline">Design details that feel like magic</p>
          <span className="cs2-motion-rule" />
          <p className="cs2-motion-kicker cs2-motion-jp">Japanese</p>
          <p className="cs2-wave" aria-label={motionLine}>
            {[...motionLine].map((char, index) => (
              <span key={index} style={{ ['--i' as string]: index }}>
                {char}
              </span>
            ))}
          </p>
          <span className="cs2-motion-pause" aria-hidden="true">
            <span />
            <span />
          </span>
          <ul className="cs2-motion-apps">
            {motionApps.map(([label, src]) => (
              <li key={label}>
                <img src={src} width={60} height={60} alt="" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function MetaValue({ children }: { children: string }) {
  return (
    <p className="cs2-feature-meta-value">
      {children}
      <span className="cs2-feature-meta-shine" aria-hidden="true">
        {children}
      </span>
    </p>
  )
}

const dashNav = [
  { items: ['Home', 'Bookmarks'] },
  { title: 'Learn', items: ['Courses', 'Assignments', 'Masterclass', 'Briefs', 'Classes'] },
  { title: 'Grow', items: ['Showcase', 'Certificate', 'Job Board'] },
]

/** The LMS sidebar and top bar shared by the screens on the Framer page. */
function DashChrome({
  clipped = false,
  children,
}: {
  clipped?: boolean
  children: ReactNode
}) {
  return (
    <div className="cs2-dash-frame">
      <div className={clipped ? 'cs2-dash is-clipped' : 'cs2-dash'}>
        <div className="cs2-dash-side">
          <span className="cs2-dash-brand">
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
              <path d="M6.5 0 8 5l5 1.5L8 8l-1.5 5L5 8 0 6.5 5 5Z" fill="#8b5cf6" />
            </svg>
            MasterClass
          </span>
          {dashNav.map((group, index) => (
            <div key={index} className="cs2-dash-group">
              {group.title ? (
                <span className="cs2-dash-group-title">{group.title}</span>
              ) : null}
              {group.items.map((item) => (
                <span
                  key={item}
                  className={
                    item === 'Home' ? 'cs2-dash-link is-active' : 'cs2-dash-link'
                  }
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
          <div className="cs2-dash-update">
            <span className="cs2-dash-update-art" />
            <span className="cs2-dash-update-row">
              <span>We’ve made some updates</span>
              <span className="cs2-dash-update-button">Updates</span>
            </span>
          </div>
          <span className="cs2-dash-link cs2-dash-settings">Settings</span>
        </div>

        <div className="cs2-dash-main">
          <div className="cs2-dash-top">
            <span className="cs2-dash-search">
              Search Instructors, Classes, Topics and more
            </span>
            <img src="/case-study-2/avatar.png" width={16} height={16} alt="" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

const coursePills = ['All', 'UX', 'UI', 'AI', 'Career', 'Interaction', 'Design System', 'Framer', 'HTML', 'CSS', 'React', 'Skill Path']
const showcasePills = ['Application', 'UI Element', 'Websites', 'Design System', 'Creativity', 'Interaction', 'Coding', 'Framer']

function DashPills({ pills, active }: { pills: string[]; active: string }) {
  return (
    <ul className="cs2-dash-pills">
      {pills.map((pill) => (
        <li key={pill} className={pill === active ? 'is-active' : undefined}>
          {pill}
        </li>
      ))}
    </ul>
  )
}

function CoursesDashboard() {
  return (
    <DashChrome clipped>
      <div className="cs2-dash-page">
        <span className="cs2-dash-page-title">Courses</span>
        <span className="cs2-dash-page-sub">
          Improve your skills through interactive, hands-on professional courses.
        </span>
        <DashPills pills={coursePills} active="UI" />
        <span className="cs2-dash-path-title">
          Master Navigation Patterns for Mobile &amp; Desktop UI
        </span>
        <span className="cs2-dash-path-sub">6 courses · intermediate</span>
        <ul className="cs2-dash-courses">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index}>
              <span className="cs2-dash-course-art" />
              <span className="cs2-dash-course-title">Product Designer</span>
              <span className="cs2-dash-course-body">
                Explore AI concepts, principles and praotices essentail for
                creating human
              </span>
              <span className="cs2-dash-course-progress">3% · 6h left</span>
            </li>
          ))}
        </ul>
      </div>
    </DashChrome>
  )
}

function ShowcaseCard({ preview }: { preview?: ReactNode }) {
  return (
    <li>
      <span className="cs2-dash-show-preview">
        {preview ?? <span className="cs2-dash-show-welcome">Welcome to SpaceX</span>}
      </span>
      <span className="cs2-dash-show-meta">
        <span>
          <span className="cs2-dash-show-kicker">Assessment</span>
          <span className="cs2-dash-show-title">Space Technology Website</span>
        </span>
        <span className="cs2-board-face" />
      </span>
      <span className="cs2-dash-show-body">
        Exercise where you learn about the fundamental principles of designs by
        replicating the design as it is.
      </span>
      <span className="cs2-dash-show-points">
        {[0, 1].map((index) => (
          <span key={index}>
            <span className="cs2-dash-show-coin" />
            <span>
              <span className="cs2-dash-show-value">2,524 Points</span>
              <span className="cs2-dash-show-label">My Exp Points</span>
            </span>
          </span>
        ))}
      </span>
    </li>
  )
}

function ShowcaseDashboard() {
  return (
    <DashChrome clipped>
      <div className="cs2-dash-page">
        <span className="cs2-dash-page-title">Showcase</span>
        <span className="cs2-dash-page-sub">
          Improve your skills through interactive, hands-on professional courses.
        </span>
        <DashPills pills={showcasePills} active="Websites" />
        <ul className="cs2-dash-showcase">
          <ShowcaseCard />
          <ShowcaseCard />
          <ShowcaseCard preview={<MotionPhone />} />
          <ShowcaseCard />
        </ul>
      </div>
    </DashChrome>
  )
}

const features = [
  [
    ['Goal', 'Boost motivation'],
    ['Reason', 'Makes progress feel visible'],
    ['Feature', 'Leaderboard'],
  ],
  [
    ['Goal', 'Encourage consistency'],
    ['Reason', 'Weekly rewards, XP system'],
    ['Feature', 'Gamification'],
  ],
  [
    ['Goal', 'Help catch up'],
    ['Reason', 'Recorded sessions, flexible pacing'],
    ['Feature', 'No more missing out'],
  ],
  [
    ['Goal', 'Build belonging'],
    ['Reason', 'Showcase and events tab'],
    ['Feature', 'Keeps community spirit alive'],
  ],
] as const

function MetaRow({
  items,
  cards = false,
}: {
  items: readonly (readonly [string, string])[]
  cards?: boolean
}) {
  return (
    <div className={cards ? 'cs2-feature-meta is-carded' : 'cs2-feature-meta'}>
      {items.map(([label, value]) => (
        <div className="cs2-feature-meta-col" key={label}>
          <p>{label}</p>
          <svg
            className="cs2-feature-meta-arrow"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M8 2v12M3.5 9.5 8 14l4.5-4.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {cards ? (
            <div className="cs2-feature-meta-card">
              <MetaValue>{value}</MetaValue>
            </div>
          ) : (
            <MetaValue>{value}</MetaValue>
          )}
        </div>
      ))}
    </div>
  )
}

export function CaseStudy2() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const visionRef = useRef<HTMLElement>(null)
  const systemRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observers: IntersectionObserver[] = []
    const watch = (node: HTMLElement | null) => {
      if (!node) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          node.classList.toggle('is-paused', !entry.isIntersecting)
        },
        { rootMargin: '120px' },
      )
      observer.observe(node)
      observers.push(observer)
    }
    watch(marqueeRef.current)
    watch(visionRef.current)
    watch(systemRef.current)
    return () => observers.forEach((observer) => observer.disconnect())
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Developing the PAUX LMS — Abhishek Kashid'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="case-study cs2">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="cs-column">
        <section className="cs2-hero" aria-labelledby="case-title">
          <div className="cs2-lead">
            <div className="cs2-head">
              <ShippedBadge>SHIPPED</ShippedBadge>
              <div className="cs2-title-row">
                <h1 id="case-title">Developing the PAUX LMS</h1>
                <p>Turning Frustrations into a Fully Coded Learning System</p>
              </div>
            </div>

            <div className="cs2-frame">
              <img
                src="/case-study-2/hero.png"
                width={1888}
                height={849}
                alt="MasterClass dashboard with a dark sidebar, a welcome message for Abhishek, and a continue-learning card."
              />
            </div>
          </div>

          <div className="cs2-intro">
            <div className="cs2-copy">
              <p>
                After running the first version of PAUX Academy, things were
                going great, students were learning, projects were happening,
                the energy was high. But after a few months, I started noticing
                a pattern that bugged me.
              </p>
              <p>
                Students who missed a session would DM me later saying they
                couldn’t catch up. Others admitted they were losing momentum
                because they didn’t have any sense of progress or reward. A few
                just wanted the freedom to go at their own pace.
              </p>
              <p>
                That’s when the idea hit me maybe what we needed wasn’t just
                better scheduling or reminders. We needed a space that could{' '}
                <em>learn</em> with the students. Something flexible, gamified,
                and alive.
              </p>
              <p>
                That’s how <strong>PAUX LMS</strong> was born my mission to
                build a full-fledged learning system from scratch.
              </p>
            </div>
            <div className="cs2-meta">
              <dl className="cs2-facts">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="cs2-chips">
                {roles.map((role) => (
                  <li key={role}>
                    <span className="cs2-dot" aria-hidden="true" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="cs2-stats">
            {stats.map((stat, index) => (
              <li key={`${stat.label}-${index}`}>
                <p className="cs2-stat-label">
                  <UsersIcon />
                  {stat.label}
                </p>
                <p className="cs2-stat-value">{stat.value}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="cs2-problems" aria-labelledby="problems-title">
          <div className="cs2-split">
            <h2 id="problems-title">Spotting the Real Problems</h2>
            <p>
              I went back to all the feedback from the first cohort Notion
              notes, chat messages, survey forms and grouped them into recurring
              issues.
            </p>
          </div>
          <div className="cs2-problem-stage">
            <div
              className="cs2-marquee"
              ref={marqueeRef}
              aria-label="Student problem sets"
            >
              <div className="cs2-problem-track">
                <div className="cs2-problem-set">
                  <ProblemSlides />
                </div>
                <div className="cs2-problem-set" aria-hidden="true">
                  <ProblemSlides />
                </div>
              </div>
            </div>
            <p className="cs2-note">
              These pain points became the foundation for everything that
              followed.
            </p>
          </div>
        </section>

        <section
          className="cs2-vision"
          aria-labelledby="vision-title"
          ref={visionRef}
        >
          <div className="cs2-split">
            <div className="cs2-vision-titles">
              <h2 id="vision-title">The Vision</h2>
              <p className="cs2-vision-sub">What I Wanted to Build</p>
            </div>
            <div className="cs2-vision-copy">
              <div className="cs2-vision-once">
                <p>
                  I didn’t want to make another boring LMS that looks like a
                  2008 admin <br />
                  dashboard.
                </p>
                <p>
                  The vision was simple{' '}
                  <strong>
                    make learning feel like a game and a journey at the same
                    time.
                  </strong>
                </p>
              </div>
              <div className="cs2-vision-twice">
                <p>
                  <VisionSentence />
                </p>
                <p aria-hidden="true">
                  <VisionSentence />
                </p>
              </div>
            </div>
          </div>

          <div className="cs2-vision-body">
            <div className="cs2-quote-block">
              <div className="cs2-quote-bar">
                <p className="cs2-quote">
                  “A system where learning is flexible, rewarding, and
                  community-driven.”
                  <span className="cs2-quote-shine" aria-hidden="true">
                    “A system where learning is flexible, rewarding, and
                    community-driven.”
                  </span>
                </p>
              </div>
              <p className="cs2-note">My North Start was</p>
            </div>

            <div className="cs2-diagram-block">
              <div className="cs2-diagram">
                <ul className="cs2-pills">
                  {featurePills.map((label, index) => (
                    <li
                      className={index === 1 ? 'cs2-pill cs2-pill-dup' : 'cs2-pill'}
                      key={`${label}-${index}`}
                    >
                      {label}
                    </li>
                  ))}
                </ul>
                <svg
                  className="cs2-flow"
                  viewBox="0 0 486 100"
                  width="471"
                  height="97"
                  aria-hidden="true"
                >
                  <path
                    d="M243 100C243 31 .5 53.5.5 0M243 100c0-69 242.5-46.5 242.5-100"
                    stroke="#000"
                    strokeWidth="1"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    className="cs2-flow-dash"
                    d="M243 100C243 31 .5 53.5.5 0M243 100c0-69 242.5-46.5 242.5-100"
                    stroke="#0099ff"
                    strokeWidth="1"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                    pathLength="100"
                    strokeDasharray="20 100"
                  />
                </svg>
                <p className="cs2-pill cs2-pill-features">Features</p>
              </div>
              <p className="cs2-note">
                From there, I outlined the key features:
              </p>
            </div>
          </div>
        </section>

        <section className="cs2-build" aria-labelledby="build-title">
          <div className="cs2-split cs2-build-top">
            <h2 id="build-title">From Designer to Developer</h2>
            <div className="cs2-build-copy">
              <div className="cs2-build-text">
                <p>
                  Now came the scary part I had the designs, but no engineering
                  team. So, I decided to build it myself.
                </p>
                <p>
                  I started learning <strong>HTML, CSS, and React</strong>, set
                  up <strong>Visual Studio Code</strong>, and began coding the
                  front end. For logic and debugging, I used{' '}
                  <strong>Claude</strong> as my coding partner, and{' '}
                  <strong>ChatGPT</strong> to help me think through product
                  flows and user logic. I basically turned into the architect
                  orchestrating both design and engineering using AI as my
                  toolkit.
                </p>
              </div>
              <StackGrid />
              <p className="cs2-note cs2-build-caption">A new stack was born!</p>
            </div>
          </div>
          <div className="cs2-build-shot">
            <div className="cs2-shot-frame">
              <img
                className="cs2-shot"
                src="/case-study-2/stack-ui.png"
                width={1920}
                height={963}
                alt="MasterClass screen with an empty continue-learning state and a browse-courses button."
                loading="lazy"
                decoding="async"
              />
              <ProductMock />
            </div>
            <p className="cs2-note cs2-build-kiss">
              There were nights where nothing rendered, CSS broke, or a React
              component refused to behave. But I kept iterating until things
              clicked. That first moment when the UI actually loaded? Chef’s
              kiss.
            </p>
          </div>
        </section>

        <section className="cs2-system" aria-labelledby="system-title" ref={systemRef}>
          <div className="cs2-split cs2-system-top">
            <h2 id="system-title">Designing the System</h2>
            <div className="cs2-system-copy">
              <p>
                While coding, I made sure the design still guided every
                decision. Each feature existed for a reason tied to a real
                student problem.
              </p>
              <p>
                I started learning <strong>HTML, CSS, and React</strong>, set
                up <strong>Visual Studio Code</strong>, and began coding the
                front end. For logic and debugging, I used{' '}
                <strong>Claude</strong> as my coding partner, and{' '}
                <strong>ChatGPT</strong> to help me think through product flows
                and user logic. I basically turned into the architect
                orchestrating both design and engineering using AI as my
                toolkit.
              </p>
            </div>
          </div>

          <article className="cs2-feature">
            <div className="cs2-feature-visual">
              <div className="cs2-stage">
                <div className="cs2-dash-frame cs2-board-image">
                  <img
                    src="/case-study-2/leaderboard.webp"
                    alt="MasterClass leaderboard: Gold league, top 20 advance to the next league, 7 days left, with Abhishek Kashid, Aniket Kale and Aditi Sinha at 2,422 XP each."
                    width={620}
                    height={700}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <p className="cs2-feature-cap cs2-feature-cap-board">Leaderboard</p>
            </div>
            <MetaRow items={features[0]} cards />
          </article>

          <article className="cs2-feature">
            <div className="cs2-feature-visual">
              <div className="cs2-frames-pair">
                <div className="cs2-stage">
                  <div className="cs2-streak">
                    <p>Streak</p>
                    <p className="cs2-streak-num">0</p>
                    <p>Solve 3 problems to start a streak</p>
                    <p className="cs2-streak-days">
                      <span>S</span>
                      <span>S</span>
                      <span>S</span>
                      <span>S</span>
                      <span>S</span>
                    </p>
                  </div>
                </div>
                <div className="cs2-stage">
                  <div className="cs2-reward-frame">
                    <img
                      className="cs2-reward-image"
                      src="/case-study-2/ux-audit-reward.webp"
                      alt="UX Audit Doc reward: you got UX Audit Doc worth Rps 499 for free, with a Claim button."
                      width={694}
                      height={750}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
              <p className="cs2-feature-cap">
                Streak Calculator & Reward Mechnaism
              </p>
            </div>
            <MetaRow items={features[1]} cards />
          </article>

          <article className="cs2-feature">
            <div className="cs2-feature-visual">
              <div className="cs2-stage">
                <CoursesDashboard />
              </div>
              <p className="cs2-feature-cap">Recorded Sessions</p>
            </div>
            <MetaRow items={features[2]} />
          </article>

          <article className="cs2-feature">
            <div className="cs2-feature-visual">
              <div className="cs2-stage">
                <ShowcaseDashboard />
              </div>
              <p className="cs2-feature-cap">
                Showcase Tab to show the work of every students something
                similar to a hall of fame
              </p>
            </div>
            <MetaRow items={features[3]} />
          </article>
        </section>

        <section className="cs2-strategy" aria-labelledby="strategy-title">
          <div className="cs2-split">
            <h2 id="strategy-title">Building Strategy Behind It</h2>
            <div className="cs2-strategy-copy">
              <p>
                Even though I was solo, I treated it like a proper product
                launch.
              </p>
              <div className="cs2-strategy-pairs">
                <div className="cs2-strategy-pair">
                  <p className="cs2-strategy-label">Product Vision</p>
                  <p>Make learning engaging and flexible.</p>
                </div>
                <div className="cs2-strategy-pair">
                  <p className="cs2-strategy-label">Product Strategy:</p>
                  <p>
                    Start small, build fast, integrate AI and gamification
                    early.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="cs2-build-shot">
            <div className="cs2-shot-frame cs2-strategy-frame">
              <StackGrid />
            </div>
            <p className="cs2-note cs2-strategy-road">
              Roadmap: Figma Design → Front-End Build (React, CSS, HTML) →
              Backend Integration (next) → Beta Launch with PAUX students.
            </p>
          </div>
        </section>

        <section className="cs2-learned" aria-labelledby="learned-title">
          <div className="cs2-split">
            <h2 id="learned-title">What I Learned (and Loved)</h2>
            <div className="cs2-learned-copy">
              <p>
                Even though I was solo, I treated it like a proper product
                launch.
              </p>
              <div className="cs2-learned-pairs">
                <div className="cs2-learned-pair">
                  <p className="cs2-learned-label">
                    Resourcefulness beats resources.
                  </p>
                  <p>
                    You don’t need a dev team to start just curiosity and grit.
                  </p>
                </div>
                <div className="cs2-learned-pair">
                  <p className="cs2-learned-label">AI can be a teammate.</p>
                  <p>
                    Claude helped me code faster, while ChatGPT helped me think
                    better.
                  </p>
                </div>
                <div className="cs2-learned-pair">
                  <p className="cs2-learned-label">
                    Design and engineering feed each other.
                  </p>
                  <p>Building it myself made me a better designer.</p>
                </div>
                <div className="cs2-learned-pair">
                  <p className="cs2-learned-label">Ownership builds clarity.</p>
                  <p>
                    Every problem I solved made me understand the product’s
                    core even better.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cs2-request" aria-labelledby="request-title">
          <div className="cs2-request-copy">
            <div className="cs2-request-text">
              <h2 id="request-title">Request a Case Study</h2>
              <p>
                Want to learn more about this project?
                <br />
                Get in touch to request a case study.
              </p>
            </div>
            <button className="cs2-touch" type="button">
              Get in Touch
            </button>
          </div>
          <article className="cs2-next" aria-labelledby="next-title">
            <p className="cs2-next-kicker">Next Project</p>
            <div className="cs2-next-card">
              <div className="cs2-next-frame">
                <img
                  className="cs2-next-photo"
                  src="/case-study-2/next-design-os.webp"
                  alt="Designer OS mark on a dark purple field with a glowing arc."
                  width={2400}
                  height={1260}
                />
                <p className="cs2-next-chip">
                  <span className="cs2-next-dot" aria-hidden="true" />
                  Product Design
                </p>
              </div>
              <div className="cs2-next-titles">
                <h3 id="next-title">
                  <span className="cs2-only-desk">Design OS</span>
                  <span className="cs2-only-small">Gen Alpha Accelerator</span>
                </h3>
                <p>
                  <span className="cs2-only-desk">
                    A complete redesign of my side-hustle website with a new IA,
                    strategy, and products, giving it a futuristic look using
                    Framer.
                  </span>
                  <span className="cs2-only-small">
                    AI - Enabled Learning Management System
                  </span>
                </p>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
