// StepBreakdown — Renders step-by-step grading breakdown

import Badge from '../../components/ui/Badge'

export default function StepBreakdown({ steps = [] }) {
  if (!steps.length) {
    return <p className="text-surface-400 text-sm text-center py-4">No step breakdown available.</p>
  }

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const full = step.marks_awarded === step.max_marks
        const partial = step.marks_awarded > 0 && !full

        return (
          <div
            key={step.step_id || i}
            className={`flex items-start gap-3 p-3 rounded-xl border ${
              full ? 'border-accent-500/30 bg-accent-500/5' :
              partial ? 'border-warning-400/30 bg-warning-400/5' :
              'border-error-500/30 bg-error-500/5'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              full ? 'bg-accent-500/20 text-accent-400' :
              partial ? 'bg-warning-400/20 text-warning-400' :
              'bg-error-500/20 text-error-400'
            }`}>
              {full ? '✓' : partial ? '~' : '✗'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-surface-200">Step {step.step_id}</span>
                <Badge
                  variant={full ? 'success' : partial ? 'warning' : 'error'}
                  size="sm"
                >
                  {step.marks_awarded}/{step.max_marks}
                </Badge>
              </div>
              <p className="text-xs text-surface-400 leading-relaxed">{step.justification}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
