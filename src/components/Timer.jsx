import { motion } from 'framer-motion'

const RADIUS = 15.5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function progressOffset(remaining, total) {
  if (total === 0 || remaining <= 0) return CIRCUMFERENCE
  return (1 - remaining / total) * CIRCUMFERENCE
}

/**
 * Compute a smooth color based on time remaining percentage.
 * teal → yellow → orange → red
 */
function timerColor(remaining, total) {
  if (total === 0) return 'hsl(168, 80%, 40%)'
  const pct = remaining / total

  if (pct > 0.6) {
    return 'hsl(168, 80%, 40%)'
  } else if (pct > 0.4) {
    const t = (pct - 0.4) / 0.2
    const h = 48 + t * (168 - 48)
    return `hsl(${Math.round(h)}, 85%, 48%)`
  } else if (pct > 0.2) {
    const t = (pct - 0.2) / 0.2
    const h = 28 + t * (48 - 28)
    return `hsl(${Math.round(h)}, 90%, 50%)`
  } else {
    const t = pct / 0.2
    const h = 0 + t * 28
    return `hsl(${Math.round(h)}, 85%, 50%)`
  }
}

export default function Timer({ remaining, total, resetKey }) {
  const urgent = remaining <= 5
  const strokeColor = timerColor(remaining, total)
  const drainTarget = progressOffset(Math.max(0, remaining - 1), total)

  return (
    <motion.div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors duration-300 ${
        urgent
          ? 'border-danger/40 bg-red-50 text-danger dark:bg-red-950/40'
          : 'border-border bg-surface-elevated text-ink'
      }`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${remaining} seconds remaining`}
      animate={urgent ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={
        urgent
          ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.2 }
      }
    >
      <div className="relative h-10 w-10 shrink-0">
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle
            cx="18"
            cy="18"
            r={RADIUS}
            fill="none"
            className="stroke-border"
            strokeWidth="3"
          />
          <motion.circle
            key={resetKey}
            cx="18"
            cy="18"
            r={RADIUS}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ stroke: strokeColor }}
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: progressOffset(total, total) }}
            animate={{ strokeDashoffset: drainTarget }}
            transition={{ duration: remaining > 0 ? 1 : 0, ease: 'linear' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold">
          {remaining}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">Time left</p>
        <p className="font-display text-sm font-semibold sm:text-base">
          {urgent ? 'Hurry!' : 'Answer carefully'}
        </p>
      </div>
    </motion.div>
  )
}
