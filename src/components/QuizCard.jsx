import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { difficultyStyles } from '../utils/quiz'
import { unlockAudio, sounds } from '../lib/sounds'

export default function QuizCard({ quiz, index = 0 }) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="quiz-card-glow group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm hover:-translate-y-1"
    >
      {/* Thumbnail with richer gradient and fallback */}
      <div className="relative aspect-[16/9] overflow-hidden bg-brand-100 dark:bg-brand-900/40">
        {imgError ? (
          /* Branded fallback for broken images */
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-500">
            <span className="font-display text-4xl font-bold text-white/80" aria-hidden>
              {quiz.title?.charAt(0) ?? 'Q'}
            </span>
          </div>
        ) : (
          <img
            src={quiz.thumbnail}
            alt={`${quiz.title} quiz banner`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}
        {/* Richer gradient overlay with brand tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-brand-900/10 to-transparent" />
        <span
          className={`absolute bottom-3 left-3 rounded-lg px-2.5 py-1 text-xs font-semibold ${difficultyStyles(quiz.difficulty)}`}
        >
          {quiz.difficulty}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {quiz.category}
          </p>
          <h2 className="font-display text-lg font-bold text-ink sm:text-xl">{quiz.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{quiz.description}</p>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-2 text-sm text-ink-muted">
          <div className="rounded-lg bg-surface px-3 py-2">
            <dt className="text-xs uppercase tracking-wide opacity-80">Questions</dt>
            <dd className="font-semibold text-ink">{quiz.totalQuestions}</dd>
          </div>
          <div className="rounded-lg bg-surface px-3 py-2">
            <dt className="text-xs uppercase tracking-wide opacity-80">Time / Q</dt>
            <dd className="font-semibold text-ink">{quiz.timePerQuestion}s</dd>
          </div>
        </dl>

        <Link
          to={`/quiz/${quiz.id}`}
          onClick={() => {
            unlockAudio()
            sounds.click()
          }}
          className="mt-1 inline-flex items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          Play Quiz
        </Link>
      </div>
    </motion.article>
  )
}
