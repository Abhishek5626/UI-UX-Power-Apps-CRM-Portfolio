/**
 * Page-wide infinite fisheye field.
 * Port of Componentry's Fisheye Infinite Grid (MIT, Harsh Jadhav —
 * https://github.com/harshjdhv/componentry) for live DOM instead of a WebGL
 * image atlas. The reference warps the whole viewport as one continuous lens
 * surface in a fragment shader; here the same lens curve is applied to every
 * tile's four corners and each tile is projected with a matrix3d homography,
 * so neighbouring tiles bend together as one surface.
 *
 * Reference default lensStrength = 0.24; this field uses exactly 50% (0.12).
 *
 * `layout` is the Figma frame as fixed rects. Its columns are grouped into
 * strips that loop vertically on their own period, and the whole block loops
 * horizontally, so the field is infinite with no holes and the first paint is
 * the Figma arrangement. Heights are always the Figma heights; only x
 * positions and widths adapt to the viewport. Live copies are mounted only as
 * far as the viewport needs them.
 */
import {
  Children,
  cloneElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  isValidElement,
} from 'react'
import './project-fisheye-field.css'

/** Componentry / Craftwork default. */
const REFERENCE_LENS_STRENGTH = 0.24
/** Exactly 50% of the reference effect. */
export const LENS_STRENGTH = REFERENCE_LENS_STRENGTH * 0.5
/** Phones: half again, as a local bulge around the finger or pointer. */
const PHONE_LENS_STRENGTH = LENS_STRENGTH * 0.5
/** Bulge radius, as a share of the screen width. */
const PHONE_LENS_SIGMA = 0.4
/** How quickly the bulge follows the finger, in ms. */
const PHONE_LENS_EASE_MS = 90
const PHONE_REVEAL_MS = 420
const PHONE_NAV_TOP_ZONE_PX = 8
const PHONE_NAV_DIRECTION_PX = 8

/** A tile this close to the screen is kept live, so a bulge never reveals a hole. */
const TILE_LIVE_MARGIN_PX = 40
/** A card mounts this far ahead of the screen, so it is ready before it shows. */
const CARD_MOUNT_MARGIN_PX = 400
const DRAG_CLICK_THRESHOLD_PX = 8
const INERTIA = 0.94
const WHEEL_SENSITIVITY = 0.42

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const wrapInto = (value: number, min: number, max: number) => {
  const span = max - min
  if (span <= 0) return value
  return min + ((((value - min) % span) + span) % span)
}

/**
 * Screen → world mapping from the reference shader, inverted so world
 * points can be placed on screen. Lens space is centred on the viewport and
 * normalised by half its height.
 */
const lensCurve = (lx: number, ly: number, aspectTerm: number, k: number) => {
  // Radius 1 is the viewport corner. Capping it keeps the inverse stable for
  // the off-screen corners of edge tiles without changing anything visible.
  const radius = Math.min(4, (lx * lx + ly * ly) / aspectTerm)
  return k * (0.34 * radius + 0.12 * radius * radius)
}

const warpPoint = (
  wx: number,
  wy: number,
  halfW: number,
  halfH: number,
  aspectTerm: number,
  k: number,
): [number, number] => {
  if (k === 0) return [wx, wy]
  const ux = (wx - halfW) / halfH
  const uy = (wy - halfH) / halfH
  let sx = ux
  let sy = uy
  for (let i = 0; i < 6; i += 1) {
    const scale = 1 + lensCurve(sx, sy, aspectTerm, k)
    sx = ux * scale
    sy = uy * scale
  }
  return [halfW + sx * halfH, halfH + sy * halfH]
}

