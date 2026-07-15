import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import LoadingState from './components/LoadingState'
import HomePage from './pages/HomePage'

const QuizPlayerPage = lazy(() => import('./pages/QuizPlayerPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))

export default function App() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Suspense fallback={<LoadingState message="Loading page…" />}>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/quiz/:quizId" element={<QuizPlayerPage />} />
                <Route path="/quiz/:quizId/results" element={<ResultsPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Enhanced footer */}
      <footer className="border-t border-border/80 py-5 text-center transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-ink-muted">
            <span className="font-semibold text-ink">Quizora</span>{' '}
            · Built with <span className="text-red-500">❤</span> & React
          </p>
          <span className="text-xs text-ink-muted/60">© 2026 · Akshat Shettigar</span>
        </div>
      </footer>
    </div>
  )
}
