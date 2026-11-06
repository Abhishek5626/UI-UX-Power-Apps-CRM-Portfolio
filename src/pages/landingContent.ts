import type { CardIconName } from '../components/CardIcon.tsx'
/** Crop box inside the 417×360 showcase surface, taken from the Figma image layer. */
export type ProjectImageFrame = {
  left: string
  top: string
  width: string
  height: string
}

/** Dark navy media vs light glass surface on the Project column cards. */
export type ProjectShowcaseTone = 'dark' | 'light'

export type LandingTool = {
  name: string
  /** Logo file. Omitted tools render as a text label. */
  logoSrc?: string
  /** Full-color artwork that should not be recolored in dark mode. */
  preserveColor?: boolean
}

export type LandingCardContent = {
  id: string
  label: string
  status?: 'Shipped'
  statement?: string
  /** One-line description under the title on a showcase card. */
  summary?: string
  href?: string
  mediaSlot?: string
  mediaHeight?: number
  surfacePadding: 10 | 14
  height?: number
  tools?: readonly LandingTool[]
  /** Set when the project image is ready. The slot keeps its size until then. */
  imageSrc?: string
  imageAlt?: string
  /** When set, the image fills the showcase surface instead of a separate slot. */
  imageFrame?: ProjectImageFrame
  /** Surface treatment for Project column cards. Defaults to dark when omitted. */
  showcaseTone?: ProjectShowcaseTone
  /** Optional corner radius applied to the absolute media image. */
  imageRadius?: string
  /** Looping muted video that fills the showcase surface, like a fill image. */
  videoSrc?: string
  /** Card icon from the Figma set; project cards fall back to the aperture. */
  icon?: CardIconName
  /** Animated text wall behind a statement card's text. */
  textWall?: boolean
  /** Animated AI tool graph behind a statement card's text. */
  aiGraph?: boolean
  /** Keywords that scroll along the bottom of a project card. */
  badges?: readonly string[]
}

export const heroContent = {
  headline: 'Design, Code & AI Workflows.',
  roleDesign: 'Design',
  roleEngineer: 'Engineer',
  themeLabel: 'Light Mode',
  summary:
    'A professional maker across design, code and automation. I take ideas from first Figma frame to production build, and wire up the workflows that keep them running.',
}

/**
 * Visible copy matches the Figma frame. Showcase crops are the image layers
 * inside each 417×360 surface (Project column, node 9:377).
 * Card 1 is a dark media surface; cards 2–3 use the light glass surface.
 * The tools list fills the Tools card (node 132:1780), in the frame's order.
 */
export const landingTools = [
  { name: 'Claude', logoSrc: '/landing/tools/claude.webp', preserveColor: true },
  { name: 'ChatGPT', logoSrc: '/landing/tools/chatgpt.webp', preserveColor: true },
  { name: 'Cursor', logoSrc: '/landing/tools/cursor.webp', preserveColor: true },
  { name: 'Figma', logoSrc: '/landing/tools/figma.webp', preserveColor: true },
  {
    name: 'Microsoft Dynamics 365',
    logoSrc: '/landing/tools/dynamics-365.webp',
    preserveColor: true,
  },
  { name: 'Obsidian', logoSrc: '/landing/tools/obsidian.webp', preserveColor: true },
  { name: 'RELEX', logoSrc: '/landing/tools/relex.webp', preserveColor: true },
  {
    name: 'Microsoft Power Apps',
    logoSrc: '/landing/tools/power-apps.webp',
    preserveColor: true,
  },
] as const satisfies readonly LandingTool[]

