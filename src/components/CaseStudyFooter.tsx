const linkedInUrl = 'https://www.linkedin.com/in/abhishekkkashidd/'

const profiles = [
  '/case-study-3/profile-1.webp',
  '/case-study-3/profile-2.webp',
  '/case-study-3/profile-3.webp',
  '/case-study-3/profile-4.webp',
  '/case-study-3/profile-5.jpeg',
  '/case-study-3/profile-6.webp',
]

export function CaseStudyFooter({ className = 'cs-footer' }: { className?: string }) {
  return (
    <footer className={className}>
      <p className="thanks">Thank you for stopping by.</p>
      <p className="thanks">If you’re up for collaborating on impact design</p>
      <p className="thanks">
        or just want to chat about design or cycling let’s connect
      </p>
      <ul className="footer-links">
        <li>
          <a href={linkedInUrl}>LinkedIn</a>
        </li>
        <li>Mail</li>
      </ul>
      <p className="partner">
        Looking for a <em>Partner,</em>
      </p>
      <p className="partner">Not just another freelancer</p>
      <p className="connected">
        <a href={linkedInUrl}>14k+ already Connected</a>
      </p>
      <div className="profile-row">
        {profiles.map((src) => (
          <img key={src} src={src} alt="" />
        ))}
      </div>
      <p>
        <a className="connect" href={linkedInUrl}>
          Connect With Me
        </a>
      </p>
      <div className="footer-art">
        <img
          className="scene"
          src="/case-study-3/footer-scene.png"
          alt="Illustration of a monitor on a desk."
        />
        <img className="float a" src="/case-study-3/footer-a.png" alt="" />
        <img className="float b" src="/case-study-3/footer-b.webp" alt="" />
        <img className="float c" src="/case-study-3/footer-c.png" alt="" />
      </div>
    </footer>
  )
}
