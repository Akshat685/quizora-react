import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import quizData from '../data/quiz.json'
import ProgressBar from '../components/ProgressBar'
import Timer from '../components/Timer'
import OptionButton from '../components/OptionButton'
import LoadingState, { EmptyState } from '../components/LoadingState'
import { useCountdown } from '../hooks/useCountdown'
import { prepareQuiz, scoreAnswer } from '../utils/quiz'
import { unlockAudio, sounds } from '../lib/sounds'

const FEEDBACK_DELAY = 1200 // ms to show correct/wrong before advancing

export default function QuizPlayerPage() {
  const { quizId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const baseQuiz = useMemo(
    () => quizData.quizzes.find((q) => q.id === quizId) ?? null,
    [quizId],
  )

  // Forces a reshuffle / clean restart on Play Again
  const restartToken = location.state?.restartToken ?? location.key

  const [session, setSession] = useState(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState({})
  const [locked, setLocked] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const lockedRef = useRef(false)
  const selectedRef = useRef(null)
  const answersRef = useRef({})
  const indexRef = useRef(0)
  const sessionRef = useRef(session)
  const advanceTimeoutRef = useRef(null)

  useEffect(() => {
    lockedRef.current = locked
  }, [locked])

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) window.clearTimeout(advanceTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!baseQuiz) {
      setSession(null)
      return
    }
    const prepared = prepareQuiz(baseQuiz)
    setSession(prepared)
    sessionRef.current = prepared
    setIndex(0)
    indexRef.current = 0
    setSelected(null)
    selectedRef.current = null
    setAnswers({})
    answersRef.current = {}
    setLocked(false)
    lockedRef.current = false
    setShowFeedback(false)
  }, [baseQuiz, restartToken])

  const question = session?.questions[index]
  const total = session?.questions.length ?? 0
  const timeLimit = session?.timePerQuestion ?? 15

  const advance = useCallback(
    (choice) => {
      const currentSession = sessionRef.current
      if (!currentSession || lockedRef.current) return

      const currentIndex = indexRef.current
      const currentQuestion = currentSession.questions[currentIndex]
      if (!currentQuestion) return

      lockedRef.current = true
      setLocked(true)

      const result = scoreAnswer(choice, currentQuestion.correctAnswer, currentQuestion.points)
      const nextAnswers = {
        ...answersRef.current,
        [currentQuestion.id]: {
          selected: choice,
          ...result,
        },
      }
      answersRef.current = nextAnswers
      setAnswers(nextAnswers)

      if (choice && result.isCorrect) sounds.correct()
      else if (choice) sounds.wrong()

      // Show correct/wrong feedback before advancing
      setShowFeedback(true)

      const isLast = currentIndex >= currentSession.questions.length - 1

      if (advanceTimeoutRef.current) window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = window.setTimeout(() => {
        advanceTimeoutRef.current = null
        setShowFeedback(false)

        if (isLast) {
          sounds.complete()
          navigate(`/quiz/${currentSession.id}/results`, {
            replace: true,
            state: {
              quizId: currentSession.id,
              answers: nextAnswers,
              session: currentSession,
            },
          })
        } else {
          const nextIndex = currentIndex + 1
          indexRef.current = nextIndex
          setIndex(nextIndex)
          selectedRef.current = null
          setSelected(null)
          lockedRef.current = false
          setLocked(false)
        }
      }, FEEDBACK_DELAY)
    },
    [navigate],
  )

  const onExpire = useCallback(() => {
    advance(selectedRef.current)
  }, [advance])

  const onTick = useCallback((secs) => {
    if (secs <= 3) sounds.tick()
  }, [])

  const { remaining } = useCountdown(timeLimit, {
    enabled: Boolean(session && question && !locked),
    resetKey: question?.id,
    onExpire,
    onTick,
  })

  useEffect(() => {
    function onKey(e) {
      const currentSession = sessionRef.current
      if (!currentSession || lockedRef.current) return
      const currentQuestion = currentSession.questions[indexRef.current]
      if (!currentQuestion) return

      const key = e.key
      if (['1', '2', '3', '4'].includes(key)) {
        const opt = currentQuestion.options[Number(key) - 1]
        if (opt) {
          e.preventDefault()
          unlockAudio()
          selectedRef.current = opt
          setSelected(opt)
          sounds.select()
        }
      } else if (key === 'Enter' || key === ' ') {
        if (selectedRef.current) {
          e.preventDefault()
          unlockAudio()
          advance(selectedRef.current)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  if (!baseQuiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="Quiz not found"
          description="That quiz ID does not exist in quiz.json."
          action={
            <Link
              to="/"
              className="inline-flex rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white no-underline"
            >
              Back to quizzes
            </Link>
          }
        />
      </div>
    )
  }

  if (!session || !question) {
    return <LoadingState message="Preparing quiz…" />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {session.category}
          </p>
          <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">{session.title}</h1>
        </div>
        <Link
          to="/"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted no-underline transition hover:border-brand-400 hover:text-ink"
          onClick={() => unlockAudio()}
        >
          Exit
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        <ProgressBar current={index + 1} total={total} />
        <Timer remaining={remaining} total={timeLimit} resetKey={question.id} />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm sm:p-7"
        >
          {/* Question number watermark */}
          <span
            className="pointer-events-none absolute right-4 top-2 select-none font-display text-[6rem] font-black leading-none text-ink/[0.04] sm:text-[8rem]"
            aria-hidden
          >
            Q{index + 1}
          </span>

          <p className="mb-2 text-xs font-medium text-ink-muted">
            {question.points} points · no going back
          </p>
          <h2 className="relative font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
            {question.question}
          </h2>

          <div className="mt-6 grid gap-3" role="group" aria-label="Answer options">
            {question.options.map((opt, i) => (
              <OptionButton
                key={`${question.id}-${opt}`}
                label={opt}
                index={i}
                selected={selected === opt}
                disabled={locked}
                showResult={showFeedback}
                correctAnswer={question.correctAnswer}
                onSelect={() => {
                  if (lockedRef.current) return
                  unlockAudio()
                  selectedRef.current = opt
                  setSelected(opt)
                  sounds.select()
                }}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Hide keyboard hints on mobile */}
            <p className="hidden text-xs text-ink-muted sm:block">Keys: 1–4 select · Enter next</p>
            <button
              type="button"
              disabled={!selected || locked}
              onClick={() => {
                unlockAudio()
                advance(selectedRef.current)
              }}
              className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {index >= total - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  )
}
