import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { getDaysInYear, getDiffInDays, getStartOfDay, getStartOfYear } from '@/utils/date'

function computeTimeInfo() {
  const now = new Date()
  const pastDays = getDiffInDays(getStartOfYear(now), now)
  const pastTime = now.getTime() - getStartOfDay(now).getTime()
  return {
    currentYear: now.getFullYear(),
    dayOfYear: pastDays,
    percentOfYear: (pastDays / getDaysInYear(now)) * 100,
    percentOfToday: (pastTime / 86400 / 1000) * 100,
  }
}

export function TimelineProgress({ totalPosts }: { totalPosts: number }) {
  const [timeInfo, setTimeInfo] = useState(computeTimeInfo)

  useEffect(() => {
    const interval = setInterval(() => setTimeInfo(computeTimeInfo()), 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      <p className="mt-4">
        今天是 {timeInfo.currentYear} 年的第 <CountUp to={timeInfo.dayOfYear} decimals={0} /> 天，今年已过 <CountUp to={timeInfo.percentOfYear} decimals={0} />%，今天已过 <CountUp to={timeInfo.percentOfToday} decimals={3} />%
      </p><br></br>
      <p className="text-text-base text-secondary">
        目前共有 <span className="font-medium">{totalPosts}</span> 篇文章
      </p>
    </>
  )
}

function CountUp({
  to,
  decimals,
  duration = 1,
}: {
  to: number
  decimals: number
  duration?: number
}) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const prevRef = useRef(0)

  useEffect(() => {
    if (!nodeRef.current) return

    const control = animate(prevRef.current, to, {
      duration,
      onUpdate: (value) => {
        nodeRef.current!.textContent = value.toFixed(decimals)
      },
    })
    prevRef.current = to

    return () => {
      control.stop()
    }
  }, [to, decimals, duration])

  return <span ref={nodeRef}></span>
}
