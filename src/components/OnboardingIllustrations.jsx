import { useState } from 'react'

const DOT_R = 1.2
const STEP = 5
const DOT_COLOR = '#243F3F'

function Dot({ x, y }) {
  return <circle cx={x * STEP + STEP / 2} cy={y * STEP + STEP / 2} r={DOT_R} fill={DOT_COLOR} />
}

function DotsFromCoords({ coords, keyPrefix = '' }) {
  return coords.map(([x, y], i) => <Dot key={`${keyPrefix}${i}`} x={x} y={y} />)
}

function rectDots(x1, y1, x2, y2) {
  const dots = []
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      dots.push([x, y])
  return dots
}

function circleDots(cx, cy, r) {
  const dots = []
  for (let y = cy - r - 1; y <= cy + r + 1; y++)
    for (let x = cx - r - 1; x <= cx + r + 1; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      if (d >= r - 0.6 && d <= r + 0.6) dots.push([x, y])
    }
  return dots
}

function filledCircleDots(cx, cy, r) {
  const dots = []
  for (let y = cy - r - 1; y <= cy + r + 1; y++)
    for (let x = cx - r - 1; x <= cx + r + 1; x++) {
      if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= r) dots.push([x, y])
    }
  return dots
}

function lineDots(x1, y1, x2, y2) {
  const dots = []
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps
    dots.push([Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t)])
  }
  return dots
}

export function IllustrationDay1({ size = 180 }) {
  const id = 'walk'
  const bx = 18

  const head = filledCircleDots(bx + 1, 5, 3)
  const neck = [[bx, 9], [bx + 1, 9]]
  const torso = [
    ...rectDots(bx - 2, 10, bx + 2, 11),
    ...rectDots(bx - 3, 12, bx + 2, 13),
    ...rectDots(bx - 3, 14, bx + 1, 15),
    ...rectDots(bx - 3, 16, bx + 1, 17),
    ...rectDots(bx - 2, 18, bx + 1, 19),
    ...rectDots(bx - 2, 20, bx + 0, 21),
  ]

  const ground = []
  for (let x = 2; x <= 34; x++) ground.push([x, 33])

  const bodyDots = [...head, ...neck, ...torso, ...ground]

  const frontLegA = [...lineDots(bx, 22, bx + 3, 26), ...lineDots(bx + 3, 26, bx + 5, 32)]
  const backLegA = [...lineDots(bx - 1, 22, bx - 4, 27), ...lineDots(bx - 4, 27, bx - 3, 32)]
  const frontArmA = [...lineDots(bx + 2, 12, bx + 5, 17)]
  const backArmA = [...lineDots(bx - 3, 12, bx - 6, 17)]
  const frontFootA = [[bx + 5, 32], [bx + 6, 32], [bx + 7, 32]]
  const backFootA = [[bx - 3, 32], [bx - 4, 32], [bx - 5, 32]]

  const frontLegB = [...lineDots(bx, 22, bx + 1, 27), ...lineDots(bx + 1, 27, bx + 1, 32)]
  const backLegB = [...lineDots(bx - 1, 22, bx - 1, 27), ...lineDots(bx - 1, 27, bx, 32)]
  const frontArmB = [...lineDots(bx + 2, 12, bx + 2, 17)]
  const backArmB = [...lineDots(bx - 3, 12, bx - 3, 17)]
  const frontFootB = [[bx + 1, 32], [bx + 2, 32]]
  const backFootB = [[bx, 32], [bx - 1, 32]]

  const frontLegC = [...lineDots(bx, 22, bx - 3, 26), ...lineDots(bx - 3, 26, bx - 4, 32)]
  const backLegC = [...lineDots(bx - 1, 22, bx + 3, 27), ...lineDots(bx + 3, 27, bx + 4, 32)]
  const frontArmC = [...lineDots(bx + 2, 12, bx - 1, 17)]
  const backArmC = [...lineDots(bx - 3, 12, bx, 17)]
  const frontFootC = [[bx - 4, 32], [bx - 5, 32], [bx - 6, 32]]
  const backFootC = [[bx + 4, 32], [bx + 5, 32], [bx + 6, 32]]

  const frames = [
    { legs: [...frontLegA, ...backLegA, ...frontFootA, ...backFootA], arms: [...frontArmA, ...backArmA] },
    { legs: [...frontLegB, ...backLegB, ...frontFootB, ...backFootB], arms: [...frontArmB, ...backArmB] },
    { legs: [...frontLegC, ...backLegC, ...frontFootC, ...backFootC], arms: [...frontArmC, ...backArmC] },
    { legs: [...frontLegB, ...backLegB, ...frontFootB, ...backFootB], arms: [...frontArmB, ...backArmB] },
  ]

  const frameDuration = 0.4
  const totalDuration = frames.length * frameDuration

  return (
    <svg width={size} height={size} viewBox={`0 0 ${36 * STEP} ${36 * STEP}`} fill="none">
      <style>{`
        .${id}-frame { opacity: 0; }
        ${frames.map((_, i) => `
          .${id}-f${i} {
            animation: ${id}-show${i} ${totalDuration}s steps(1) infinite;
          }
          @keyframes ${id}-show${i} {
            ${(i / frames.length * 100).toFixed(1)}% { opacity: 1; }
            ${((i + 1) / frames.length * 100).toFixed(1)}% { opacity: 0; }
          }
        `).join('')}
      `}</style>

      <DotsFromCoords coords={bodyDots} keyPrefix="body-" />

      {frames.map((frame, i) => (
        <g key={i} className={`${id}-frame ${id}-f${i}`}>
          <DotsFromCoords coords={[...frame.legs, ...frame.arms]} keyPrefix={`f${i}-`} />
        </g>
      ))}
    </svg>
  )
}

export function IllustrationWeek1({ size = 180 }) {
  const cols = Math.floor(size / STEP)
  const rows = cols
  const dots = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = cols / 2
      const cy = rows / 2

      const isFuselage = Math.abs(y - cy) <= 1 && x >= cx - 8 && x <= cx + 8
      const isNose = y === Math.round(cy) && x >= cx + 8 && x <= cx + 11
      const isCockpit = y === Math.round(cy) - 1 && x >= cx + 6 && x <= cx + 8
      const isTopWing = y >= cy - 5 && y <= cy - 2 && x >= cx - 5 && x <= cx + 4
      const isBotWing = y >= cy + 2 && y <= cy + 5 && x >= cx - 4 && x <= cx + 3
      const isTailV = x >= cx - 9 && x <= cx - 7 && y >= cy - 5 && y <= cy - 1
      const isTailH = y >= Math.round(cy) - 5 && y <= Math.round(cy) - 4 && x >= cx - 11 && x <= cx - 7
      const isTrail = Math.round(y) === Math.round(cy) && x < cx - 10 && x >= cx - 15 && x % 2 === 0

      if (isFuselage || isNose || isCockpit || isTopWing || isBotWing || isTailV || isTailH || isTrail) {
        dots.push(<Dot key={`${x}-${y}`} x={x} y={y} />)
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {dots}
    </svg>
  )
}

export function IllustrationMonth1({ size = 320 }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: size, height: size, cursor: 'default' }}
    >
      <img
        src={hovered ? `/assets/rocket.gif?t=${Date.now()}` : '/assets/rocket.png'}
        alt="Rocket"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}
