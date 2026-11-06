import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import {
  strategyOptions,
  type StrategyOptionContent,
} from './designStrategyContent.ts'
import { ShippedBadge } from './ShippedBadge.tsx'
import './design-strategy.css'

const optionCount = strategyOptions.length
const stepDeg = 12
const radius = 128
const arcOrigin = 64 - radius
const pxPerStep = radius * Math.sin((stepDeg * Math.PI) / 180)
const dragThreshold = 4
const stackMs = 450
const stackEase = 'cubic-bezier(0.4, 0, 0.2, 1)'
const autoIntervalMs = 5250
const autoSpinMs = 600
const roles = ['farTop', 'nearTop', 'active', 'nearBottom', 'farBottom'] as const

type StackRole = (typeof roles)[number]

type StackSpec = {
  w: number
  h: number
  bg: number
  radius: string
  shadow: string
  pad: string
  scale: number
  opacity: number
  y: number
  z: number
}

function wrapDelta(from: number, to: number) {
  let diff = to - from
  diff -= optionCount * Math.round(diff / optionCount)
  return diff
}

function modIndex(index: number) {
  return ((index % optionCount) + optionCount) % optionCount
}

function blurFor(distance: number) {
  return distance
}

/** Push forward, then a short damped return. Matches the reference arrow. */
function springPushReturn(progress: number) {
  if (progress < 0.2) {
    const p = progress / 0.2
    return p * p * (3 - 2 * p)
  }
  const p = (progress - 0.2) / 0.8
  return Math.exp(-5 * p) * Math.cos(p * Math.PI * 2.5)
}

function buildSpecs(stackWidth: number): Record<StackRole, StackSpec> {
  const activeW = Math.min(260, Math.max(188, stackWidth - 12))
  const scale = activeW / 260
  const activeH = 175 * scale
  const nearW = 184 * scale
  const nearH = 28 * scale
  const farW = 134 * scale
  const farH = 20 * scale
  const overlap = 2 * scale
  const nearY = activeH / 2 + nearH / 2 - overlap
  const farY = nearY + nearH / 2 + farH / 2 - overlap
  const bar = (
    w: number,
    h: number,
    y: number,
    bg: number,
    radiusValue: string,
    shadow: string,
    z: number,
  ): StackSpec => ({
    w,
    h,
    y,
    bg,
    radius: radiusValue,
    shadow,
    pad: '0px',
    scale: 1,
    opacity: 1,
    z,
  })

  return {
    farTop: bar(
      farW,
      farH,
      -farY,
      0.24,
      `${14 * scale}px ${14 * scale}px 0 0`,
      '0 -12px 8px 0 rgba(255, 243, 244, 0.35)',
      2,
    ),
    nearTop: bar(
      nearW,
      nearH,
      -nearY,
      0.44,
      `${18 * scale}px ${18 * scale}px 0 0`,
      '0 -12px 8px 0 rgba(255, 243, 244, 0.35)',
      3,
    ),
    active: {
      ...bar(
        activeW,
        activeH,
        0,
        0.92,
        `${32 * scale}px`,
        'inset 0 -2px 0 0 rgba(255, 206, 209, 0.32), 0 -12px 8px 0 rgba(255, 243, 244, 0.35)',
        4,
      ),
      pad: `${22 * scale}px ${28 * scale}px ${23 * scale}px`,
    },
    nearBottom: bar(
      nearW,
      nearH,
      nearY,
      0.44,
      `0 0 ${18 * scale}px ${18 * scale}px`,
      'inset 0 -1.5px 0 0 rgba(255, 222, 224, 0.32)',
      3,
    ),
    farBottom: bar(
      farW,
      farH,
      farY,
      0.24,
      `0 0 ${14 * scale}px ${14 * scale}px`,
      'inset 0 -1.5px 0 0 rgba(255, 222, 224, 0.24)',
      2,
    ),
  }
}

