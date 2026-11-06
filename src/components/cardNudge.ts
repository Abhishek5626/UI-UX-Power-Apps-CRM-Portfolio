/**
 * Pointer nudge shared by the landing page's cards: the pointer's movement pushes the card and
 * a spring brings it back, so it also settles by itself when the pointer leaves.
 * One delegated listener; the frame loop only runs while a card is moving.
 */
const CARD_SELECTOR = [
  '.about-me-card',
  '.project-card',
  '.work-experience',
  '.music-card',
  '.testimonial-card',
].join(', ')

/** Controls inside a card stay still under the pointer, so they're easy to hit. */
const CONTROL_SELECTOR =
  'a, button, input, select, textarea, label, iframe, [role="slider"], [role="button"], [role="tab"]'

const MAX_PX = 8
const MAX_DEG = 1
/** How far a turn may carry a card's far edge, so wide cards turn less than small ones. */
const MAX_TURN_EDGE_PX = 4
const STIFFNESS = 150
const DAMPING = 15
const KICK = 5
const SPIN_KICK = 0.6
const MAX_SPEED = 150
const MAX_SPIN_SPEED = 20
const MAX_DELTA_PX = 40

type Nudge = {
  x: number
  y: number
  spin: number
  speedX: number
  speedY: number
  speedSpin: number
  maxTurn: number
}

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value))

export function startCardNudge() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const moving = new Map<HTMLElement, Nudge>()
  let frame = 0
  let last = 0

  const step = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    moving.forEach((nudge, card) => {
      nudge.speedX += (-STIFFNESS * nudge.x - DAMPING * nudge.speedX) * dt
      nudge.speedY += (-STIFFNESS * nudge.y - DAMPING * nudge.speedY) * dt
      nudge.speedSpin += (-STIFFNESS * nudge.spin - DAMPING * nudge.speedSpin) * dt
      nudge.x += nudge.speedX * dt
      nudge.y += nudge.speedY * dt
      nudge.spin += nudge.speedSpin * dt

      if (
        !card.isConnected ||
        (Math.hypot(nudge.x, nudge.y, nudge.speedX, nudge.speedY) < 0.05 &&
          Math.hypot(nudge.spin, nudge.speedSpin) < 0.01)
      ) {
        card.style.removeProperty('transform')
        card.style.removeProperty('will-change')
        moving.delete(card)
        return
      }
      // tanh eases into the limit, so a hard shove never stops dead at the edge.
      const x = MAX_PX * Math.tanh(nudge.x / MAX_PX)
      const y = MAX_PX * Math.tanh(nudge.y / MAX_PX)
      const turn = nudge.maxTurn * Math.tanh(nudge.spin / nudge.maxTurn)
      card.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${turn.toFixed(3)}deg)`
    })
    frame = moving.size > 0 ? requestAnimationFrame(step) : 0
  }

  const onPointerMove = (event: PointerEvent) => {
    // A held button is a drag or text selection, which belongs to the page.
    if (
      event.pointerType !== 'mouse' ||
      event.buttons !== 0 ||
      (event.movementX === 0 && event.movementY === 0) ||
      !finePointer.matches ||
      reducedMotion.matches ||
      !(event.target instanceof Element)
    ) {
      return
    }
    const card = event.target.closest<HTMLElement>(CARD_SELECTOR)
    if (!card) return
    const control = event.target.closest(CONTROL_SELECTOR)
    // A card that is itself a link still moves; only controls inside it opt out.
    if (control && control !== card && card.contains(control)) return

    const rect = card.getBoundingClientRect()
    let nudge = moving.get(card)
    if (!nudge) {
      const radius = Math.max(rect.width, rect.height) / 2
      nudge = {
        x: 0,
        y: 0,
        spin: 0,
        speedX: 0,
        speedY: 0,
        speedSpin: 0,
        maxTurn: Math.min(MAX_DEG, ((MAX_TURN_EDGE_PX / radius) * 180) / Math.PI),
      }
      moving.set(card, nudge)
      card.style.willChange = 'transform'
    }
    const dx = clamp(event.movementX, MAX_DELTA_PX)
    const dy = clamp(event.movementY, MAX_DELTA_PX)
    const fromCentreX = (event.clientX - rect.left) / rect.width - 0.5
    const fromCentreY = (event.clientY - rect.top) / rect.height - 0.5
    nudge.speedX = clamp(nudge.speedX + dx * KICK, MAX_SPEED)
    nudge.speedY = clamp(nudge.speedY + dy * KICK, MAX_SPEED)
    // An off-centre push turns the card, like one on a real object.
    nudge.speedSpin = clamp(
      nudge.speedSpin + (fromCentreX * dy - fromCentreY * dx) * SPIN_KICK,
      MAX_SPIN_SPEED,
    )
    if (!frame) {
      last = performance.now()
      frame = requestAnimationFrame(step)
    }
  }

  document.addEventListener('pointermove', onPointerMove, { passive: true })
}
