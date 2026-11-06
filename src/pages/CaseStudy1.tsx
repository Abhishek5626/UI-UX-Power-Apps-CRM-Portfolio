import { useEffect, useRef, useState } from 'react'
import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { CaseStudyFooter } from '../components/CaseStudyFooter.tsx'
import './case-study.css'
import './case-study-1.css'

const facts = [
  { label: 'PRODUCT', value: 'Website' },
  { label: 'TIMELINE', value: 'Q2 2023 - Q2 2024' },
  { label: 'MY ROLE', value: 'Sole Designer' },
]

const roles = ['Product Design', 'Website Design', 'Strategy & Execution']

const stats = [
  { label: 'ARR', value: '10,000,00 RPS' },
  { label: 'ARR', value: '10,000,00 RPS' },
  { label: 'STUDENTS ENROLLED', value: '100+' },
  { label: 'PLACEMENT RATE', value: '90%' },
]

const siteUrl = 'https://wonderful-button-387226.framer.app/'

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M 0.914 5.25 L 8.35 5.25 C 8.915 5.25 9.359 4.782 9.247 4.229 C 8.936 2.701 7.922 0 4.632 0 C 1.342 0 0.328 2.701 0.018 4.229 C -0.095 4.782 0.349 5.25 0.914 5.25 Z"
        transform="translate(4.868 14)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 0 0 C 2.079 0 2.93 2.148 3.274 3.696 C 3.459 4.532 2.783 5.25 1.927 5.25 L 1 5.25"
        transform="translate(15.75 14)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 0 2.75 C 0 1.231 1.231 0 2.75 0 C 4.269 0 5.5 1.231 5.5 2.75 C 5.5 4.269 4.269 5.5 2.75 5.5 C 1.231 5.5 0 4.269 0 2.75 Z"
        transform="translate(6.75 4.75)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 0 5.5 C 1.519 5.5 2.5 4.269 2.5 2.75 C 2.5 1.231 1.519 0 0 0"
        transform="translate(14.75 4.75)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WinIcons() {
  return (
    <span className="cs1-win" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M 20 1.41 L 14.71 6.7 L 18 10 L 10 10 L 10 2 L 13.29 5.29 L 18.59 0 Z M 1.41 20 L 6.7 14.71 L 10 18 L 10 10 L 2 10 L 5.29 13.29 L 0 18.59 Z"
          fill="currentColor"
        />
      </svg>
      <svg viewBox="0 0 14 14">
        <path
          d="M 14 1.41 L 12.59 0 L 7 5.59 L 1.41 0 L 0 1.41 L 5.59 7 L 0 12.59 L 1.41 14 L 7 8.41 L 12.59 14 L 14 12.59 L 8.41 7 Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

function Stars() {
  return (
    <p className="cs1-stars" aria-label="5 stars">
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M 9.53.3 C 9.62.11 9.8 0 10 0 s .39.11.48.3 L 12.79 4.97 c .31.63.9 1.06 1.59 1.16 l 5.17.76 c .2.03.36.17.43.36 s .01.4-.13.54 l-3.74 3.64 c-.5.49-.73 1.19-.61 1.88 l.88 5.14 c .04.2-.05.4-.21.52 s-.38.13-.56.04 L 11 16.58 c-.62-.32-1.36-.32-1.97 0 L 4.4 19.01 c-.18.1-.4.08-.56-.04 s-.21-.32-.17-.52 l.88-5.14 c.12-.69-.11-1.39-.61-1.88 L.16 7.79 C-.02 7.65-.07 7.44.03 7.25 s.23-.33.45-.36 l 5.17-.76 c.69-.1 1.28-.53 1.59-1.16 Z"
          />
        </svg>
      ))}
    </p>
  )
}

const shades = [
  { src: '/case-study-1/blur-chat.webp', className: 'is-chat-l' },
  { src: '/case-study-1/blur-chat.webp', className: 'is-chat-r' },
  { src: '/case-study-1/blur-mid.png', className: 'is-mid-l' },
  { src: '/case-study-1/blur-mid.png', className: 'is-mid-r' },
  { src: '/case-study-1/blur-note.webp', className: 'is-note-l' },
  { src: '/case-study-1/blur-note.webp', className: 'is-note-r' },
]

function WhyStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !('IntersectionObserver' in window)) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return

    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin: '80px' },
    )
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={stageRef}
      className={paused ? 'cs1-why-stage is-paused' : 'cs1-why-stage'}
    >
      {shades.map((shade) => (
        <img
          key={shade.className}
          className={`cs1-shade ${shade.className}`}
          src={shade.src}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="lazy"
        />
      ))}
      {['a', 'b', 'c', 'd', 'e'].map((spot) => (
        <span key={spot} className={`cs1-float is-${spot}`} aria-hidden="true">
          🥲😔
        </span>
      ))}

      <article className="cs1-chat">
        <header>
          <img src="/case-study-1/avatar-shreyasi.webp" alt="" />
          <p>Shreyasi</p>
          <WinIcons />
        </header>
        <div className="cs1-msg">
          <img src="/case-study-1/avatar-shreyasi.webp" alt="" />
          <div>
            <p className="cs1-who">
              Shreyasi <time>10:31 PM</time>
            </p>
            <blockquote>
              <p>My experience with that bootcamp was very average</p>
              <p>the classes felt like recorded session</p>
            </blockquote>
          </div>
        </div>
        <div className="cs1-msg">
          <img src="/case-study-1/avatar-abhishek.webp" alt="" />
          <div>
            <p className="cs1-who">
              Abhishek <time>10:31 PM</time>
            </p>
            <blockquote>
              <p>My experience with that bootcamp was very average</p>
              <p>the classes felt like recorded session</p>
            </blockquote>
          </div>
        </div>
      </article>

      <article className="cs1-post">
        <header>
          <img src="/case-study-1/insight.webp" alt="" />
          <p>Livia find this insightful</p>
          <WinIcons />
        </header>
        <div className="cs1-person">
          <img src="/case-study-1/avatar-aniket.webp" alt="" />
          <div>
            <p className="cs1-who">
              Aniket Kale <span>2nd</span>
            </p>
            <p className="cs1-headline">Making each pixel counts.</p>
            <p className="cs1-when">
              22h
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <ellipse cx="8" cy="8" rx="3" ry="6.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 8h12" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </p>
          </div>
          <p className="cs1-follow">
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <path d="M7 1v12M1 7h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Follow
          </p>
        </div>
        <p className="cs1-post-body">
          I got into a bootcamp due to their marketing but the actual
          experience of learning was so underdelivered
        </p>
        <p className="cs1-more">…more</p>
      </article>

      <article className="cs1-review">
        <Stars />
        <p className="cs1-reviewer">
          Rhutuja Palav <time>12/04/2024</time>
        </p>
        <p className="cs1-note">
          <span>This felt more like a youtube recroded sessions</span>
          <span>rather then bootcamp. I felt midway that I could</span>
          <span>have gotten better ROI from youtube.</span>
        </p>
      </article>
    </div>
  )
}

function GlowVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !('IntersectionObserver' in window)) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { rootMargin: '80px' },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      className="cs1-glow"
      src="/case-study-1/glow.webm"
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  )
}

const problemCards = [
  {
    tone: '#4d3c2c',
    faces: ['/case-study-1/insight.webp', '/case-study-1/memoji-shock.webp'],
  },
  { quote: 'I felt like I was paying for YouTube with a high price tag.' },
  {
    tone: '#2d4354',
    faces: ['/case-study-1/avatar-shreyasi.webp', '/case-study-1/avatar-abhishek.webp'],
  },
  { quote: 'The syllabus was outdated and felt obsolete.' },
  {
    tone: '#969696',
    soft: true,
    faces: ['/case-study-1/memoji-gray.webp', '/case-study-1/avatar-aniket.webp'],
  },
  { quote: 'The knowledge that was shared was very basic and entry level.' },
]

function ProblemCard({
  card,
}: {
  card: (typeof problemCards)[number]
}) {
  if ('quote' in card) {
    return (
      <li className="cs1-problem-card">
        <p>{card.quote}</p>
      </li>
    )
  }

  return (
    <li className={card.soft ? 'cs1-problem-card is-soft' : 'cs1-problem-card'}>
      {card.faces.map((src, index) => (
        <div
          key={src}
          className="cs1-face"
          style={index === 0 ? { background: card.tone } : undefined}
        >
          <img src={src} alt="" decoding="async" loading="lazy" />
        </div>
      ))}
    </li>
  )
}

function ProblemReel() {
  const reelRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const reel = reelRef.current
    if (!reel || !('IntersectionObserver' in window)) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return

    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin: '80px' },
    )
    observer.observe(reel)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="cs1-problem-body">
      <div
        ref={reelRef}
        className={paused ? 'cs1-reel is-paused' : 'cs1-reel'}
      >
        <div className="cs1-reel-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="cs1-reel-set" aria-hidden={copy === 1}>
              {problemCards.map((card) => (
                <ProblemCard
                  key={`${copy}-${'quote' in card ? card.quote : card.faces[0]}`}
                  card={card}
                />
              ))}
            </ul>
          ))}
        </div>
      </div>
      <p className="cs1-problem-note">
        The first two became the foundation of the original program. The third
        one is what pushed me to expand into technical modules like Framer,
        HTML, CSS, and React in the redesign.
      </p>
    </div>
  )
}

