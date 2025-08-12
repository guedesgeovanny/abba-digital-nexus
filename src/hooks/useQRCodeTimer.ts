import { useState, useEffect, useRef } from "react"

interface UseQRCodeTimerProps {
  isActive: boolean
  duration: number
  onExpire: () => void
}

export function useQRCodeTimer({ isActive, duration, onExpire }: UseQRCodeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onExpire()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, onExpire])

  const reset = () => {
    setTimeLeft(duration)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isExpired: timeLeft === 0,
    reset
  }
}