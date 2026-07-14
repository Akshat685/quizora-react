import { motion } from 'framer-motion'

export default function ProgressBar({ current, total }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)

  return (
    <div className="w-full" aria-label={`Progress: question ${current} of ${total}`}>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-muted sm:text-sm">
        <span>
          Question {current} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
