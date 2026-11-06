import './testimonial-card.css'

const testimonial = {
  label: 'Testimonial',
  name: 'Narasimhan Ramaswamy',
  role: 'Partner',
  quote:
    'I wanted to take a moment to appreciate and thank you for the quality of work you have delivered on the Maruti projects. You managed to work effectively under pressure and collaborated seamlessly with larger teams to deliver outcomes in high-visibility engagements. I truly value your skills and your ability to think creatively on the ground.',
} as const

function ApertureMark() {
  return (
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
  )
}

export function TestimonialCard() {
  return (
    <figure className="testimonial-card" data-hover-tile="" data-repel="">
      <div className="testimonial-surface">
        <div className="testimonial-heading">
          <ApertureMark />
          <p className="testimonial-label">{testimonial.label}</p>
        </div>

        <div className="testimonial-body">
          <figcaption className="testimonial-person">
            <span className="testimonial-avatar" aria-hidden="true">
              <span className="testimonial-avatar-face" />
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
