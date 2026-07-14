import { motion } from 'framer-motion'

/* ─── Skeleton Screen (replaces spinner) ─── */
export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-4" role="status">
      {/* Skeleton cards mimicking quiz card layout */}
      <div className="grid w-full max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-surface-elevated"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {/* Image skeleton */}
            <div className="skeleton aspect-[16/9] rounded-none" />
            {/* Content skeleton */}
            <div className="space-y-3 p-4">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="skeleton h-10 rounded-lg" />
                <div className="skeleton h-10 rounded-lg" />
              </div>
              <div className="skeleton h-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  )
}

/* ─── Compact Skeleton for inline loading (e.g. leaderboard) ─── */
export function InlineSkeleton({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-12" role="status">
      <motion.div
        className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-600"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        aria-hidden
      />
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  )
}

/* ─── Empty State with illustration ─── */
export function EmptyState({ title, description, action }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-surface-elevated px-6 py-12 text-center">
      {/* Large illustrative emoji */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/30"
      >
        <span className="text-3xl" aria-hidden>📭</span>
      </motion.div>
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