export const landingCards = {
  buildingInCode: {
    id: 'building-in-code',
    label: 'I',
    statement: 'Building in Code',
    icon: 'dots',
    surfacePadding: 14,
    textWall: true,
    height: 297,
  },
  designingAiProduct: {
    id: 'designing-ai-product',
    label: 'Specialize',
    statement: 'Designing AI Product',
    icon: 'sparkle',
    surfacePadding: 14,
    aiGraph: true,
    height: 297,
  },
  toolsShipped: {
    id: 'tools-shipped',
    label: 'Tools',
    icon: 'pinwheel',
    surfacePadding: 14,
    tools: landingTools,
  },
  storytellingPlay: {
    id: 'storytelling-play',
    label: 'in',
    statement: 'Storytelling + Play',
    icon: 'flower',
    surfacePadding: 14,
    height: 176,
  },
  titleColumnTop: {
    id: 'designer-os',
    label: 'Designer OS',
    summary: 'Connecting anyone to emergency satellite',
    status: 'Shipped',
    href: '/case-study-1',
    badges: ['Stakeholder interviews', 'AI research', 'MVP design system', 'Placement-first', 'Community-led', 'Shipped website'],
    surfacePadding: 14,
    showcaseTone: 'dark',
    imageSrc: '/project-assets/designer-os.webp',
    imageAlt: 'Violet light ring glowing across a black horizon.',
    imageFrame: {
      left: '-57.7938%',
      top: '29.7222%',
      width: '215.3477%',
      height: '140.2778%',
    },
  },
  titleColumnMiddle: {
    id: 'gen-z-learning-platform',
    label: 'Gen-Z Learning Platform',
    summary: 'An LMS Dashboard developed from scratch.',
    status: 'Shipped',
    href: '/case-study-2',
    badges: ['Gamified', 'React', 'HTML & CSS', 'Replayable lessons', 'Designed and coded', 'Self-paced'],
    surfacePadding: 14,
    showcaseTone: 'light',
    imageSrc: '/project-assets/gen-z-learning-platform.webp',
    imageAlt:
      'Edge learning dashboard with Home, Bookmarks, Courses, and Continue Learning.',
    imageFrame: {
      left: '6.8345%',
      top: '26.9444%',
      width: '113.9089%',
      height: '87.5%',
    },
    imageRadius: '22px 0 0 0',
  },
  titleColumnBottom: {
    id: 'enterprise-qa-platform',
    label: 'Enterprise QA Platform',
    summary: 'Digitalizing QA Process for a trillion-dollar company',
    status: 'Shipped',
    href: '/case-study-3',
    badges: ['Paperless', 'Workshops', '20+ interviews', 'Journey maps', 'Audit-ready', '86% fewer errors'],
    surfacePadding: 14,
    showcaseTone: 'light',
    imageSrc: '/project-assets/enterprise-qa-platform.webp',
    imageAlt: 'Dark enterprise dashboard with a sidebar and a grid of panels.',
    imageFrame: {
      left: '3.8374%',
      top: '26.9444%',
      width: '122.782%',
      height: '105.2778%',
    },
  },
  agenticAi: {
    id: 'agentic-ai',
    label: 'Agentic AI',
    summary: 'AI agents that take urgent B2B orders',
    videoSrc: '/project-assets/agentic-ai-explainer.mp4',
    href: '/case-study-4',
    badges: ['Orchestrated', 'Delegated', 'Gated', 'Augmented', 'Supervised', 'Synced'],
    surfacePadding: 14,
    showcaseTone: 'light',
  },
  quikAssistant: {
    id: 'quik-assistant',
    label: 'Quik assistant',
    summary: 'An AI assistant that plans, then runs on approval',
    href: '/case-study-5',
    videoSrc: '/project-assets/quik-assistant.mp4',
    badges: ['Intent-driven', 'Conversational', 'Three-panel', 'Agent-led', 'CLI in sync', 'Light & dark'],
    surfacePadding: 14,
    // Dark: the video is dark, so the title and summary need light text.
    showcaseTone: 'dark',
  },
  // Placeholder until the case study is written: no link yet.
  powerAppsCrm: {
    id: 'power-apps-crm',
    label: 'Power Apps + CRM Platform',
    summary: 'A desktop app. Case study coming soon.',
    surfacePadding: 14,
    showcaseTone: 'light',
  },
} as const satisfies Record<string, LandingCardContent>

/**
 * All Projects sheet (Figma 352-843): category tabs, then type chips. A project
 * can sit under more than one type. Keys point at landingCards.
 */
type ProjectCardKey = 'titleColumnTop' | 'titleColumnMiddle' | 'titleColumnBottom' | 'agenticAi' | 'quikAssistant' | 'powerAppsCrm'

export const allProjectsContent: {
  title: string
  action: string
  empty: string
  categories: readonly { label: string; filters: readonly { label: string; projects: readonly ProjectCardKey[] }[] }[]
} = {
  title: 'All Projects',
  action: 'View All',
  empty: 'Power Apps projects are on their way.',
  categories: [
    {
      label: 'Product Design / UI UX',
      filters: [
        { label: 'Website', projects: ['titleColumnTop'] },
        { label: 'E-Comm', projects: ['agenticAi'] },
        { label: 'SaaS', projects: ['titleColumnMiddle', 'titleColumnBottom'] },
        { label: 'AI', projects: ['agenticAi', 'quikAssistant'] },
      ],
    },
    { label: 'Power Apps', filters: [{ label: 'Desktop app', projects: ['powerAppsCrm'] }] },
  ],
}

export type AboutPlaceId = 'thailand' | 'vietnam' | 'azerbaijan'

export type AboutPlace = {
  id: AboutPlaceId
  name: string
}

/**
 * Middle-column About Me card (Figma node 2:270).
 * The portrait crop is the 418×237 image layer inside the 289×231 photo.
 * Place names are the accessible flag labels. They are not shown on the badges.
 */
export const aboutMeCard = {
  id: 'about-me-portrait',
  label: 'About Me',
  imageSrc: '/landing/about-me-portrait.webp',
  imageAlt:
    'Portrait on a city street, wearing sunglasses, earphones, and a dark coat.',
  imageFrame: {
    left: '-22.1453%',
    top: '0%',
    width: '144.6367%',
    height: '102.5974%',
  },
  places: [
    { id: 'thailand', name: 'Thailand' },
    { id: 'vietnam', name: 'Vietnam' },
    { id: 'azerbaijan', name: 'Azerbaijan' },
  ],
} as const satisfies {
  id: string
  label: string
  imageSrc: string
  imageAlt: string
  imageFrame: ProjectImageFrame
  places: readonly AboutPlace[]
}