function applySpec(el: HTMLDivElement, spec: StackSpec, animate: boolean) {
  el.style.transition = animate
    ? `width ${stackMs}ms ${stackEase}, height ${stackMs}ms ${stackEase}, padding ${stackMs}ms ${stackEase}, background-color ${stackMs}ms ${stackEase}, border-radius ${stackMs}ms ${stackEase}, box-shadow ${stackMs}ms ${stackEase}, transform ${stackMs}ms ${stackEase}, opacity ${stackMs}ms ${stackEase}`
    : 'none'
  el.style.width = `${spec.w}px`
  el.style.height = `${spec.h}px`
  el.style.padding = spec.pad
  el.style.backgroundColor = `rgba(255, 222, 224, ${spec.bg})`
  el.style.borderRadius = spec.radius
  el.style.boxShadow = spec.shadow
  el.style.zIndex = String(spec.z)
  el.style.opacity = String(spec.opacity)
  el.style.transform = `translate(-50%, -50%) translateY(${spec.y}px) scale(${spec.scale})`
}

export function StrategyOption({
  option,
  index,
  copy,
}: {
  option: StrategyOptionContent
  index: number
  copy: number
}) {
  return (
    <button
      type="button"
      className="strategy-option"
      data-strategy-index={index}
      data-strategy-copy={copy}
      id={copy === 1 ? `strategy-option-${option.id}` : undefined}
    >
      {option.label}
    </button>
  )
}

export function StrategyOptionList({
  listRef,
}: {
  listRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={listRef}
      className="strategy-option-list"
      data-fisheye-drag-axis="y"
      role="listbox"
      aria-labelledby="design-strategy-title"
      aria-activedescendant="strategy-option-zero-to-one"
      aria-orientation="vertical"
    >
      <div className="strategy-option-track">
        {[0, 1, 2].flatMap((copy) =>
          strategyOptions.map((option, index) => (
            <StrategyOption
              key={`${copy}-${option.id}`}
              option={option}
              index={index}
              copy={copy}
            />
          )),
        )}
      </div>
    </div>
  )
}

export function StrategyDetailCard({
  cardRef,
}: {
  cardRef: (node: HTMLDivElement | null) => void
}) {
  return (
    <div ref={cardRef} className="strategy-detail-card">
      <p className="strategy-detail-copy" />
    </div>
  )
}

export function StrategyCardStack({
  stackRef,
  cardRefs,
}: {
  stackRef: RefObject<HTMLDivElement | null>
  cardRefs: RefObject<Array<HTMLDivElement | null>>
}) {
  return (
    <div ref={stackRef} className="strategy-card-stack" aria-hidden="true">
      {roles.map((role, index) => (
        <StrategyDetailCard
          key={role}
          cardRef={(node) => {
            cardRefs.current[index] = node
          }}
        />
      ))}
    </div>
  )
}