/** matrix3d that maps a w×h box onto the quad tl, tr, br, bl. */
export const quadMatrix = (
  w: number,
  h: number,
  [x0, y0]: [number, number],
  [x1, y1]: [number, number],
  [x2, y2]: [number, number],
  [x3, y3]: [number, number],
) => {
  const dx1 = x1 - x2
  const dx2 = x3 - x2
  const dx3 = x0 - x1 + x2 - x3
  const dy1 = y1 - y2
  const dy2 = y3 - y2
  const dy3 = y0 - y1 + y2 - y3
  let g = 0
  let hh = 0
  const det = dx1 * dy2 - dx2 * dy1
  if (Math.abs(det) > 1e-9 && (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9)) {
    g = (dx3 * dy2 - dx2 * dy3) / det
    hh = (dx1 * dy3 - dx3 * dy1) / det
  }
  const a = x1 - x0 + g * x1
  const b = x3 - x0 + hh * x3
  const d = y1 - y0 + g * y1
  const e = y3 - y0 + hh * y3
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${x0},${y0},0,1)`
}

export type FisheyeRect = {
  item: number
  x: number
  y: number
  w: number
  h: number
}

export type FisheyeStrip = {
  /** Strip content height in design px; it loops every height + 2 gutters. */
  height: number
  items: readonly FisheyeRect[]
}

export type FisheyeLayout = {
  /** Design width of the block without gutters. */
  width: number
  gutterX: number
  gutterY: number
  /**
   * Screen width the rects were drawn for. When set, scale follows the screen
   * (so a sheet wider than the screen keeps its proportions) instead of
   * fitting the whole block into it.
   */
  viewWidth?: number
  /** Left inset of the first column, in design px (phone reveal target). */
  rowInsetX: number
  /** Shift each horizontal copy vertically, so repeated columns don't line up. */
  staggerColumns?: boolean
  /** Narrowest / widest horizontal scale applied to x positions and widths. */
  minScale: number
  maxScale: number
  strips: readonly FisheyeStrip[]
}

type Copies = { x: number; y: readonly number[] }

type Placement = FisheyeRect & {
  strip: number
  copyX: number
  copyY: number
}

const cardKeyOf = (placement: Placement) =>
  `${placement.item}-${placement.copyX}-${placement.copyY}`

const scaleFor = (layout: FisheyeLayout, viewW: number) =>
  clamp(
    layout.viewWidth
      ? viewW / layout.viewWidth
      : (viewW - layout.gutterX * 2) / layout.width,
    layout.minScale,
    layout.maxScale,
  )

const blockPeriodFor = (layout: FisheyeLayout, scale: number) =>
  layout.width * scale + layout.gutterX * 2

/** How many live copies each axis needs so wrapping never opens a hole. */
const copiesFor = (
  layout: FisheyeLayout,
  viewW: number,
  viewH: number,
): Copies => {
  const scale = scaleFor(layout, viewW)
  const widest = Math.max(
    ...layout.strips.flatMap((strip) => strip.items.map((r) => r.w * scale)),
  )
  return {
    x: Math.max(
      1,
      Math.ceil((viewW + widest) / blockPeriodFor(layout, scale)),
    ),
    y: layout.strips.map((strip) => {
      const tallest = Math.max(...strip.items.map((r) => r.h))
      return Math.max(
        1,
        Math.ceil((viewH + tallest) / (strip.height + layout.gutterY * 2)),
      )
    }),
  }
}

const sameCopies = (a: Copies, b: Copies) =>
  a.x === b.x &&
  a.y.length === b.y.length &&
  a.y.every((value, index) => value === b.y[index])

export type ProjectFisheyeLink = {
  href: string
  label: string
  onOpen?: (opener: HTMLAnchorElement) => void
}

type ProjectFisheyeFieldProps = {
  children: ReactNode
  layout: FisheyeLayout
  links?: readonly ProjectFisheyeLink[]
  /** Phone sheet: pointer-following lens, and the nav hides as it pans. */
  phone?: boolean
  'aria-label'?: string
}

export function ProjectFisheyeField({
  children,
  layout,
  links = [],
  phone = false,
  'aria-label': ariaLabel = 'Portfolio — drag to explore',
}: ProjectFisheyeFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)

  const faces = useMemo(() => {
    const list: ReactElement[] = []
    Children.forEach(children, (child) => {
      if (isValidElement(child)) list.push(child)
    })
    return list
  }, [children])

  const [copies, setCopies] = useState<Copies>(() =>
    copiesFor(layout, window.innerWidth, window.innerHeight),
  )

  const placements = useMemo(() => {
    const list: Placement[] = []
    for (let copyX = 0; copyX < copies.x; copyX += 1) {
      layout.strips.forEach((strip, stripIndex) => {
        const copiesY = copies.y[stripIndex] ?? 1
        for (let copyY = 0; copyY < copiesY; copyY += 1) {
          strip.items.forEach((rect) => {
            if (rect.item < faces.length) {
              list.push({ ...rect, strip: stripIndex, copyX, copyY })
            }
          })
        }
      })
    }
    return list
  }, [layout, copies, faces.length])

  // Cards mount on first approach and stay mounted, so a playing track or a
  // card's state survives panning away.
  const [mountedCards, setMountedCards] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  // Read by the paint loop, which must not restart (and drop a drag) as cards mount.
  const mountedCardsRef = useRef(new Set<string>())

  // Mount more copies before paint when the viewport outgrows the current set.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const sync = () => {
      const rect = root.getBoundingClientRect()
      const next = copiesFor(layout, rect.width, rect.height)
      setCopies((current) => (sameCopies(current, next) ? current : next))
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(root)
    return () => observer.disconnect()
  }, [layout])

  // The pan offset survives copy-count changes so a resize never jumps.
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const root = rootRef.current
    const plane = planeRef.current
    if (!root || !plane) return

    const tiles = [
      ...plane.querySelectorAll<HTMLElement>('[data-fisheye-tile]'),
    ]
    if (tiles.length === 0) return

    // Panned tiles stay out of tab order; the accessible nav covers them.
    // Cards add controls later (e.g. the music card's player), so keep
    // re-applying as the tiles change.
    const untab = () => {
      plane
        .querySelectorAll<HTMLElement>(
          'a, button, input, select, textarea, iframe, [tabindex]',
        )
        .forEach((control) => {
          if (control.tabIndex !== -1) control.tabIndex = -1
        })
    }
    untab()
    // Only what changed: cards rewrite their own tab stops every time they turn.
    const tabObserver = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes') {
          if ((record.target as HTMLElement).tabIndex !== -1) {
            ;(record.target as HTMLElement).tabIndex = -1
          }
        } else if (record.addedNodes.length > 0) {
          untab()
          return
        }
      }
    })
    tabObserver.observe(plane, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['tabindex'],
    })

    const position = positionRef.current
    const velocity = { x: 0, y: 0 }
    const drag = {
      active: false,
      moved: false,
      pointerId: -1,
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      time: 0,
      /** Card control with its own one-axis drag the gesture started on. */
      owner: null as HTMLElement | null,
    }

    let viewW = 1
    let viewH = 1
    let scale = 1
    let blockPeriod = 1
    let periodX = 1
    const stripPeriods = layout.strips.map(
      (strip) => strip.height + layout.gutterY * 2,
    )
    const periodY = stripPeriods.map(
      (period, index) => (copies.y[index] ?? 1) * period,
    )
    // Common multiple of the strip loops, so wrapping the pan offset by it
    // never shifts any strip.
    const panPeriodY = periodY.reduce((a, b) => a * b, 1)
    const tileLive: (boolean | undefined)[] = []
    const tileSize: (string | undefined)[] = []
    // Only cards properly on screen mount in the first task. Neighbouring slivers
    // and the ring around them wait for idle time, so they can't delay first paint.
    let mountMargin = -24
    let reducedMotion = false
    let frame = 0
    let previous = performance.now()
    let disposed = false

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      reducedMotion = motionQuery.matches
      if (reducedMotion) {
        velocity.x = 0
        velocity.y = 0
      }
    }
    syncMotion()
    motionQuery.addEventListener('change', syncMotion)

    const layoutMetrics = () => {
      const rect = root.getBoundingClientRect()
      viewW = Math.max(1, rect.width)
      viewH = Math.max(1, rect.height)
      scale = scaleFor(layout, viewW)
      blockPeriod = blockPeriodFor(layout, scale)
      periodX = copies.x * blockPeriod
      // Unitless, so card CSS can fit fixed-height content with calc().
      root.style.setProperty('--fisheye-scale', String(scale))
      root.style.setProperty('--fisheye-view-w', String(viewW))
    }

    // Phone-only state; the desktop path never reads any of it.
    const html = document.documentElement
    const lens = { x: 0, y: 0, targetX: 0, targetY: 0, placed: false }
    let travelY = 0
    let navAnchor = 0
    let navHidden = false
    let glide: {
      x: number
      y: number
      doneX: number
      doneY: number
      start: number
    } | null = null

    const centerLens = () => {
      lens.targetX = viewW / 2
      lens.targetY = viewH / 2
    }

    const aimLens = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      lens.targetX = event.clientX - rect.left
      lens.targetY = event.clientY - rect.top
    }

    const lensMoving = () =>
      Math.hypot(lens.targetX - lens.x, lens.targetY - lens.y) > 0.5

    const syncNav = () => {
      const period = periodY[0]!
      const wrapped = wrapInto(position.y, 0, period)
      const atTop =
        wrapped <= PHONE_NAV_TOP_ZONE_PX ||
        period - wrapped <= PHONE_NAV_TOP_ZONE_PX
      let next = navHidden
      if (atTop) {
        next = false
        navAnchor = travelY
      } else if (Math.abs(travelY - navAnchor) >= PHONE_NAV_DIRECTION_PX) {
        // Content moving up is the same as scrolling the page down.
        next = travelY < navAnchor
        navAnchor = travelY
      }
      if (next === navHidden) return
      navHidden = next
      if (next) html.dataset.mobileNav = 'hidden'
      else delete html.dataset.mobileNav
    }

    const columnShift = (placement: Placement) =>
      layout.staggerColumns
        ? (placement.copyX * periodY[placement.strip]!) / copies.x
        : 0

    const paint = () => {
      const k = reducedMotion ? 0 : LENS_STRENGTH
      const halfW = viewW * 0.5
      const halfH = viewH * 0.5
      const aspect = viewW / viewH
      const aspectTerm = aspect * aspect + 1
      // Pan is stored in design px horizontally so a resize keeps the view.
      const panX = position.x * scale
      const bulge = reducedMotion ? 0 : PHONE_LENS_STRENGTH
      const sigma = viewW * PHONE_LENS_SIGMA
      const warp = phone
        ? (wx: number, wy: number): [number, number] => {
            const dx = wx - lens.x
            const dy = wy - lens.y
            const grow =
              bulge * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma))
            return [wx + dx * grow, wy + dy * grow]
          }
        : (wx: number, wy: number) =>
            warpPoint(wx, wy, halfW, halfH, aspectTerm, k)

      let addedCard = false
      tiles.forEach((tile, index) => {
        const placement = placements[index]
        if (!placement) return
        const w = placement.w * scale
        const h = placement.h
        const x = wrapInto(
          panX +
            layout.gutterX +
            placement.x * scale +
            placement.copyX * blockPeriod,
          -w,
          -w + periodX,
        )
        const y = wrapInto(
          position.y +
            layout.gutterY +
            placement.y +
            placement.copyY * stripPeriods[placement.strip]! -
            columnShift(placement),
          -h,
          -h + periodY[placement.strip]!,
        )

        const cardKey = cardKeyOf(placement)
        if (
          !mountedCardsRef.current.has(cardKey) &&
          x + w > -mountMargin &&
          x < viewW + mountMargin &&
          y + h > -mountMargin &&
          y < viewH + mountMargin
        ) {
          mountedCardsRef.current.add(cardKey)
          addedCard = true
        }

        // The lens only pushes points outward, so an off-screen tile never
        // warps back into view: it can skip paint and its layer entirely, and
        // needs no writes until it returns.
        const live =
          x + w > -TILE_LIVE_MARGIN_PX &&
          x < viewW + TILE_LIVE_MARGIN_PX &&
          y + h > -TILE_LIVE_MARGIN_PX &&
          y < viewH + TILE_LIVE_MARGIN_PX
        if (!live && tileLive[index] === false) return
        if (live !== tileLive[index]) {
          tileLive[index] = live
          tile.style.contentVisibility = live ? '' : 'hidden'
          tile.style.willChange = live ? '' : 'auto'
          tile.style.visibility = 'visible'
        }
        const size = `${w}x${h}`
        if (size !== tileSize[index]) {
          tileSize[index] = size
          tile.style.width = `${w}px`
          tile.style.height = `${h}px`
        }
        tile.style.transform = quadMatrix(
          w,
          h,
          warp(x, y),
          warp(x + w, y),
          warp(x + w, y + h),
          warp(x, y + h),
        )
      })
      if (addedCard) setMountedCards(new Set(mountedCardsRef.current))
    }

    const panBy = (dx: number, dy: number) => {
      position.x += dx / scale
      position.y += dy
      travelY += dy
    }

    const tick = (time: number) => {
      const delta = Math.min(32, time - previous)
      previous = time

      if (phone) {
        if (reducedMotion) {
          lens.x = lens.targetX
          lens.y = lens.targetY
        } else {
          const follow = 1 - Math.exp(-delta / PHONE_LENS_EASE_MS)
          lens.x += (lens.targetX - lens.x) * follow
          lens.y += (lens.targetY - lens.y) * follow
        }
        if (glide) {
          const progress = clamp((time - glide.start) / PHONE_REVEAL_MS, 0, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          panBy(glide.x * eased - glide.doneX, glide.y * eased - glide.doneY)
          glide.doneX = glide.x * eased
          glide.doneY = glide.y * eased
          if (progress >= 1) glide = null
        }
      }

      if (!drag.active && !reducedMotion) {
        panBy(velocity.x * delta, velocity.y * delta)
        const decay = Math.pow(INERTIA, delta / 16.667)
        velocity.x *= decay
        velocity.y *= decay
      } else if (!drag.active) {
        velocity.x = 0
        velocity.y = 0
      }

      // Each tile wraps itself; this only keeps the offset from growing.
      position.x = wrapInto(position.x, 0, periodX / scale)
      position.y = wrapInto(position.y, 0, panPeriodY)

      paint()
      if (phone) syncNav()

      if (
        drag.active ||
        Math.hypot(velocity.x, velocity.y) > 0.006 ||
        (phone && (glide !== null || lensMoving()))
      ) {
        frame = requestAnimationFrame(tick)
      } else {
        velocity.x = 0
        velocity.y = 0
        frame = 0
      }
    }

    const requestRender = () => {
      if (disposed || frame) return
      previous = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const resize = () => {
      layoutMetrics()
      paint()
    }

    const widenMounting = () => {
      if (disposed) return
      mountMargin = CARD_MOUNT_MARGIN_PX
      paint()
    }
    if ('requestIdleCallback' in window) requestIdleCallback(widenMounting, { timeout: 800 })
    else setTimeout(widenMounting, 200)

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(root)
    // Position 0 is the Figma origin: block copy 0 sits at the frame gutters.
    layoutMetrics()
    if (phone) {
      centerLens()
      lens.x = lens.targetX
      lens.y = lens.targetY
    }
    paint()

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) return
      drag.active = true
      drag.moved = false
      drag.pointerId = event.pointerId
      drag.startX = event.clientX
      drag.startY = event.clientY
      drag.x = event.clientX
      drag.y = event.clientY
      drag.time = performance.now()
      if (phone) {
        aimLens(event)
        glide = null
      }
      drag.owner =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-fisheye-drag-axis]')
          : null
      velocity.x = 0
      velocity.y = 0
      requestRender()
    }

    const clearSelection = () => {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) selection.removeAllRanges()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (phone && (drag.active || event.pointerType === 'mouse')) {
        aimLens(event)
        requestRender()
      }
      if (!drag.active || drag.pointerId !== event.pointerId) return

      if (!drag.moved) {
        const dx = event.clientX - drag.startX
        const dy = event.clientY - drag.startY
        if (Math.hypot(dx, dy) <= DRAG_CLICK_THRESHOLD_PX) return
        // A control with its own drag (wheel, seek bar, timeline) keeps
        // gestures along its axis; anything else pans the field.
        const axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
        if (drag.owner?.dataset.fisheyeDragAxis === axis) {
          drag.active = false
          return
        }
        // Capture only once it is a real drag so short clicks reach links.
        // Taking capture also tells a control that had it to stand down.
        drag.moved = true
        root.dataset.dragging = 'true'
        // Drop text the press began to select before the drag was recognised.
        clearSelection()
        try {
          root.setPointerCapture(event.pointerId)
        } catch {
          // The pointer already ended; the drag finishes on its own events.
        }
      }
      const time = performance.now()
      const deltaTime = Math.max(8, time - drag.time)
      const deltaX = event.clientX - drag.x
      const deltaY = event.clientY - drag.y
      panBy(deltaX, deltaY)
      velocity.x = clamp(deltaX / deltaTime, -2.4, 2.4)
      velocity.y = clamp(deltaY / deltaTime, -2.4, 2.4)
      drag.x = event.clientX
      drag.y = event.clientY
      drag.time = time
      requestRender()
    }

    const endDrag = (event: PointerEvent) => {
      // A finger is gone once lifted, so its bulge eases back to the centre.
      if (phone && event.pointerType !== 'mouse') {
        centerLens()
        requestRender()
      }
      if (!drag.active || drag.pointerId !== event.pointerId) return
      drag.active = false
      root.dataset.dragging = 'false'
      if (root.hasPointerCapture(event.pointerId)) {
        root.releasePointerCapture(event.pointerId)
      }
      if (drag.moved) {
        const suppress = (clickEvent: Event) => {
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
          root.removeEventListener('click', suppress, true)
        }
        root.addEventListener('click', suppress, true)
        window.setTimeout(
          () => root.removeEventListener('click', suppress, true),
          0,
        )
      }
      requestRender()
    }

    const cancelDrag = () => {
      if (!drag.active) return
      drag.active = false
      root.dataset.dragging = 'false'
      if (root.hasPointerCapture(drag.pointerId)) {
        root.releasePointerCapture(drag.pointerId)
      }
      requestRender()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== root) return
      const step = 56
      const map: Record<string, [number, number]> = {
        ArrowLeft: [step, 0],
        ArrowRight: [-step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      }
      const delta = map[event.key]
      if (!delta) return
      event.preventDefault()
      panBy(delta[0], delta[1])
      velocity.x = 0
      velocity.y = 0
      paint()
    }

    const onWheel = (event: WheelEvent) => {
      if (drag.active) return
      event.preventDefault()
      const mode =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? Math.max(viewH, 1)
            : 1

      if (reducedMotion) {
        panBy(
          -event.deltaX * mode * WHEEL_SENSITIVITY,
          -event.deltaY * mode * WHEEL_SENSITIVITY,
        )
        velocity.x = 0
        velocity.y = 0
        paint()
        return
      }

      const impulse = WHEEL_SENSITIVITY * 0.003
      velocity.x = clamp(velocity.x - event.deltaX * mode * impulse, -1.25, 1.25)
      velocity.y = clamp(velocity.y - event.deltaY * mode * impulse, -1.25, 1.25)
      requestRender()
    }

    root.addEventListener('pointerdown', onPointerDown)
    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerup', endDrag)
    root.addEventListener('pointercancel', endDrag)
    window.addEventListener('blur', cancelDrag)
    root.addEventListener('keydown', onKeyDown)
    root.addEventListener('wheel', onWheel, { passive: false })

    const onPointerLeave = () => {
      if (drag.active) return
      centerLens()
      requestRender()
    }

    // Nav "About Me": the sheet pans; there is no page scroll to move.
    const onReveal = (event: Event) => {
      const tile =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-fisheye-tile]')
          : null
      const placement = tile ? placements[tiles.indexOf(tile)] : undefined
      if (!placement) return
      event.preventDefault()
      const w = placement.w * scale
      const x = wrapInto(
        position.x * scale +
          layout.gutterX +
          placement.x * scale +
          placement.copyX * blockPeriod,
        -w,
        -w + periodX,
      )
      const y = wrapInto(
        position.y +
          layout.gutterY +
          placement.y +
          placement.copyY * stripPeriods[placement.strip]! -
          columnShift(placement),
        -placement.h,
        -placement.h + periodY[placement.strip]!,
      )
      const toX = layout.rowInsetX * scale - x
      const toY = layout.gutterY + layout.strips[0]!.items[0]!.y - y
      velocity.x = 0
      velocity.y = 0
      if (reducedMotion) {
        panBy(toX, toY)
        paint()
        syncNav()
        return
      }
      glide = { x: toX, y: toY, doneX: 0, doneY: 0, start: performance.now() }
      requestRender()
    }

    if (phone) {
      root.addEventListener('pointerleave', onPointerLeave)
      root.addEventListener('fisheye-reveal', onReveal)
    }
    // Card links and images are natively draggable; the browser's own drag
    // fires pointercancel and kills the pan, so it never starts in here.
    const preventNative = (event: Event) => event.preventDefault()
    const onSelectStart = (event: Event) => {
      if (drag.moved && drag.active) event.preventDefault()
    }
    root.addEventListener('dragstart', preventNative)
    root.addEventListener('selectstart', onSelectStart)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      tabObserver.disconnect()
      motionQuery.removeEventListener('change', syncMotion)
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerup', endDrag)
      root.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('blur', cancelDrag)
      root.removeEventListener('keydown', onKeyDown)
      root.removeEventListener('wheel', onWheel)
      root.removeEventListener('pointerleave', onPointerLeave)
      root.removeEventListener('fisheye-reveal', onReveal)
      if (phone) delete html.dataset.mobileNav
      root.removeEventListener('dragstart', preventNative)
      root.removeEventListener('selectstart', onSelectStart)
    }
  }, [placements, layout, copies, phone])

  return (
    <div
      ref={rootRef}
      className="project-fisheye-field page-fisheye-field"
      role="region"
      tabIndex={0}
      aria-label={ariaLabel}
      data-dragging="false"
      data-lens={phone ? PHONE_LENS_STRENGTH : LENS_STRENGTH}
    >
      <span className="project-fisheye-hint">
        Drag, scroll or use arrow keys to pan the whole page in any direction.
        Short clicks still open links.
      </span>

      <div ref={planeRef} className="project-fisheye-plane" aria-hidden="true">
        {placements.map((placement) => {
          const face = faces[placement.item]!
          const props = face.props as { id?: string }
          const copy = `${placement.copyX}-${placement.copyY}`
          const cardKey = cardKeyOf(placement)
          return (
            <div
              key={cardKey}
              className="project-fisheye-tile"
              data-fisheye-tile=""
              data-fisheye-item={placement.item}
              data-fisheye-copy={copy}
            >
              {/* Entrance layer: the page's load swoop animates this, so it
                  never touches the tile's lens transform. */}
              <div className="project-fisheye-entrance" data-entrance="">
                {/* Copies drop the id so anchors like #about stay unique. */}
                {!mountedCards.has(cardKey)
                  ? null
                  : copy !== '0-0' && props.id
                    ? cloneElement(face, { id: undefined } as Partial<unknown>)
                    : face}
              </div>
            </div>
          )
        })}
      </div>

      <div className="project-fisheye-vignette" aria-hidden="true" />

      {links.length > 0 ? (
        <nav className="project-fisheye-links" aria-label="Portfolio shortcuts">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => {
                if (!link.onOpen) return
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0
                ) {
                  return
                }
                event.preventDefault()
                link.onOpen(event.currentTarget)
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
