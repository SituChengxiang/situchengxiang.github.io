import { getRelativeTime, getFormattedDate } from '@/utils/date'
import { useMemo } from 'react'

export function RelativeDate({ date }: { date: Date }) {
  const dateStr = useMemo(() => {
    return getRelativeTime(date) || getFormattedDate(date)
  }, [date])

  return <span>{dateStr}</span>
}
