import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(initialSeconds: number, onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [expired, setExpired] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpireRef = useRef(onExpire)

  onExpireRef.current = onExpire

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    setExpired(false)
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback((newSeconds?: number) => {
    clearTimer()
    setTimeLeft(newSeconds ?? initialSeconds)
    setIsRunning(false)
    setExpired(false)
  }, [initialSeconds, clearTimer])

  useEffect(() => {
    if (!isRunning) {
      clearTimer()
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          setExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [isRunning, clearTimer])

  // Call onExpire outside of setState to avoid async issues
  useEffect(() => {
    if (expired) {
      setExpired(false)
      onExpireRef.current?.()
    }
  }, [expired])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return { timeLeft, isRunning, start, pause, reset }
}