function StrategyArrow() {
  return (
    <svg width="20" height="15" viewBox="0 0 20 15" fill="none" aria-hidden="true">
      <path
        d="M1 7.5H19M12 1l7 6.5-7 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DesignStrategyCard() {
  const frameRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const statusRef = useRef<HTMLParagraphElement>(null)
  const stackText = useRef<string[]>(['', '', strategyOptions[0].description, '', ''])
  const statusText = useRef(
    `${strategyOptions[0].label}. ${strategyOptions[0].description}`,
  )

  useLayoutEffect(() => {
    cardRefs.current.forEach((card, index) => {
      const copy = card?.querySelector('.strategy-detail-copy')
      const text = stackText.current[index] ?? ''
      if (copy && copy.textContent !== text) copy.textContent = text
    })
    if (statusRef.current && statusRef.current.textContent !== statusText.current) {
      statusRef.current.textContent = statusText.current
    }
  })

  useLayoutEffect(() => {
    const list = listRef.current
    const arrow = arrowRef.current
    const stack = stackRef.current
    const frame = frameRef.current
    const cards = cardRefs.current.filter((card): card is HTMLDivElement => card !== null)
    if (!list || !arrow || !stack || !frame || cards.length !== roles.length) return

    const buttons = [...list.querySelectorAll<HTMLButtonElement>('.strategy-option')]
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = reducedMotion.matches
    let currentIdx = 0
    let scrollAngle = 0
    let desiredIdx = 0
    let arrowNudge = 0
    let activeNudge = 0
    let animating = false
    let hovered: HTMLButtonElement | null = null
    let pointerInside = false
    let pointerDown = false
    let dragging = false
    let pointerId = -1
    let dragStartY = 0
    let dragOrigin = 0
    let suppressClick = false
    let pressTarget: HTMLButtonElement | null = null
    let keyFocus = false
    let offscreen = false
    let centerY = (list.offsetHeight || 364) / 2
    let specs = buildSpecs(stack.clientWidth || 272)
    let slots = cards.slice()
    let shown = 0
    let stackBusy = false
    let stackToken = 0
    let pending: number | null = null
    let spinFrame = 0
    let spinGen = 0
    let sweepFrame = 0
    let sweepButton: HTMLButtonElement | null = null
    let sweepElapsed = 0
    let sweepLast = 0
    let sweepPaused = false
    let timerFrame = 0
    let timerElapsed = 0
    let timerLast = performance.now()
    let nudgeFrame = 0
    let nudgeGen = 0
    let ariaIdx = -1
    let halfLine = 12.8
    let cancelled = false
    const timers = new Set<number>()

    const copyOf = (card: HTMLDivElement) =>
      card.querySelector<HTMLElement>('.strategy-detail-copy')

    const setText = (card: HTMLDivElement, text: string) => {
      const index = cards.indexOf(card)
      if (index >= 0) stackText.current[index] = text
      const copy = copyOf(card)
      if (copy) copy.textContent = text
    }

    const setCopyOpacity = (card: HTMLDivElement, opacity: number, transition: string) => {
      const copy = copyOf(card)
      if (!copy) return
      copy.style.transition = transition
      copy.style.opacity = String(opacity)
    }

    const roleSpec = (role: StackRole, overrides?: Partial<StackSpec>) => ({
      ...specs[role],
      ...overrides,
    })

    const paintSlots = (animate: boolean) => {
      slots.forEach((card, index) => applySpec(card, roleSpec(roles[index]), animate))
    }

    const announce = (index: number) => {
      const option = strategyOptions[index]
      statusText.current = `${option.label}. ${option.description}`
      if (statusRef.current) statusRef.current.textContent = statusText.current
    }

    const finishStack = (index: number, activeCard: HTMLDivElement) => {
      shown = index
      setCopyOpacity(activeCard, 1, 'opacity 200ms ease-in')
      for (const card of slots) {
        if (card !== activeCard) setText(card, '')
      }
      announce(index)
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        if (cancelled) return
        stackBusy = false
        if (pending !== null && pending !== shown) {
          const next = pending
          pending = null
          runStack(next)
        } else {
          pending = null
        }
      }, 220)
      timers.add(timer)
    }

    const showImmediate = (index: number) => {
      stackBusy = false
      pending = null
      shown = index
      slots = cards.slice()
      paintSlots(false)
      slots.forEach((card, slot) => {
        const text = slot === 2 ? strategyOptions[index].description : ''
        setText(card, text)
        setCopyOpacity(card, text ? 1 : 0, 'none')
      })
      announce(index)
    }

    const runStack = (index: number) => {
      if (cancelled) return
      if (reduced) {
        showImmediate(index)
        return
      }
      if (stackBusy) {
        pending = index
        return
      }
      if (index === shown) return
      stackBusy = true
      const token = ++stackToken

      const [farTop, nearTop, active, nearBottom, farBottom] = slots
      applySpec(
        farTop,
        roleSpec('farBottom', { scale: 0.5, opacity: 0, y: specs.farBottom.y + 20, z: 1 }),
        false,
      )
      setText(nearBottom, strategyOptions[index].description)
      setCopyOpacity(nearBottom, 0, 'none')
      setCopyOpacity(active, 0, 'opacity 150ms ease-out')
      farTop.getBoundingClientRect()

      requestAnimationFrame(() => {
        if (cancelled || token !== stackToken) return
        applySpec(nearTop, roleSpec('farTop'), true)
        applySpec(active, roleSpec('nearTop'), true)
        applySpec(nearBottom, roleSpec('active'), true)
        applySpec(farBottom, roleSpec('nearBottom'), true)
        applySpec(farTop, roleSpec('farBottom'), true)
      })

      const timer = window.setTimeout(() => {
        timers.delete(timer)
        if (cancelled || token !== stackToken) return
        slots = [nearTop, active, nearBottom, farBottom, farTop]
        finishStack(index, nearBottom)
      }, stackMs + 10)
      timers.add(timer)
    }

    const showCenteredCopy = (index: number) => {
      if (index === shown && !stackBusy) return
      stackToken += 1
      showImmediate(index)
    }

    const narrow = window.matchMedia('(max-width: 553px)')
    const cycleMs = () => (narrow.matches ? autoIntervalMs - 3750 : autoIntervalMs)
    const sweepMs = () => (narrow.matches ? 1000 : 4750)

    const clearSweep = (button: HTMLButtonElement) => {
      if (button.dataset.sweeping !== '1') return
      button.dataset.sweeping = '0'
      button.style.backgroundImage = ''
      button.style.backgroundSize = ''
      button.style.backgroundPosition = ''
      button.style.webkitBackgroundClip = ''
      button.style.backgroundClip = ''
      button.style.webkitTextFillColor = ''
      if (sweepButton === button) {
        sweepButton = null
        cancelAnimationFrame(sweepFrame)
      }
    }

    const clearAllSweeps = () => {
      for (const button of buttons) clearSweep(button)
    }

    const sweepTick = (now: number) => {
      if (cancelled || !sweepButton) return
      if (!sweepPaused) sweepElapsed += now - sweepLast
      sweepLast = now
      const progress = Math.min(sweepElapsed / sweepMs(), 1)
      sweepButton.style.backgroundPosition = `${(100 - 100 * progress).toFixed(1)}% center`
      if (progress < 1) sweepFrame = requestAnimationFrame(sweepTick)
      else clearSweep(sweepButton)
    }

    const setSweepPaused = (paused: boolean) => {
      if (sweepPaused === paused) return
      sweepPaused = paused
      sweepLast = performance.now()
    }

    const startSweep = (button: HTMLButtonElement) => {
      if (reduced) return
      if (sweepButton && sweepButton !== button) clearSweep(sweepButton)
      if (button.dataset.sweeping === '1') return
      button.dataset.sweeping = '1'
      button.style.backgroundImage =
        'linear-gradient(90deg, #211b1c 0%, #211b1c 44%, #fc8e95 50%, #211b1c 56%, #211b1c 100%)'
      button.style.backgroundSize = '200% auto'
      button.style.webkitBackgroundClip = 'text'
      button.style.backgroundClip = 'text'
      button.style.webkitTextFillColor = 'transparent'
      button.style.backgroundPosition = '100% center'
      sweepButton = button
      sweepElapsed = 0
      sweepPaused = offscreen
      sweepLast = performance.now()
      sweepFrame = requestAnimationFrame(sweepTick)
    }

    const triggerSweep = () => {
      const button = buttons[optionCount + currentIdx]
      if (!button) return
      startSweep(button)
    }

    const syncAria = () => {
      if (ariaIdx === desiredIdx) return
      ariaIdx = desiredIdx
      list.setAttribute(
        'aria-activedescendant',
        `strategy-option-${strategyOptions[desiredIdx].id}`,
      )
      for (const button of buttons) {
        const service = Number(button.dataset.strategyIndex)
        const primary = button.dataset.strategyCopy === '1'
        if (!primary) continue
        const selected = service === desiredIdx
        button.tabIndex = selected ? 0 : -1
        button.setAttribute('aria-selected', selected ? 'true' : 'false')
      }
    }

    const visualIndex = () => modIndex(currentIdx + Math.round(scrollAngle / stepDeg))

    const render = () => {
      const centered = visualIndex()
      for (let index = 0; index < buttons.length; index += 1) {
        const button = buttons[index]
        const slotDiff = index - (optionCount + currentIdx)
        const angleDeg = slotDiff * stepDeg - scrollAngle
        const angleRad = (angleDeg * Math.PI) / 180
        const distance = Math.abs(angleDeg) / stepDeg
        const active =
          Number(button.dataset.strategyIndex) === centered && distance <= 0.5
        const nudge = active ? activeNudge : 0
        const x = arcOrigin + radius * Math.cos(angleRad) + nudge
        const y = centerY + radius * Math.sin(angleRad)
        const hidden = Math.abs(angleDeg) > 70
        const hover = button === hovered && !active && !dragging
        let fontWeight = '400'
        let color = '#6b6666'
        let opacity = '0.4'
        let filter = 'none'
        let cursor = 'default'
        if (dragging) cursor = 'grabbing'
        else if (!active && Math.abs(angleDeg) < 50) cursor = 'pointer'

        if (active) {
          fontWeight = '600'
          color = '#211b1c'
          opacity = '1'
        } else if (hover) {
          color = '#211b1c'
          opacity = '0.72'
        } else if (!hidden) {
          const blur = blurFor(distance)
          filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none'
        }

        const transform = `translate(${x.toFixed(2)}px, ${(y - halfLine).toFixed(2)}px) rotate(${angleDeg.toFixed(2)}deg)`
        const visibility = hidden ? 'hidden' : 'visible'
        const zIndex = active ? '2' : '1'
        const signature = `${transform}|${visibility}|${zIndex}|${cursor}|${fontWeight}|${color}|${opacity}|${filter}`
        if (button.dataset.paint === signature) continue
        button.dataset.paint = signature
        button.style.transform = transform
        button.style.visibility = visibility
        button.style.zIndex = zIndex
        button.style.cursor = cursor
        button.style.fontWeight = fontWeight
        button.style.color = color
        button.style.opacity = opacity
        button.style.filter = filter
      }

      const stretch = Math.abs(arrowNudge) / 16
      const scaleX = 1 + stretch * 0.22
      const scaleY = 1 - stretch * 0.16
      arrow.style.transform = `translateY(-50%) translateX(${arrowNudge.toFixed(2)}px) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`
    }

    const cancelNudge = () => {
      nudgeGen += 1
      cancelAnimationFrame(nudgeFrame)
      arrowNudge = 0
      activeNudge = 0
    }

    const animateNudge = (onPeak: () => void) => {
      const generation = nudgeGen
      const start = performance.now()
      const distance = 16
      const lead = 60
      let peaked = false

      const tick = (now: number) => {
        if (cancelled || generation !== nudgeGen) return
        const elapsed = now - start
        const arrowT = Math.min(elapsed / 700, 1)
        arrowNudge = distance * springPushReturn(arrowT)
        const textElapsed = Math.max(0, elapsed - lead)
        const textT = Math.min(textElapsed / (700 - lead), 1)
        activeNudge = distance * springPushReturn(textT)
        if (!peaked && elapsed >= 120) {
          peaked = true
          onPeak()
        }
        render()
        if (elapsed < 700) nudgeFrame = requestAnimationFrame(tick)
        else {
          arrowNudge = 0
          activeNudge = 0
          render()
        }
      }
      nudgeFrame = requestAnimationFrame(tick)
    }

    const settleIndex = (index: number) => {
      currentIdx = modIndex(index)
      scrollAngle = 0
      desiredIdx = currentIdx
      syncAria()
    }

    const startSpin = (targetIdx: number, durationOverride?: number) => {
      const visual = currentIdx + scrollAngle / stepDeg
      const diff = wrapDelta(visual, targetIdx)
      const spinId = ++spinGen
      if (Math.abs(diff) < 0.02) {
        settleIndex(targetIdx)
        animating = false
        render()
        animateNudge(() => {
          runStack(currentIdx)
          triggerSweep()
        })
        return
      }

      animating = true
      cancelNudge()
      clearAllSweeps()
      const startAngle = scrollAngle
      const endAngle = scrollAngle + diff * stepDeg
      const duration = durationOverride ?? Math.min(300 + Math.abs(diff) * 150, 900)
      const start = performance.now()

      const tick = (now: number) => {
        if (cancelled || spinId !== spinGen) return
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - progress) ** 3
        scrollAngle = startAngle + (endAngle - startAngle) * eased
        render()
        if (progress < 1) {
          spinFrame = requestAnimationFrame(tick)
          return
        }
        settleIndex(targetIdx)
        animating = false
        render()
        animateNudge(() => {
          runStack(currentIdx)
          triggerSweep()
        })
      }
      spinFrame = requestAnimationFrame(tick)
    }

    const animateSnap = () => {
      const from = scrollAngle
      const spinId = ++spinGen
      if (Math.abs(from) < 0.2) {
        scrollAngle = 0
        animating = false
        render()
        animateNudge(() => triggerSweep())
        return
      }
      animating = true
      const start = performance.now()
      const tick = (now: number) => {
        if (cancelled || spinId !== spinGen) return
        const progress = Math.min((now - start) / 200, 1)
        const eased = 1 - (1 - progress) ** 3
        scrollAngle = from * (1 - eased)
        render()
        if (progress < 1) {
          spinFrame = requestAnimationFrame(tick)
          return
        }
        scrollAngle = 0
        animating = false
        render()
        animateNudge(() => triggerSweep())
      }
      spinFrame = requestAnimationFrame(tick)
    }

    const resetTimer = () => {
      timerElapsed = 0
      timerLast = performance.now()
    }

    const select = (index: number, spinMs?: number) => {
      if (!Number.isInteger(index) || index < 0 || index >= optionCount) return
      resetTimer()
      if (index === currentIdx && Math.abs(scrollAngle) < 0.01) return
      desiredIdx = index
      syncAria()
      if (reduced) {
        cancelAnimationFrame(spinFrame)
        spinGen += 1
        cancelNudge()
        clearAllSweeps()
        animating = false
        settleIndex(index)
        showImmediate(index)
        render()
        return
      }
      startSpin(index, spinMs)
    }

    const buttonFrom = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLButtonElement>('[data-strategy-index]')
        : null

    const pointerWithin = (event: PointerEvent) => {
      const bounds = list.getBoundingClientRect()
      return (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      )
    }

    const onPointerEnter = () => {
      pointerInside = true
      setSweepPaused(true)
    }

    const onPointerDown = (event: PointerEvent) => {
      for (const button of buttons) button.classList.remove('is-key-focus')
      if (event.button !== 0 || animating || pointerDown) return
      pointerDown = true
      dragging = false
      pointerId = event.pointerId
      dragStartY = event.clientY
      dragOrigin = currentIdx
      pressTarget = buttonFrom(event.target)
      try {
        list.setPointerCapture(event.pointerId)
      } catch {
        // The pointer can already be inactive if the gesture was cancelled.
      }
      list.classList.add('is-grabbing')
    }

    const onPointerMove = (event: PointerEvent) => {
      if (pointerDown && event.pointerId === pointerId) {
        const dy = event.clientY - dragStartY
        if (!dragging) {
          if (Math.abs(dy) < dragThreshold) return
          dragging = true
          suppressClick = true
          cancelNudge()
          clearAllSweeps()
          resetTimer()
        }
        if (reduced) {
          const steps = Math.round(-dy / pxPerStep)
          const next = modIndex(dragOrigin + steps)
          if (next !== currentIdx) {
            settleIndex(next)
            showImmediate(next)
            render()
          }
          return
        }
        scrollAngle = (-dy / pxPerStep) * stepDeg
        const next = visualIndex()
        if (next !== desiredIdx) {
          desiredIdx = next
          syncAria()
          showCenteredCopy(next)
        }
        render()
        return
      }

      if (!finePointer.matches || event.pointerType === 'touch' || pointerDown) return
      pointerInside = true
      const button = buttonFrom(event.target)
      const next = button && list.contains(button) ? button : null
      if (hovered === next) return
      hovered = next
      render()
    }

    const endDrag = (event: PointerEvent) => {
      if (!pointerDown || event.pointerId !== pointerId) return
      const moved = dragging
      pointerDown = false
      dragging = false
      list.classList.remove('is-grabbing')
      if (list.hasPointerCapture(event.pointerId)) list.releasePointerCapture(event.pointerId)
      pointerInside = pointerWithin(event)
      hovered = null
      if (!moved) {
        if (pressTarget && !animating) {
          suppressClick = true
          select(Number(pressTarget.dataset.strategyIndex))
        }
        render()
        return
      }
      suppressClick = true
      if (reduced) {
        scrollAngle = 0
        showImmediate(currentIdx)
        render()
        return
      }
      const steps = Math.round(scrollAngle / stepDeg)
      const leftover = scrollAngle - steps * stepDeg
      settleIndex(currentIdx + steps)
      scrollAngle = leftover
      showCenteredCopy(currentIdx)
      animateSnap()
    }

    // The page's drag took the pointer (a sideways drag that started here):
    // settle any spin, but never treat it as a press on an option.
    const onLostCapture = (event: PointerEvent) => {
      if (!pointerDown || event.pointerId !== pointerId) return
      if (dragging) {
        endDrag(event)
        return
      }
      pointerDown = false
      pressTarget = null
      list.classList.remove('is-grabbing')
      render()
    }

    const onPointerLeave = () => {
      if (pointerDown) return
      pointerInside = false
      hovered = null
      setSweepPaused(offscreen)
      render()
    }

    const onClick = (event: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false
        return
      }
      if (animating) return
      const button = buttonFrom(event.target)
      if (!button) return
      select(Number(button.dataset.strategyIndex))
    }

    const onFocusIn = (event: FocusEvent) => {
      if (!buttonFrom(event.target)) return
      keyFocus = true
    }

    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget
      if (next instanceof Node && list.contains(next)) return
      keyFocus = false
    }

    const onKeyDown = (event: KeyboardEvent) => {
      let next = -1
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        next = (desiredIdx + 1) % optionCount
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        next = (desiredIdx + optionCount - 1) % optionCount
      } else if (event.key === 'Home') {
        next = 0
      } else if (event.key === 'End') {
        next = optionCount - 1
      } else {
        return
      }
      event.preventDefault()
      select(next)
      for (const button of buttons) button.classList.remove('is-key-focus')
      const nextButton = list.querySelector<HTMLButtonElement>(
        `[data-strategy-index="${next}"][data-strategy-copy="1"]`,
      )
      nextButton?.focus({ focusVisible: true })
      nextButton?.classList.add('is-key-focus')
    }

    const onMotion = () => {
      reduced = reducedMotion.matches
      if (!reduced) return
      cancelAnimationFrame(spinFrame)
      spinGen += 1
      cancelNudge()
      animating = false
      settleIndex(desiredIdx)
      scrollAngle = 0
      clearAllSweeps()
      showImmediate(desiredIdx)
      render()
    }

    const measure = () => {
      halfLine = (buttons[0]?.offsetHeight || 25.6) / 2
      specs = buildSpecs(stack.clientWidth || 272)
      const besideList = list.offsetHeight > frame.clientHeight * 0.8
      if (besideList) {
        const span = specs.farBottom.y - specs.farTop.y + specs.farBottom.h
        const inset = 12
        stack.style.height = `${span}px`
        centerY = inset + span / 2
      } else {
        stack.style.height = ''
        centerY = (list.offsetHeight || 250) / 2
      }
      arrow.style.top = `${centerY}px`
      if (!stackBusy) paintSlots(false)
      render()
    }

    for (const button of buttons) {
      const primary = button.dataset.strategyCopy === '1'
      button.tabIndex = primary && button.dataset.strategyIndex === '0' ? 0 : -1
      if (primary) button.setAttribute('role', 'option')
      else button.setAttribute('aria-hidden', 'true')
    }

    showImmediate(0)
    measure()
    syncAria()
    triggerSweep()

    const tickTimer = (now: number) => {
      if (cancelled) return
      list.classList.toggle('is-turning', animating || pointerDown)
      const paused = reduced || pointerInside || pointerDown || keyFocus || offscreen || animating
      if (!paused) timerElapsed += now - timerLast
      timerLast = now
      if (timerElapsed >= cycleMs()) {
        timerElapsed = 0
        select((desiredIdx + 1) % optionCount, autoSpinMs)
      }
      timerFrame = requestAnimationFrame(tickTimer)
    }

    list.addEventListener('pointerdown', onPointerDown)
    list.addEventListener('pointerenter', onPointerEnter)
    list.addEventListener('pointermove', onPointerMove)
    list.addEventListener('pointerup', endDrag)
    list.addEventListener('pointercancel', endDrag)
    list.addEventListener('lostpointercapture', onLostCapture)
    list.addEventListener('pointerleave', onPointerLeave)
    list.addEventListener('click', onClick)
    list.addEventListener('focusin', onFocusIn)
    list.addEventListener('focusout', onFocusOut)
    list.addEventListener('keydown', onKeyDown)
    reducedMotion.addEventListener('change', onMotion)
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    // A neighbouring column's sliver doesn't need the wheel turning.
    const visibility = new IntersectionObserver(([entry]) => {
      offscreen = (entry?.intersectionRatio ?? 0) < 0.25
      setSweepPaused(offscreen || pointerInside)
      cancelAnimationFrame(timerFrame)
      timerFrame = 0
      if (!offscreen) {
        timerLast = performance.now()
        timerFrame = requestAnimationFrame(tickTimer)
      }
    }, { threshold: [0, 0.25] })
    visibility.observe(frame)

    return () => {
      cancelled = true
      cancelAnimationFrame(spinFrame)
      cancelAnimationFrame(nudgeFrame)
      cancelAnimationFrame(sweepFrame)
      cancelAnimationFrame(timerFrame)
      for (const timer of timers) window.clearTimeout(timer)
      observer.disconnect()
      for (const button of buttons) clearSweep(button)
      visibility.disconnect()
      list.removeEventListener('pointerdown', onPointerDown)
      list.removeEventListener('pointerenter', onPointerEnter)
      list.removeEventListener('pointermove', onPointerMove)
      list.removeEventListener('pointerup', endDrag)
      list.removeEventListener('pointercancel', endDrag)
      list.removeEventListener('lostpointercapture', onLostCapture)
      list.removeEventListener('pointerleave', onPointerLeave)
      list.removeEventListener('click', onClick)
      list.removeEventListener('focusin', onFocusIn)
      list.removeEventListener('focusout', onFocusOut)
      list.removeEventListener('keydown', onKeyDown)
      reducedMotion.removeEventListener('change', onMotion)
    }
  }, [])

  return (
    <section
      className="design-strategy project-card"
      data-hover-tile=""
      data-repel=""
      aria-labelledby="design-strategy-title"
    >
      <div className="project-card-surface">
        <div className="project-card-header">
          <h2 id="design-strategy-title" className="design-strategy-title project-card-label">
            <span className="project-card-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M8.3475 4.66667L11.6958 10.465M5.6525 4.66667H12.3492M4.305 7L7.65333 1.20167M5.6525 9.33333L2.30417 3.535M8.3475 9.33333H1.65083M9.695 7L6.34667 12.7983M12.8333 7C12.8333 10.2217 10.2217 12.8333 7 12.8333C3.77834 12.8333 1.16667 10.2217 1.16667 7C1.16667 3.77834 3.77834 1.16667 7 1.16667C10.2217 1.16667 12.8333 3.77834 12.8333 7Z"
                  stroke="currentColor"
                  strokeWidth="0.583333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Design Strategy
          </h2>
          <ShippedBadge />
        </div>
        <div className="design-strategy-frame" ref={frameRef}>
          <div className="design-strategy-panel">
            <StrategyOptionList listRef={listRef} />
            <div className="strategy-arrow" ref={arrowRef}>
              <StrategyArrow />
            </div>
            <StrategyCardStack stackRef={stackRef} cardRefs={cardRefs} />
          </div>
        </div>
      </div>
      <p ref={statusRef} className="design-strategy-status" aria-live="polite" />
    </section>
  )
}
