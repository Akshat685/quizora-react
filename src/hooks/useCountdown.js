import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Countdown that restarts when `seconds` or `resetKey` changes.
 * Calls onExpire once when it hits zero (guarded against double-fire).
 */
export function useCountdown(seconds, { enabled = true, resetKey, onExpire, onTick } = {}) {
  const [remaining, setRemaining] = useState(seconds)
  const expiredRef = useRef(false)
  const remainingRef = useRef(seconds)
  const onExpireRef = useRef(onExpire)
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  // When the question changes (resetKey) or time limit changes, reset the timer.
  useEffect(() => {
    expiredRef.current = false
    remainingRef.current = seconds
    setRemaining(seconds)
  }, [seconds, resetKey])

  // Keep a single stable interval; restart only when enabled/resetKey/seconds change.
  useEffect(() => {
    if (!enabled || seconds <= 0) return undefined

    const id = window.setInterval(() => {
      const next = remainingRef.current - 1
      remainingRef.current = next
      setRemaining(next)

      if (next <= 5 && next > 0) onTickRef.current?.(next)

      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current?.()
      }
    }, 1000)

    return () => window.clearInterval(id)
  }, [enabled, seconds, resetKey])

  const reset = useCallback(() => {
    expiredRef.current = false
    remainingRef.current = seconds
    setRemaining(seconds)
  }, [seconds])

  return { remaining, reset }
}
