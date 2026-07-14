import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getTopScores, submitScore } from '../lib/leaderboard'
import { firebaseReady } from '../lib/firebase'
import { formatDate } from '../utils/quiz'
import { sounds, unlockAudio } from '../lib/sounds'
import { InlineSkeleton } from './LoadingState'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ quizId, quizTitle, score, percentage }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')

  const load = useCallback(async () => {
    if (!firebaseReady) {
      setLoading(false)
      setFetchError('Firebase is not configured yet. Add your .env keys to enable the leaderboard.')
      return
    }
    setLoading(true)
    setFetchError('')
    try {
      const rows = await getTopScores(quizId)
      setEntries(rows)
    } catch (err) {
      console.error(err)
      setFetchError(err.message || 'Could not load leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    unlockAudio()
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitScore({ name, quizId, quizTitle, score, percentage })
      setSubmittedName(name.trim())
      setSubmitted(true)
      sounds.correct()
      await load()
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || 'Failed to save score.')
      sounds.wrong()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Leaderboard</h2>
          <p className="text-sm text-ink-muted">Top 10 · {quizTitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            unlockAudio()
            sounds.click()
            load()
          }}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-brand-400 hover:text-ink"
        >
          Refresh
        </button>
      </div>

      {!submitted && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl bg-surface p-4">
          <label htmlFor="player-name" className="block text-sm font-semibold text-ink">
            Save your score
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              minLength={2}
              maxLength={40}
              required
              disabled={submitting || !firebaseReady}
              className="w-full flex-1 rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-500"
              autoComplete="nickname"
            />
            <button
              type="submit"
              disabled={submitting || !firebaseReady}
              className="rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Submit score'}
            </button>
          </div>
          {submitError && (
            <p className="text-sm text-danger" role="alert">
              {submitError}
            </p>
          )}
          {!firebaseReady && (
            <p className="text-sm text-ink-muted">
              Configure Firebase in <code className="rounded bg-border/60 px-1">.env</code> to
              publish scores. See the README for steps.
            </p>
          )}
        </form>
      )}

      {submitted && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-success dark:bg-emerald-950/40" role="status">
          Score saved — thanks for playing!
        </p>
      )}

      {loading ? (
        <InlineSkeleton message="Loading leaderboard…" />
      ) : fetchError ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <span className="mb-2 block text-2xl" aria-hidden>⚠️</span>
          <p className="text-sm text-ink-muted">{fetchError}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <span className="mb-2 block text-2xl" aria-hidden>🏅</span>
          <p className="text-sm text-ink-muted">No scores yet. Be the first on this board!</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {entries.map((row, i) => {
            // Highlight user's own just-submitted score
            const isUserRow =
              submitted &&
              submittedName &&
              row.name?.trim().toLowerCase() === submittedName.toLowerCase() &&
              row.score === score

            return (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 rounded-xl border px-3 transition-colors ${
                  i === 0
                    ? 'py-3.5 border-accent-400/50 bg-accent-500/5 dark:border-accent-500/30'
                    : 'py-2.5 border-border bg-surface'
                } ${
                  isUserRow
                    ? 'ring-2 ring-brand-400/50 border-brand-400/60 bg-brand-50/50 dark:bg-brand-900/20 dark:border-brand-400/40'
                    : ''
                }`}
              >
                {/* Rank badge: medal emoji for top 3, number for rest */}
                {i < 3 ? (
                  <span
                    className={`flex shrink-0 items-center justify-center text-xl ${
                      i === 0 ? 'h-10 w-10' : 'h-8 w-8'
                    }`}
                    aria-label={`Rank ${i + 1}`}
                  >
                    {MEDALS[i]}
                  </span>
                ) : (
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-border/60 font-display text-sm font-bold text-ink-muted"
                  >
                    {i + 1}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold text-ink ${i === 0 ? 'text-base' : ''}`}>
                    {row.name}
                    {isUserRow && (
                      <span className="ml-2 text-xs font-medium text-brand-600 dark:text-brand-400">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-muted">{formatDate(row.completedAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-display font-bold text-ink ${i === 0 ? 'text-lg' : ''}`}>
                    {row.score} pts
                  </p>
                  <p className="text-xs text-ink-muted">{row.percentage}%</p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
