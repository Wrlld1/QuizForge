import { useState, useEffect } from 'react'

const LETTERS = 'QuizForge'.split('')

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2500)
    const t2 = setTimeout(() => onDone(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center ${
        fadeOut ? 'animate-splashFadeOut' : ''
      }`}
    >
      {/* Logo text */}
      <h1 className="text-5xl font-bold flex">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className="inline-block animate-letterReveal"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
          >
            {letter}
          </span>
        ))}
      </h1>

      {/* Loading line */}
      <div className="w-48 h-0.5 bg-neutral-800 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full animate-lineLoad" />
      </div>

      {/* Subtitle */}
      <p
        className="text-gray-500 text-sm mt-4 animate-letterReveal"
        style={{ animationDelay: '1000ms', animationFillMode: 'both' }}
      >
        Викторина по веб-технологиям
      </p>
    </div>
  )
}
