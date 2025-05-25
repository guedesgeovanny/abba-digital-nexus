
import { useState, useEffect, useCallback } from 'react'

interface UseQRCodeTimerProps {
  duration?: number
  onExpire?: () => void
  onTick?: () => Promise<void>
  isActive: boolean
}

export const useQRCodeTimer = ({ 
  duration = 60, 
  onExpire, 
  onTick,
  isActive 
}: UseQRCodeTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isExpired, setIsExpired] = useState(false)

  const resetTimer = useCallback(() => {
    setTimeLeft(duration)
    setIsExpired(false)
  }, [duration])

  useEffect(() => {
    if (!isActive) {
      return
    }

    if (timeLeft <= 0 && !isExpired) {
      setIsExpired(true)
      onExpire?.()
      return
    }

    const timer = setInterval(async () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true)
          onExpire?.()
          return 0
        }
        return prev - 1
      })

      // Executar onTick a cada 3 segundos para fazer polling
      if (onTick && timeLeft % 3 === 0) {
        await onTick()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isActive, isExpired, onExpire, onTick])

  // Reset timer when becoming active
  useEffect(() => {
    if (isActive) {
      resetTimer()
    }
  }, [isActive, resetTimer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    timeLeft,
    isExpired,
    resetTimer,
    formattedTime: formatTime(timeLeft)
  }
}
