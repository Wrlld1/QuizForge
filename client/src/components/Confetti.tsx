import { useState, useEffect, useMemo } from 'react'

const COLORS = ['#a855f7', '#3b82f6', '#22c55e', '#f97316', '#ec4899', '#eab308']
const SHAPES = ['rounded-full', 'rounded-sm']
const COUNT = 45

interface Particle {
  x: number
  y: number
  r: number
  size: number
  color: string
  shape: string
  delay: number
  duration: number
}

function generateParticles(): Particle[] {
  return Array.from({ length: COUNT }, () => ({
    x: Math.random() * 400 - 200,
    y: -(300 + Math.random() * 300),
    r: Math.random() * 720 - 360,
    size: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    delay: Math.random() * 500,
    duration: 1500 + Math.random() * 1000,
  }))
}

export default function Confetti() {
  const [visible, setVisible] = useState(true)
  const particles = useMemo(() => generateParticles(), [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute ${p.shape} animate-confettiFall`}
          style={{
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            '--confetti-x': `${p.x}px`,
            '--confetti-y': `${p.y}px`,
            '--confetti-r': `${p.r}deg`,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
