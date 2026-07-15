import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import quizData from '../data/quiz.json'
import QuizCard from '../components/QuizCard'
import { EmptyState } from '../components/LoadingState'

export default function HomePage() {
  const quizzes = useMemo(() => quizData.quizzes ?? [], [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 max-w-2xl"
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
          Timed quizzes · Live ranks
        </p>

        {/* Gradient hero heading with decorative emoji */}
        <div className="flex items-center gap-1">
          <h1 className="text-gradient-brand font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Quizora
          </h1>
          <motion.span
            className="animate-float-slow text-3xl sm:text-4xl"
            aria-hidden
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            ⚡
          </motion.span>
        </div>

        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Pick a quiz, race the clock, and climb the leaderboard. One answer per question — no going
          back.
        </p>
      </motion.section>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes available"
          description="Quiz data could not be loaded. Check src/data/quiz.json."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <QuizCard key={quiz.id} quiz={quiz} index={index} />
          ))}
        </div>
      )}

      {/* Keyboard tip — hidden on mobile */}
      <p className="mt-10 hidden text-center text-xs text-ink-muted sm:block">
        Tip: during a quiz, press <kbd className="rounded border border-border px-1">1</kbd>–
        <kbd className="rounded border border-border px-1">4</kbd> to select and{' '}
        <kbd className="rounded border border-border px-1">Enter</kbd> for Next.
        {' · '}
        <Link to="/" className="text-brand-700 underline-offset-2 hover:underline dark:text-brand-400">
          Home
        </Link>
      </p>
    </div>
  )
}