const ownerPanels = [
  { src: '/case-study-1/owner-community.webp', alt: 'Exclusive community.' },
  { src: '/case-study-1/owner-modules.webp', alt: '48+ comprehensive modules.' },
  { src: '/case-study-1/owner-certified.webp', alt: 'Get certified: build the skills you need to deep dive practical courses.' },
  { src: '/case-study-1/owner-lessons.webp', alt: '12+ hands on lessons, learn by designing.' },
]

const phoneProgramCards = [
  { src: '/case-study-1/phone-live.webp', width: 716, height: 1388, alt: 'Live Figma classes: presenter video grid above Figma mobile app screens.' },
  { src: '/case-study-1/phone-feedback.webp', width: 716, height: 714, alt: 'Personal Feedback: receive weekly feedback on your bootcamp progress in Figma.' },
  { src: '/case-study-1/phone-cohort.webp', width: 716, height: 714, alt: 'Cohort Based Learning: stay motivated in cohort of like-minded designer around the world.' },
  { src: '/case-study-1/phone-mentor.webp', width: 716, height: 714, alt: 'Career Mentorship: gain career mentorship from Abhishek and the community of 50+ students.' },
  { src: '/case-study-1/phone-expert.webp', width: 716, height: 762, alt: 'Industry Expert Educator: learn live from Industry Expert Designer working in KPMG.' },
]

const phonePricing = [
  { src: '/case-study-1/phone-price-course.webp', alt: 'Gen Alpha Academy Full Course, ₹13,500 one time payment: PAUx Academy full course, community access, certification and 5 personal sessions with the mentor.' },
  { src: '/case-study-1/phone-price-mentorship.webp', alt: 'Full Course + Personal Mentorship, ₹60,000 one time payment: PAUx Academy full course, community access, certification and 5 personal sessions with the mentor.' },
]

const journeyIssues = [
  {
    title: 'Low awareness of what good UX education looks like',
    body: 'Most students believed paying for a course meant they would be job ready. The reality hit after rejections. Portfolios and case studies were often surface level and did not match employer expectations.',
  },
  {
    title: 'Scattered, low quality learning resources',
    body: 'Students were bouncing between YouTube clips, MOOCs, and expensive bootcamps. There was lots of content but no structure, no feedback loop, and no clear progression to build real skills.',
  },
  {
    title: 'Low awareness of what good UX education looks like',
    body: 'Most students believed paying for a course meant they would be job ready. The reality hit after rejections. Portfolios and case studies were often surface level and did not match employer expectations.',
  },
]

const journeyStages = [
  'Awareness',
  'Consideration',
  'Enroll & Learn',
  'Practice & Apply',
  'Placement Ready',
]

const journeyRows = [
  [
    'Sees ads or posts about design courses',
    'Browses multiple courses (bootcamps, MOOCs, YouTube)',
    'Joins a course expecting structured learning',
    'Works on projects or assignments',
    'Builds a case study or portfolio',
  ],
  [
    'Reads student success stories online',
    'Compares costs, benefits, reviews',
    'Watches pre-recorded videos or attends generic lectures',
    'Unsure if the work is good enough',
    'Applies for jobs but feels underprepared',
  ],
  [
    'Considers investing in a course',
    'Tries to guess which one will actually help',
    'Struggles to keep up without guidance',
    'Has no direct feedback from mentors',
    'Confidence drops after rejections',
  ],
]

const journeyPains = [
  {
    title: 'Analysis paralysis',
    lines: [
      'Confused by too many options',
      'Unsure which courses are actually worth the cost',
    ],
  },
  {
    title: 'Should I Enroll?.?',
    lines: [
      'Distrust from seeing many overpriced courses with weak outcomes',
      'Fear of wasting money',
    ],
  },
  {
    title: 'Creeks started…',
    lines: [
      'Feels isolated without real feedback',
      'Lectures are generic and not tailored to individual struggles',
    ],
  },
  {
    title: 'Outcasted..',
    lines: [
      'Struggles to know what “good” design looks like',
      'No community to ask for advice or support',
    ],
  },
  {
    title: 'Placement Readiness',
    lines: [
      'Case studies feel weak compared to job expectations',
      'Lacks technical edge (coding, Framer, React)',
    ],
  },
]

