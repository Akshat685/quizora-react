/** Fisher–Yates shuffle — returns a new array. */
export function shuffle(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Prepare a quiz session: shuffle questions and each question's options.
 * Correct answer is preserved as a string value, so shuffled options stay valid.
 */
export function prepareQuiz(quiz) {
  const questions = shuffle(quiz.questions).map((q) => ({
    ...q,
    options: shuffle(q.options),
  }))
  return { ...quiz, questions, totalQuestions: questions.length }
}

export function scoreAnswer(selected, correctAnswer, points) {
  if (!selected) return { isCorrect: false, earned: 0 }
  const isCorrect = selected === correctAnswer
  return { isCorrect, earned: isCorrect ? points : 0 }
}

export function computeResults(answers, quiz) {
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)
  let correct = 0
  let wrong = 0
  let score = 0

  quiz.questions.forEach((q) => {
    const answer = answers[q.id]
    if (answer?.isCorrect) {
      correct += 1
      score += answer.earned
    } else {
      wrong += 1
    }
  })

  const percentage = totalPoints === 0 ? 0 : Math.round((score / totalPoints) * 100)

  return {
    score,
    totalPoints,
    correct,
    wrong,
    percentage,
    totalQuestions: quiz.questions.length,
  }
}

export function performanceMessage(percentage) {
  if (percentage >= 90) return 'Outstanding! You crushed it.'
  if (percentage >= 80) return 'Excellent work — nearly perfect.'
  if (percentage >= 60) return 'Good job — solid performance.'
  if (percentage >= 40) return 'Not bad — a little more practice will help.'
  return 'Keep practicing — you will get there!'
}

export function difficultyStyles(difficulty) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'Medium':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
    case 'Hard':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

export function formatDate(value) {
  if (!value) return '—'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
