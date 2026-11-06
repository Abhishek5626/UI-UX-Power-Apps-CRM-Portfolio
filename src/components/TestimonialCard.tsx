import './testimonial-card.css'
import { CardIcon } from './CardIcon.tsx'

const testimonial = {
  label: 'Testimonial',
  name: 'Narasimhan Ramaswamy',
  role: 'Partner',
  quote:
    'I wanted to take a moment to appreciate and thank you for the quality of work you have delivered on the Maruti projects. You managed to work effectively under pressure and collaborated seamlessly with larger teams to deliver outcomes in high-visibility engagements. I truly value your skills and your ability to think creatively on the ground.',
} as const

export function TestimonialCard() {
  return (
    <figure className="testimonial-card" data-hover-tile="" data-repel="">
      <div className="testimonial-surface">
        <div className="testimonial-heading">
          <CardIcon name="star" />
          <p className="testimonial-label">{testimonial.label}</p>
        </div>

        <div className="testimonial-body">
          <figcaption className="testimonial-person">
            <span className="testimonial-avatar" aria-hidden="true">
              <img className="testimonial-avatar-face" src="/landing/testimonial-narasimhan.jpg" alt="" width={57} height={57} decoding="async" />
            </span>
            <span className="testimonial-identity">
              <cite className="testimonial-name">{testimonial.name}</cite>
              <span className="testimonial-role">{testimonial.role}</span>
            </span>
          </figcaption>

          <blockquote className="testimonial-quote">
            <p>
              “{testimonial.quote}”
            </p>
          </blockquote>
        </div>
      </div>
    </figure>
  )
}
