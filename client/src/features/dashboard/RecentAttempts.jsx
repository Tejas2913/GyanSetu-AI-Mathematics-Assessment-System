// RecentAttempts — List of recent practice attempts

import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function RecentAttempts({ attempts = [], onNavigate }) {
  if (!attempts.length) {
    return (
      <div className="text-center py-8">
        <p className="text-surface-400 text-sm mb-3">No attempts yet</p>
        <Button variant="primary" size="sm" onClick={() => onNavigate?.('/practice')}>
          Start your first practice!
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {attempts.map((attempt) => {
        const q = attempt.questions || {}
        const ev = Array.isArray(attempt.evaluations) ? attempt.evaluations[0] : attempt.evaluations
        const score = ev?.total_marks_awarded
        const max = ev?.total_max_marks
        const pct = max ? Math.round((score / max) * 100) : null

        return (
          <div
            key={attempt.attempt_id}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:border-surface-600 transition-default"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-200 truncate">{q.question_text || 'Question'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge size="sm" variant="secondary">{attempt.input_mode}</Badge>
                <span className="text-xs text-surface-500">
                  {new Date(attempt.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {pct !== null && (
              <Badge variant={pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'error'}>
                {score}/{max}
              </Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}