function MapChevron({ direction }: { direction: 'up' | 'down' | 'right' }) {
  const path =
    direction === 'down'
      ? 'M4 6 L8 11 L12 6'
      : direction === 'up'
        ? 'M4 11 L8 6 L12 11'
        : 'M6 4 L11 8 L6 12'
  return (
    <svg className={`cs1-chev is-${direction}`} viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const moduleFilters = [
  'All',
  'UX Research',
  'Case Study',
  'AI',
  'Design System',
  'UI',
  'UX',
] as const

type ModuleFilter = (typeof moduleFilters)[number]

type CourseModule = {
  id: string
  number: string
  title: string
  category: Exclude<ModuleFilter, 'All'>
  image: string
  imageWidth: number
  imageHeight: number
  alt: string
}

const courseModules: CourseModule[] = [
  {
    id: 'case-study-1',
    number: '1',
    title: 'Case Study 1 – With Guidance',
    category: 'Case Study',
    image: '/case-study-1/hub-card-case-study.webp',
    imageWidth: 536,
    imageHeight: 213,
    alt: 'Collaborative case study document with Abhishek and Shreyasii cursors.',
  },
  {
    id: 'chatgpt',
    number: '1',
    title: 'AI Research with ChatGPT',
    category: 'AI',
    image: '/case-study-1/hub-card-chatgpt.png',
    imageWidth: 536,
    imageHeight: 213,
    alt: 'ChatGPT prompt card asking for a four-week UX research plan.',
  },
  {
    id: 'interviews',
    number: '1',
    title: 'Stakeholder Interviews',
    category: 'UX Research',
    image: '/case-study-1/hub-card-interviews.webp',
    imageWidth: 536,
    imageHeight: 213,
    alt: 'Video call window with stakeholder avatars for an interview session.',
  },
  {
    id: 'foundation',
    number: '1',
    title: 'UX Foundation',
    category: 'UX',
    image: '/case-study-1/hub-card-foundation.webp',
    imageWidth: 512,
    imageHeight: 203,
    alt: 'Purple chips labeled Core Product Statement and User Personas.',
  },
  {
    id: 'design-system',
    number: '1',
    title: 'Building an MVP Design System',
    category: 'Design System',
    image: '/case-study-1/hub-card-design-system.jpg',
    imageWidth: 512,
    imageHeight: 203,
    alt: 'Design system canvas with tooltip, status, and pagination components.',
  },
  {
    id: 'buttons',
    number: '1',
    title: 'Button Components & Interaction States',
    category: 'UI',
    image: '/case-study-1/hub-card-buttons.webp',
    imageWidth: 512,
    imageHeight: 203,
    alt: 'Primary, outlined, and text Button CTA variants on a dark field.',
  },
]

const modulesPageSize = 6

function CourseModulesBoard() {
  const [filter, setFilter] = useState<ModuleFilter>('All')
  const [visibleCount, setVisibleCount] = useState(modulesPageSize)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered =
    filter === 'All'
      ? courseModules
      : courseModules.filter((module) => module.category === filter)
  const visible = filtered.slice(0, visibleCount)
  const canLoadMore = visibleCount < filtered.length

  useEffect(() => {
    setVisibleCount(modulesPageSize)
    setExpandedId(null)
  }, [filter])

  return (
    <div className="cs1-modules" aria-label="Course modules">
      <div
        className="cs1-modules-filters"
        role="tablist"
        aria-label="Module categories"
      >
        {moduleFilters.map((item) => {
          const selected = filter === item
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={selected}
              className={
                selected
                  ? 'cs1-modules-filter is-active'
                  : 'cs1-modules-filter'
              }
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          )
        })}
      </div>

      <ul className="cs1-modules-grid">
        {visible.map((module) => {
          const expanded = expandedId === module.id
          return (
            <li key={module.id} className="cs1-modules-card">
              <div className="cs1-modules-media">
                <img
                  src={module.image}
                  alt={module.alt}
                  width={module.imageWidth}
                  height={module.imageHeight}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="cs1-modules-meta">
                <div className="cs1-modules-copy">
                  <p className="cs1-modules-number">{module.number}</p>
                  <h3 className="cs1-modules-title">{module.title}</h3>
                  {expanded ? (
                    <p className="cs1-modules-category">{module.category}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={
                    expanded
                      ? 'cs1-modules-chevron is-open'
                      : 'cs1-modules-chevron'
                  }
                  aria-expanded={expanded}
                  aria-label={
                    expanded
                      ? `Hide category for ${module.title}`
                      : `Show category for ${module.title}`
                  }
                  onClick={() =>
                    setExpandedId(expanded ? null : module.id)
                  }
                >
                  <span aria-hidden="true" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="cs1-modules-empty">No modules in this category yet.</p>
      ) : null}

      <button
        type="button"
        className="cs1-modules-more"
        disabled={!canLoadMore}
        aria-disabled={!canLoadMore}
        onClick={() => {
          if (!canLoadMore) return
          setVisibleCount((count) => count + modulesPageSize)
        }}
      >
        Load More
      </button>
    </div>
  )
}

function ProgramFeatures() {
  return (
    <section className="cs1-program" aria-label="Program features">
      <div className="cs1-feature-stage">
        {phoneProgramCards.map((card) => (
          <img
            key={card.src}
            className="cs1-phone-only cs1-phone-card"
            src={card.src}
            alt={card.alt}
            width={card.width}
            height={card.height}
            loading="lazy"
            decoding="async"
          />
        ))}
        <figure className="cs1-feature-card cs1-desktop-only">
          <img
            src="/case-study-1/feature-live-figma-classes.webp"
            alt="Live Figma Classes: presenter mosaic beside a collaborative Figma workspace with Anshika and Aniket cursors, with title and description below."
            width={1052}
            height={564}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure className="cs1-feature-card cs1-desktop-only">
          <img
            src="/case-study-1/feature-feedback.webp"
            alt="Personal Feedback card with Aniket and Abhishek Figma comments, beside Industry Expert Educator card featuring the KPMG mark."
            width={1024}
            height={364}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure className="cs1-feature-card cs1-desktop-only">
          <img
            src="/case-study-1/feature-cohort.webp"
            alt="Cohort Based Learning live-class grid and Career Mentorship calendar for Career Guidance from 4 to 6pm."
            width={1024}
            height={368}
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>

      <div className="cs1-program-phase">
        <p className="cs1-program-phase-title">Product RoadMap</p>
        <div className="cs1-program-phase-copy">
          <p className="cs1-program-phase-label">PHASE 1</p>
          <p>Launch live UI/UX program with mentorship and community.</p>
        </div>
      </div>

      <div className="cs1-feature-stage">
        <figure className="cs1-feature-panel">
          <picture>
            <source
              media="(max-width: 900px)"
              srcSet="/case-study-1/phone-coding.webp"
              width={668}
              height={776}
            />
            <img
              src="/case-study-1/feature-coding-strip.jpg"
              alt="HTML, CSS, and React logos on a dark purple coding strip."
              width={1024}
              height={193}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption className="cs1-feature-caption">
            <h3>Core Coding Sessions</h3>
            <p>
              Keep it consistent. Build flexible, scalable design systems that
              make every project smoother and easier to manage.
            </p>
          </figcaption>
        </figure>
      </div>

      <div className="cs1-program-phase is-flip">
        <p className="cs1-program-phase-label">PHASE 2</p>
        <p>
          Redesign website and introduce coding modules (Framer, HTML, CSS,
          React).
        </p>
      </div>

      <div className="cs1-feature-stage">
        <figure className="cs1-feature-panel">
          <picture>
            <source
              media="(max-width: 900px)"
              srcSet="/case-study-1/phone-hub.webp"
              width={668}
              height={280}
            />
            <img
              src="/case-study-1/feature-hub.webp"
              alt="Personal learning hub MasterClass dashboard with sidebar navigation, search, and Continue Learning empty state."
              width={968}
              height={356}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption className="cs1-feature-caption">
            <h3>Your Personal Learning Hub</h3>
            <p>
              Learn the exact Figma workflow I use to build clean, scalable
              UI—smart text styles, auto layout, and color systems that just
              make sense. Curated with real design scenarios in mind.
            </p>
          </figcaption>
        </figure>
      </div>

      <div className="cs1-program-phase is-flip">
        <p className="cs1-program-phase-label">PHASE 3</p>
        <p>Expand into LMS for structured learning and scale placements.</p>
      </div>
    </section>
  )
}

function RequestCaseStudy() {
  return (
    <section className="cs1-request" aria-labelledby="request-title">
      <div className="cs1-request-copy">
        <div className="cs1-request-text">
          <h2 id="request-title">Request a Case Study</h2>
          <p>
            Want to learn more about this project? Get in touch to request a
            case study.
          </p>
        </div>
        <button className="cs1-touch" type="button">
          Get in Touch
        </button>
      </div>

      <article className="cs1-next" aria-labelledby="next-title">
        <p className="cs1-next-kicker">Next Project</p>
        <div className="cs1-next-card">
          <div className="cs1-next-frame">
            <img
              className="cs1-next-photo"
              src="/case-study-1/next-project.webp"
              alt="Gen Alpha Accelerator preview with a glowing mark on a dark purple field."
              width={1116}
              height={585}
              loading="lazy"
              decoding="async"
            />
            <p className="cs1-next-chip">
              <span className="cs1-next-dot" aria-hidden="true" />
              Product Design
            </p>
          </div>
          <div className="cs1-next-titles">
            <h3 id="next-title">Gen Alpha Accelerator</h3>
            <p>AI - Enabled Learning Management System</p>
          </div>
        </div>
      </article>
    </section>
  )
}

function ResultsNextSteps() {
  return (
    <section className="cs1-results" aria-labelledby="results-title">
      <div className="cs1-results-head">
        <h2 id="results-title">Results and Next Steps</h2>
        <div className="cs1-results-body">
          <p>Within 1 year of establishing the Academy</p>

          <div className="cs1-results-metric">
            <p className="cs1-results-value">50+</p>
            <p className="cs1-results-label">Students trained so far.</p>
          </div>

          <div className="cs1-results-metric">
            <p className="cs1-results-value">90%</p>
            <p className="cs1-results-label">Placement success rate.</p>
          </div>

          <div className="cs1-results-metric">
            <p className="cs1-results-value">HTML, CSS, React</p>
            <p className="cs1-results-label">
              New redesign introduces coding modules to give students an extra
              edge.
            </p>
          </div>

          <p>
            Next step is to roll out an LMS while keeping the live mentorship
            and community at the core.
          </p>
        </div>
      </div>
    </section>
  )
}

type ProofTile =
  | { kind: 'quote' }
  | { kind: 'memoji'; tone: 'grey' | 'white' }
  | { kind: 'stat'; value: string; label: string }
  | { kind: 'note'; title: string; body: string }

const greyMemoji: ProofTile = { kind: 'memoji', tone: 'grey' }
const whiteMemoji: ProofTile = { kind: 'memoji', tone: 'white' }

/** Only the first tile is a person's words; the rest is copy from this page. */
const proofColumns: ProofTile[][] = [
  [
    { kind: 'quote' },
    greyMemoji,
    { kind: 'stat', value: '90%', label: 'Placement success rate.' },
    whiteMemoji,
  ],
  [
    whiteMemoji,
    { kind: 'stat', value: '50+', label: 'Students trained so far.' },
    greyMemoji,
    {
      kind: 'note',
      title: 'Personal Feedback',
      body: 'Receive weekly feedback on your bootcamp progress in Figma.',
    },
  ],
  [
    {
      kind: 'note',
      title: 'Career Mentorship',
      body: 'Gain career mentorship from Abhishek and the community of 50+ students.',
    },
    whiteMemoji,
    {
      kind: 'note',
      title: 'Cohort Based Learning',
      body: 'Stay motivated in cohort of like-minded designer around the world.',
    },
    greyMemoji,
  ],
]

function ProofTileContent({ tile }: { tile: ProofTile }) {
  if (tile.kind === 'memoji') {
    return (
      <img
        src={`/case-study-1/proof-memoji-${tile.tone}.png`}
        alt=""
        width={146}
        height={176}
        loading="lazy"
        decoding="async"
      />
    )
  }
  if (tile.kind === 'quote') {
    return (
      <>
        <span className="cs1-proof-person">
          <img
            src="/case-study-1/proof-kirti-avatar.png"
            alt=""
            width={56}
            height={56}
            loading="lazy"
            decoding="async"
          />
          <span>
            <span className="cs1-proof-name">Kirti Bisht</span>
            <span className="cs1-proof-handle">@TCS</span>
          </span>
        </span>
        <span className="cs1-proof-body">
          Don’t take it from me: @reflectnotes is magic/
        </span>
      </>
    )
  }
  if (tile.kind === 'stat') {
    return (
      <>
        <span className="cs1-proof-value">{tile.value}</span>
        <span className="cs1-proof-body">{tile.label}</span>
      </>
    )
  }
  return (
    <>
      <span className="cs1-proof-name">{tile.title}</span>
      <span className="cs1-proof-body">{tile.body}</span>
    </>
  )
}

function ProofWall() {
  return (
    <div className="cs1-strategy-stage cs1-proof">
      {proofColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="cs1-proof-column">
          <div className="cs1-proof-track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="cs1-proof-set" aria-hidden={copy === 1}>
                {column.map((tile, tileIndex) => (
                  <li
                    key={tileIndex}
                    className={
                      tile.kind === 'memoji'
                        ? `cs1-proof-tile is-memoji is-${tile.tone}`
                        : 'cs1-proof-tile'
                    }
                  >
                    <ProofTileContent tile={tile} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StrategyFeatures() {
  return (
    <section className="cs1-strategy" aria-labelledby="strategy-title">
      <div className="cs1-strategy-head">
        <h2 id="strategy-title">From Strategy to Design Features</h2>
        <div className="cs1-strategy-intro">
          <p>
            Translating product goals into design features was one of those
            moments where the product and UX roles blended together:
          </p>
          <p className="cs1-strategy-eyebrow">Features</p>
          <p className="cs1-strategy-feature">Funnel Design</p>
          <p>
            Users move from awareness of their pain points to seeing proof to
            signing up without friction.
          </p>
        </div>
      </div>

      <figure className="cs1-strategy-stage cs1-pricing-stage">
        {phonePricing.map((plan) => (
          <img
            key={plan.src}
            className="cs1-phone-only cs1-phone-card"
            src={plan.src}
            alt={plan.alt}
            width={668}
            height={888}
            loading="lazy"
            decoding="async"
          />
        ))}
        <img
          className="cs1-desktop-only"
          src="/case-study-1/strategy-pricing-plans.webp"
          alt="Two pricing cards for Gen Alpha Academy Full Course, showing ₹13,500 and ₹62,500 one-time plans with enroll and feature lists."
          width={1078}
          height={622}
          loading="lazy"
          decoding="async"
        />
      </figure>

      <div className="cs1-strategy-split">
        <p>Course Modules Section</p>
        <p>
          Clear split between design fundamentals and new coding modules so
          students know exactly what they’re getting.
        </p>
      </div>

      <ProofWall />

      <div className="cs1-strategy-split">
        <p>Proof Section</p>
        <p>Success stories and placement stats up front to build trust.</p>
      </div>
    </section>
  )
}

function JourneyMap() {
  return (
    <div className="cs1-board-frame">
      <div className="cs1-board">
        <p className="cs1-board-caption">
          <span>Journey Mapping of these</span>
          <span>2 Persona</span>
        </p>
        <table className="cs1-map">
          <thead>
            <tr>
              <th scope="col">Blank</th>
              {journeyStages.map((stage) => (
                <th key={stage} scope="col">
                  {stage}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="rowgroup" rowSpan={3} className="cs1-who-col">
                <span>Key Steps</span>
                <span>
                  <img src="/case-study-1/persona-aspiring.png" alt="" />
                  Aspiring Designer
                </span>
                <span>
                  <img src="/case-study-1/persona-junior.png" alt="" />
                  Junior Designer
                </span>
              </th>
              {journeyRows[0].map((step, index) => (
                <td key={step}>
                  {step}
                  <MapChevron direction={index % 2 === 0 ? 'down' : 'up'} />
                  {(index === 0 || index === 3) && <MapChevron direction="right" />}
                </td>
              ))}
            </tr>
            <tr>
              {journeyRows[1].map((step, index) => (
                <td key={step}>
                  {step}
                  <MapChevron direction={index % 2 === 0 ? 'down' : 'up'} />
                </td>
              ))}
            </tr>
            <tr>
              {journeyRows[2].map((step, index) => (
                <td key={step}>
                  {step}
                  {(index === 0 || index === 2) && <MapChevron direction="right" />}
                </td>
              ))}
            </tr>
            <tr className="cs1-pain-row">
              <th scope="row">Painpoint</th>
              {journeyPains.map((pain) => (
                <td key={pain.title}>
                  <strong>{pain.title}</strong>
                  {pain.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CaseStudy1() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'PAUx Academy — Abhishek Kashid'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="case-study cs1">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="cs-column">
        <section className="cs1-cover" aria-labelledby="case-title">
          <div className="cs1-lead">
          <div className="cs1-head">
            <ShippedBadge>SHIPPED</ShippedBadge>
            <div className="cs1-title-row">
              <h1 id="case-title">PAUx Academy</h1>
              <p>
                I built a website that acts as the front door to my UX/UI
                learning program
              </p>
            </div>
          </div>

          <div className="cs1-frame">
            <div className="cs1-stage">
              <GlowVideo />
              <picture className="cs1-picture">
                <source
                  media="(max-width: 900px)"
                  srcSet="/case-study-1/cover-mobile.webp"
                  width={1038}
                  height={1224}
                />
                <img
                  src="/case-study-1/hero-ui.webp"
                  width={1024}
                  height={469}
                  alt="Designer OS homepage hero reading “Be an Gen Alpha Designer,” with live-class stats, Request a Callback and Download Curriculum actions, and a glowing purple portal."
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
          </div>

          <div className="cs1-intro">
            <div className="cs1-copy">
              <p>
                This wasn’t just a landing page project. The site had to
                explain what I teach, show how it’s different from every other
                design course, build trust, and guide visitors into becoming
                students.
              </p>
              <p>
                The end result is <a href={siteUrl}>this site</a>. But the
                process wasn’t just about visuals, it started way earlier, with
                research, strategy, and figuring out if this course even needed
                to exist.
              </p>
            </div>
            <div className="cs1-meta">
              <dl className="cs1-facts">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="cs1-chips">
                {roles.map((role) => (
                  <li key={role}>
                    <span className="cs1-dot" aria-hidden="true" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="cs1-stats">
            {stats.map((stat, index) => (
              <li key={`${stat.label}-${index}`}>
                <p className="cs1-stat-label">
                  <UsersIcon />
                  {stat.label}
                </p>
                <p className="cs1-stat-value">{stat.value}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="cs1-why" aria-labelledby="why-title">
          <div className="cs1-why-head">
            <h2 id="why-title">Why I started this?</h2>
            <div className="cs1-why-copy">
              <p>
                This whole thing started because of what I kept seeing on
                LinkedIn. Students were spending a lot of money on bootcamps
                and online programs, yet when they shared their portfolios,
                their work looked basic. Their case studies were weak, their
                design thinking wasn’t strong, and many of them still struggled
                to land jobs.
              </p>
              <p>
                It wasn’t their fault. They were trying. The problem was that
                the courses they joined were not teaching them properly. No
                real feedback, no sense of community, no placement guidance.
                Watching this over and over was frustrating, and it made me
                want to create a better way.
              </p>
              <p>
                That’s when I started my own program. At first it was only
                about UI and UX, but the new redesign now expands it to cover
                Framer, React, CSS, and HTML.
              </p>
            </div>
          </div>
          <WhyStage />
        </section>

        <section className="cs1-problem" aria-labelledby="problem-title">
          <div className="cs1-problem-head">
            <h2 id="problem-title">The Problem</h2>
            <div className="cs1-problem-copy">
              <p>
                Before creating anything, I interviewed aspiring designers and
                junior designers. I mapped their frustrations into simple
                journey maps and validated the findings in
              </p>
              <p>small workshops.</p>
            </div>
          </div>
          <ProblemReel />
        </section>

        <section className="cs1-journey" aria-labelledby="journey-title">
          <div className="cs1-journey-head">
            <h2 id="journey-title">Mapping the Student Journey</h2>
            <div className="cs1-journey-side">
              <p>
                I interviewed 42 plus aspiring and junior designers to better
                understand where current UX education is failing learners. What
                we heard repeatedly shaped the course and the redesign.
              </p>
              <div className="cs1-issues">
                <p className="cs1-kicker">Major issues</p>
                {journeyIssues.map((issue, index) => (
                  <div key={`${issue.title}-${index}`}>
                    <p className="cs1-issue-title">{issue.title}</p>
                    <p>{issue.body}</p>
                  </div>
                ))}
              </div>
              <div className="cs1-personas">
                <figure>
                  <img src="/case-study-1/persona-aspiring.png" alt="" />
                  <figcaption>Aspiring Designer</figcaption>
                </figure>
                <figure>
                  <img src="/case-study-1/persona-junior.png" alt="" />
                  <figcaption>Junior Designer</figcaption>
                </figure>
              </div>
            </div>
          </div>
          <JourneyMap />
        </section>

        <section className="cs1-owner" aria-labelledby="owner-title">
          <div className="cs1-owner-head">
            <h2 id="owner-title">
              Thinking Like a
              <br className="cs1-owner-break" /> Product Owner
            </h2>
            <p>
              At this point I stopped thinking like &quot;just a designer&quot; and
              started thinking like a product manager. If this was a product, what
              was its vision, strategy, and roadmap?
            </p>
          </div>

          <figure className="cs1-bento-still">
            <img
              className="cs1-bento-wide"
              src="/case-study-1/owner-bento.webp"
              alt="Product owner feature board showing 48+ comprehensive modules, exclusive community, get certified, and 12+ hands-on lessons."
              width={1024}
              height={452}
              loading="lazy"
              decoding="async"
            />
            <div className="cs1-bento-grid">
              {ownerPanels.map((panel) => (
                <img
                  key={panel.src}
                  src={panel.src}
                  alt={panel.alt}
                  width={660}
                  height={454}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </figure>

          <div className="cs1-owner-split cs1-owner-vision">
            <p>Product Vision</p>
            <p>
              A program that transforms motivated learners into job-ready
              designers with mentorship, community, and technical skills.
            </p>
          </div>
          <div className="cs1-strategy-stage cs1-modules-stage">
            <CourseModulesBoard />
          </div>
          <div className="cs1-owner-split cs1-owner-strategy">
            <p>Product Strategy</p>
            <p>
              Focus on student needs (mentorship, community, technical edge),
              study the market (bootcamps, MOOCs, YouTube), and stand out with
              live sessions, Discord support, and coding modules.
            </p>
          </div>

          <ProgramFeatures />
        </section>

        <StrategyFeatures />
        <ResultsNextSteps />
        <RequestCaseStudy />
      </main>
      <CaseStudyFooter className="cs-footer cs1-phone-footer" />
    </div>
  )
}
