'use client'

interface BackgroundProps {
  ascended?: boolean
}

export default function Background({ ascended = false }: BackgroundProps) {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: ascended ? '#B8860B' : '#080418' }}
    >

      {/* Ascended gold radial glow */}
      {ascended && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,223,0,0.4) 0%, rgba(184,134,11,0.8) 50%, #8B6914 100%)',
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />
      )}

      <div
        className="absolute transition-opacity duration-700"
        style={{
          opacity: ascended ? 0.25 : 0.07,
          top: '-2rem',
          left: 0,
          right: 0,
          bottom: '-2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
        }}
      >
        {Array.from({ length: 30 }).map((_, row) => (
          <div
            key={row}
            className="whitespace-nowrap"
            style={{
              fontFamily: "Impact, 'Arial Black', sans-serif",
              fontSize: '1.4rem',
              color: ascended ? '#FFFFFF' : '#FFD700',
              lineHeight: '2rem',
              letterSpacing: '-0.05em',
              animation: `scrollBg ${20 + row * 2}s linear infinite`,
              animationDirection: row % 2 === 0 ? 'normal' : 'reverse',
            }}
          >
            {ascended
              ? Array(40).fill('ASCENDED · ').join('')
              : Array(32).fill('BONESMASH · ').join('')
            }
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scrollBg {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
