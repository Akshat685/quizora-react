import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import quizData from '../data/quiz.json'
import Leaderboard from '../components/Leaderboard'
import { EmptyState } from '../components/LoadingState'
import { computeResults, performanceMessage } from '../utils/quiz'
import { unlockAudio, sounds } from '../lib/sounds'

/* ─── Count-up number hook ─── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }
    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return value
}

/* ─── Animated character reveal ─── */
function AnimatedText({ text, className }) {
  const words = text.split(' ')
  return (
    <motion.p className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.08, duration: 0.35 }}
          className="inline-block"
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.p>
  )
}

/* ─── Stat card with icon ─── */
function StatCard({ icon, label, value, delay = 0 }) {
  const count = useCountUp(typeof value === 'number' ? value : parseInt(value, 10) || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay }}
      className="rounded-xl border border-border/60 bg-surface px-3 py-3 text-center"
    >
      <span className="text-lg" aria-hidden>{icon}</span>
      <dt className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="font-display text-xl font-bold text-ink">{count}</dd>
    </motion.div>
  )
}

export default function ResultsPage() {
  const { quizId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [reviewOpen, setReviewOpen] = useState(false)

  const fallbackQuiz = useMemo(
    () => quizData.quizzes.find((q) => q.id === quizId) ?? null,
    [quizId],
  )

  const session = location.state?.session ?? fallbackQuiz
  const answers = location.state?.answers

  const results = useMemo(() => {
    if (!session || !answers) return null
    return computeResults(answers, session)
  }, [session, answers])

  useEffect(() => {
    if (!results) return
    unlockAudio()
    if (results.percentage >= 80) {
      const end = Date.now() + 1800
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#0d9488', '#f59e0b', '#14b8a6', '#fbbf24'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#0d9488', '#f59e0b', '#14b8a6', '#fbbf24'],
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
      sounds.complete()
    }
  }, [results])

  if (!session || !answers || !results) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="No results to show"
          description="Finish a quiz first to see your score."
          action={
            <Link
              to={fallbackQuiz ? `/quiz/${fallbackQuiz.id}` : '/'}
              className="inline-flex rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white no-underline"
            >
              {fallbackQuiz ? 'Play this quiz' : 'Browse quizzes'}
            </Link>
          }
        />
      </div>
    )
  }

  const message = performanceMessage(results.percentage)
  const ringColor =
    results.percentage >= 80
      ? 'stroke-brand-500'
      : results.percentage >= 60
        ? 'stroke-accent-500'
        : 'stroke-danger'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-surface-elevated p-6 text-center shadow-sm sm:p-10"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Results · {session.title}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Quiz complete
        </h1>

        {/* Animated percentage ring */}
        <div className="relative mx-auto mt-8 flex h-36 w-36 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="42" fill="none" className="stroke-border" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={ringColor}
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{
                strokeDashoffset: ((100 - results.percentage) / 100) * 2 * Math.PI * 42,
              }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-extrabold text-ink">
              {results.percentage}%
            </span>
          </div>
        </div>

        {/* Animated performance message */}
        <AnimatedText
          text={message}
          className="mt-4 text-lg font-medium text-ink-muted"
        />

        {/* Stats grid with icons and count-up */}
        <dl className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon="🏆" label="Score" value={results.score} delay={0} />
          <StatCard icon="✅" label="Correct" value={results.correct} delay={0.08} />
          <StatCard icon="❌" label="Wrong" value={results.wrong} delay={0.16} />
          <StatCard icon="⭐" label="Max pts" value={results.totalPoints} delay={0.24} />
        </dl>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              unlockAudio()
              sounds.click()
              navigate(`/quiz/${session.id}`, {
                replace: true,
                state: { restartToken: Date.now() },
              })
            }}
            className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            Play Again
          </button>
          <Link
            to="/"
            onClick={() => {
              unlockAudio()
              sounds.click()
            }}
            className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-ink no-underline transition hover:border-brand-400"
          >
            All quizzes
          </Link>
        </div>
      </motion.section>

      {/* ─── Answer Review Section ─── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6"
      >
        <button
          type="button"
          onClick={() => setReviewOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface-elevated px-5 py-4 text-left transition hover:border-brand-400 sm:px-6"
        >
          <div>
            <h2 className="font-display text-lg font-bold text-ink">📋 Review Answers</h2>
            <p className="text-sm text-ink-muted">See which questions you got right or wrong</p>
          </div>
          <motion.span
            animate={{ rotate: reviewOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-xl text-ink-muted"
            aria-hidden
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence>
          {reviewOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-3">
                {session.questions.map((q, qi) => {
                  const answer = answers[q.id]
                  const userPick = answer?.selected
                  const isCorrect = answer?.isCorrect ?? false

                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: qi * 0.04 }}
                      className={`rounded-xl border p-4 sm:p-5 ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                          : 'border-red-200 bg-red-50/50 dark:border-red-800/40 dark:bg-red-950/20'
                      }`}
                    >
                      <div className="mb-2 flex items-start gap-2">
                        <span className="mt-0.5 text-base" aria-hidden>
                          {isCorrect ? '✅' : '❌'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-ink-muted">
                            Question {qi + 1} · {q.points} pts
                          </p>
                          <p className="font-display text-sm font-bold leading-snug text-ink sm:text-base">
                            {q.question}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1.5 pl-7">
                        {userPick && !isCorrect && (
                          <p className="flex items-center gap-2 text-sm">
                            <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden />
                            <span className="text-ink-muted">Your answer:</span>
                            <span className="font-medium text-red-700 dark:text-red-300 line-through decoration-red-400/50">
                              {userPick}
                            </span>
                          </p>
                        )}
                        <p className="flex items-center gap-2 text-sm">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                          <span className="text-ink-muted">Correct answer:</span>
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            {q.correctAnswer}
                          </span>
                        </p>
                        {!userPick && (
                          <p className="text-xs italic text-ink-muted">No answer (time expired)</p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ─── Leaderboard ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <Leaderboard
          quizId={session.id}
          quizTitle={session.title}
          score={results.score}
          percentage={results.percentage}
        />
      </motion.div>
    </div>
  )
}
