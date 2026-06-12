const LOGO_PATHS = {
  lastpass:        '/assets/lastpass.png',
  officient:       '/assets/officient.png',
  slack:           '/assets/slack.png',
  productive:      '/assets/productive.png',
  figma:           '/assets/figma.jpg',
  miro:            '/assets/miro.svg',
  adobe:           '/assets/creative_cloud.png',
  github:          '/assets/github.webp',
  'google-slides': '/assets/google%20slides.avif',
  pipedrive:       '/assets/pipedrive.png',
  intercom:        '/assets/intercom.jpg',
}

export function SetupLogo({ logo, name, className = '' }) {
  const src = LOGO_PATHS[logo]
  if (!src) return null
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden border border-[#E1E7E7] bg-white ${className}`}
    >
      <img
        src={src}
        alt={name || logo}
        className="w-full h-full object-cover"
      />
    </span>
  )
}
