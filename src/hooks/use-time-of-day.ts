"use client"

import { useEffect, useState } from "react"

/** Return true between 20:00 and 05:59 local time */
export function useTimeOfDay() {
  const [isNight, setIsNight] = useState(false)

  useEffect(() => {
    function check() {
      const hour = new Date().getHours()
      setIsNight(hour < 6 || hour >= 20)
    }
    check()

    // Re-check at the next boundary (6:00 or 20:00)
    const now = new Date()
    const h = now.getHours()
    const next6 = new Date(now)
    next6.setHours(6, 0, 0, 0)
    if (h >= 6) next6.setDate(next6.getDate() + 1)
    const next20 = new Date(now)
    next20.setHours(20, 0, 0, 0)
    if (h >= 20) next20.setDate(next20.getDate() + 1)

    const msToNext = Math.min(next6.getTime() - now.getTime(), next20.getTime() - now.getTime())
    const timer = setTimeout(check, msToNext + 1000) // +1s safety margin

    return () => clearTimeout(timer)
  }, [])

  return isNight
}
