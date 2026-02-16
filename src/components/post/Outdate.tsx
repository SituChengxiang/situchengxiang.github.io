import { getDiffInDays, getFormattedDate } from '@/utils/date'
import { motion } from 'framer-motion'

export function Outdate({ lastMod, category }: { lastMod: Date; category?: string }) {
  const isShow = category === '教程' && getDiffInDays(lastMod) > 30

  if (!isShow) {
    return null
  }

  return (
    <motion.div
      className="mb-8 text-sm p-4 rounded-lg bg-amber-300/10 border border-amber-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span>
        这篇文章最后修改于 {getFormattedDate(lastMod)}
        ，部分内容可能已经不适用，如有疑问可联系作者。
      </span>
    </motion.div>
  )
}
