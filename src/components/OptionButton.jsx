import { motion, AnimatePresence } from 'framer-motion'

const KEY_HINTS = ['1', '2', '3', '4']

/**
 * Animated check-mark SVG — stroke draws in on mount.
 */
function AnimatedCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  )
}

/**
 * Animated cross SVG — stroke draws in on mount.
 */
function AnimatedCross() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <motion.path
        d="M6 6l12 12M18 6l-12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function OptionButton({
  label,
  selected,
  disabled,
  onSelect,
  index,
  showResult = false,
  correctAnswer,
}) {
  const isThisCorrect = showResult && label === correctAnswer
  const isThisWrong = showResult && selected && label !== correctAnswer
  const dimmed = showResult && !isThisCorrect && !isThisWrong

  // Build dynamic class string
  let borderBg
  if (isThisCorrect) {
    borderBg =
      'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-500/15 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-400'
  } else if (isThisWrong) {
    borderBg =
      'border-red-500 bg-red-50 text-red-900 shadow-md shadow-red-500/15 dark:bg-red-900/40 dark:text-red-100 dark:border-red-400'
  } else if (selected) {
    borderBg =
      'border-brand-500 bg-brand-50 text-brand-900 shadow-sm dark:bg-brand-900/40 dark:text-brand-100'
  } else {
    borderBg =
      'border-border bg-surface-elevated text-ink hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/20'
  }

  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.97, filter: 'brightness(0.95)' }}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`group relative flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 sm:text-base ${borderBg} ${
        dimmed ? 'opacity-45' : ''
      } ${disabled && !selected && !showResult ? 'opacity-60' : ''} disabled:cursor-not-allowed active:shadow-inner`}
    >
      {/* Key hint badge */}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
          isThisCorrect
            ? 'bg-emerald-600 text-white'
            : isThisWrong
              ? 'bg-red-600 text-white'
              : selected
                ? 'bg-brand-700 text-white'
                : 'bg-surface text-ink-muted group-hover:bg-brand-100 group-hover:text-brand-800 dark:group-hover:bg-brand-800 dark:group-hover:text-brand-100'
        }`}
        aria-hidden
      >
        {KEY_HINTS[index] ?? String.fromCharCode(65 + index)}
      </span>

      {/* Label */}
      <span className="flex-1 leading-snug">{label}</span>

      {/* Status icon — animated checkmark or cross */}
      <AnimatePresence mode="wait">
        {isThisCorrect && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-emerald-600 dark:text-emerald-300"
            aria-hidden
          >
            <AnimatedCheck />
          </motion.span>
        )}
        {isThisWrong && (
          <motion.span
            key="cross"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-red-500 dark:text-red-300"
            aria-hidden
          >
            <AnimatedCross />
          </motion.span>
        )}
        {selected && !showResult && (
          <motion.span
            key="selected-check"
            layoutId="selected-check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-brand-600 dark:text-brand-300"
            aria-hidden
          >
            <AnimatedCheck />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
