import type { ProjectId } from './useProjectDrawer.ts'

export type PortfolioNavDestination =
  | { kind: 'section'; sectionId: string }
  | { kind: 'project'; projectId: ProjectId }

export type PortfolioNavItem = {
  id: string
  label: string
  /** Placeholder letter; the card's circle centres whatever goes here. */
  icon: string
  destination: PortfolioNavDestination
}

export const portfolioNavItems = [
  {
    id: 'about',
    label: 'About Me',
    icon: 'A',
    destination: { kind: 'section', sectionId: 'about' },
  },
  {
    id: 'designer-os',
    label: 'Designer OS',
    icon: 'A',
    destination: { kind: 'project', projectId: 'case-study-1' },
  },
  {
    id: 'gen-z-learning',
    label: 'Gen-Z Learning Platform',
    icon: 'A',
    destination: { kind: 'project', projectId: 'case-study-2' },
  },
  {
    id: 'enterprise-qa',
    label: 'Enterprise QA Platform',
    icon: 'A',
    destination: { kind: 'project', projectId: 'case-study-3' },
  },
] as const satisfies readonly PortfolioNavItem[]
