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

      {/* Before state: tiled logo rows scrolling in alternating directions */}
      {!ascended && (
        <div className="absolute inset-0" style={{ opacity: 0.25 }}>
          {Array.from({ length: 12 }).map((_, row) => (
            <div
              key={row}
              style={{
                height: `${100 / 12}%`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '200%',
                  height: '100%',
                  backgroundImage: 'url(/bonesmash-tile.png)',
                  backgroundSize: '150px 100%',
                  backgroundRepeat: 'repeat-x',
                  willChange: 'transform',
                  animation: `scrollTile ${23 + (row % 5) * 3}s linear infinite ${row % 2 === 0 ? 'normal' : 'reverse'}`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Ascended state: scrolling text */}
      {ascended && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: 0.25 }}
        >
          {Array.from({ length: 30 }).map((_, row) => (
            <div
              key={row}
              className="whitespace-nowrap"
              style={{
                fontFamily: "Impact, 'Arial Black', sans-serif",
                fontSize: '1.4rem',
                color: '#FFFFFF',
                lineHeight: '2rem',
                letterSpacing: '-0.05em',
                animation: `scrollBg ${25 + (row % 5) * 3}s linear infinite ${row % 2 === 0 ? 'normal' : 'reverse'}`,
              }}
            >
              {Array(40).fill('ASCENDED · ').join('')}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes scrollTile {
          from {
            transform: translateX(0px) translateZ(0);
          }
          to {
            transform: translateX(-150px) translateZ(0);
          }
        }
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
