// WeakTopicCard — Per-subtopic strength indicator card

import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'

const SUBTOPIC_ICONS = {
  factorization: '🔢',
  quadratic_formula: '📐',
  completing_the_square: '⬜',
  nature_of_roots: '🌱',
  word_problems: '📝',
}

export default function WeakTopicCard({ topic }) {
  if (!topic) return null

  const icon = SUBTOPIC_ICONS[topic.subtopic] || '📖'
  const pct = topic.average_score_pct || 0
  const variant = topic.status === 'strong' ? 'success' : topic.status === 'weak' ? 'error' : 'warning'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-8 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-surface-200 capitalize">
            {topic.subtopic.replace(/_/g, ' ')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400">{topic.attempts_count} attempts</span>
            <Badge variant={variant} size="sm">
              {pct.toFixed(0)}%
            </Badge>
          </div>
        </div>
        <ProgressBar value={pct} variant={variant} showPercent={false} />
      </div>
    </div>
  )
}
