import confetti from 'canvas-confetti'

export function explode(style: 'fireworks'|'balloons'|'champagne'|'memes' = 'fireworks') {
  if (style === 'fireworks') {
    const end = Date.now() + 1000
    const frame = () => {
      confetti({
        particleCount: 3,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  } else if (style === 'balloons') {
    confetti({ particleCount: 200, spread: 70 })
  } else if (style === 'champagne') {
    confetti({ particleCount: 80, spread: 20, scalar: 1.2, startVelocity: 60, angle: 60, origin: { x: 0.2, y: 0.9 }})
    confetti({ particleCount: 80, spread: 20, scalar: 1.2, startVelocity: 60, angle: 120, origin: { x: 0.8, y: 0.9 }})
  } else {
    confetti({ particleCount: 120, spread: 90 })
  }
}

export const randomStyle = () =>
  (['fireworks','balloons','champagne','memes'] as const)[Math.floor(Math.random() * 4)]
