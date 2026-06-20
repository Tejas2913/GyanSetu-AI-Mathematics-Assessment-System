// ScoreBadge — Circular score display with percentage

import Badge from '../../components/ui/Badge'

export default function ScoreBadge({ awarded, max }) {
  const pct = max > 0 ? Math.round((awarded / max) * 100) : 0
  const variant = pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'error'
  const colorClass = pct >= 75 ? 'text-accent-400' : pct >= 40 ? 'text-warning-400' : 'text-error-400'

  return (
    <div className="text-center">
      <div className="text-5xl font-bold mb-2">
        <span className={colorClass}>{awarded}</span>
        <span className="text-surface-500 text-2xl">/{max}</span>
      </div>
      <Badge variant={variant}>{pct}%</Badge>
    </div>
  )
}
