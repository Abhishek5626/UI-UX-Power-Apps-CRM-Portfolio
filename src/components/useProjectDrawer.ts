import { useCallback, useEffect, useRef, useState } from 'react'

export const projectOrder = [
  'case-study-1',
  'case-study-2',
  'case-study-3',
  'case-study-4',
  'case-study-5',
] as const

export type ProjectId = (typeof projectOrder)[number]

export const projectTitles: Record<ProjectId, string> = {
  'case-study-1': 'PAUx Academy',
  'case-study-2': 'Developing the PAUX LMS',
  'case-study-3': 'QA Platform For a Trillion Dollar Company',
  'case-study-4': 'Agentic AI',
  'case-study-5': 'Quik assistant',
}

type DrawerHistoryState = {
  projectDrawer: ProjectId | null
  pushedByDrawer?: boolean
  depth?: number
}

function isProjectId(value: string): value is ProjectId {
  return (projectOrder as readonly string[]).includes(value)
}

function landingPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const slug = path.replace(/^\//, '')
  return isProjectId(slug) ? '/' : path
}

function cleanUrl() {
  return `${landingPath()}${window.location.search}`
}

function hashUrl(id: ProjectId) {
  return `${cleanUrl()}#/${id}`
}

export function projectFromHash(hash: string): ProjectId | null {
  const slug = hash.replace(/^#/, '').replace(/^\//, '')
  return isProjectId(slug) ? slug : null
}

export function projectFromLocation(): ProjectId | null {
  const fromHash = projectFromHash(window.location.hash)
  if (fromHash) return fromHash
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
  return isProjectId(path) ? path : null
}

function historyState(): DrawerHistoryState | null {
  const state = window.history.state as DrawerHistoryState | null
  return state && typeof state === 'object' ? state : null
}

/**
 * The open project lives in the URL hash. Opening pushes one history entry on
 * top of the landing page. Moving between projects replaces that entry, so
 * Back and Close both return to the landing page. Forward restores the project
 * that was open.
 */
export function useProjectDrawer() {
  const [projectId, setProjectId] = useState<ProjectId | null>(projectFromLocation)
  const closingRef = useRef(false)

  useEffect(() => {
    const sync = () => {
      closingRef.current = false
      setProjectId(projectFromLocation())
    }

    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)

    const initial = projectFromLocation()
    if (initial && !historyState()?.pushedByDrawer) {
      window.history.replaceState({ projectDrawer: null }, '', cleanUrl())
      window.history.pushState(
        { projectDrawer: initial, pushedByDrawer: true, depth: 1 },
        '',
        hashUrl(initial),
      )
      setProjectId(initial)
    }

    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const open = useCallback((id: ProjectId) => {
    const state = historyState()
    if (projectFromLocation() === id && state?.pushedByDrawer) {
      setProjectId(id)
      return
    }

    if (state?.pushedByDrawer) {
      window.history.replaceState(
        {
          projectDrawer: id,
          pushedByDrawer: true,
          depth: state.depth ?? 1,
        },
        '',
        hashUrl(id),
      )
      setProjectId(id)
      return
    }

    window.history.pushState(
      { projectDrawer: id, pushedByDrawer: true, depth: 1 },
      '',
      hashUrl(id),
    )
    setProjectId(id)
  }, [])

  const close = useCallback(() => {
    if (closingRef.current) return
    const state = historyState()
    const depth = state?.pushedByDrawer ? (state.depth ?? 1) : 0
    if (depth > 0) {
      closingRef.current = true
      window.history.go(-depth)
      return
    }

    window.history.replaceState({ projectDrawer: null }, '', cleanUrl())
    setProjectId(null)
  }, [])

  return { projectId, open, close }
}
