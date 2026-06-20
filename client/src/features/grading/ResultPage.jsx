// ResultPage — Standalone grading result page (accessed via /practice/result/:attemptId)

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvaluation } from '../../services/gradingService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'

export default function ResultPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (attemptId) loadEvaluation()
  }, [attemptId])

  const loadEvaluation = async () => {
    try {
      const data = await getEvaluation(attemptId)
      setEvaluation(data)
    } catch (err) {
      setError('Could not load evaluation. It may not exist yet.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card variant="glass" className="text-center max-w-md w-full">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-surface-300 mb-4">{error}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  if (!evaluation) return null

  const score = evaluation.total_marks_awarded || 0
  const maxMarks = evaluation.total_max_marks || 1
  const pct = Math.round((score / maxMarks) * 100)
  const steps = evaluation.step_marks || []

  // Animated score ring
  const circumference = 2 * Math.PI * 54
  const strokeOffset = circumference - (pct / 100) * circumference

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Score Ring */}
      <Card variant="glass" className="text-center mb-6">
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-700" />
            <circle
              cx="60" cy="60" r="54" fill="none" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${
                pct >= 75 ? 'text-accent-400' : pct >= 40 ? 'text-warning-400' : 'text-error-400'
              }`}
              style={{ stroke: 'currentColor' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-surface-50">{pct}%</span>
            <span className="text-xs text-surface-400">{score}/{maxMarks}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-surface-50 mb-1">
          {pct >= 75 ? '🌟 Excellent Work!' : pct >= 40 ? '👍 Good Effort!' : '💪 Keep Going!'}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={evaluation.confidence_flag === 'high' ? 'success' : evaluation.confidence_flag === 'low' ? 'error' : 'warning'}>
            Confidence: {evaluation.confidence_flag}
          </Badge>
        </div>
      </Card>

      {/* Step Breakdown */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-surface-50 mb-4">📝 Step-by-Step Breakdown</h3>
        <div className="space-y-3">
          {steps.map((step, i) => {
            const full = step.marks_awarded === step.max_marks
            const partial = step.marks_awarded > 0 && !full
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-default ${
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
      </Card>

      {/* Feedback */}
      <Card variant="glass" className="mb-6">
        <h3 className="text-lg font-semibold text-surface-50 mb-2">💡 AI Feedback</h3>
        <p className="text-surface-300 text-sm leading-relaxed">{evaluation.feedback_text}</p>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => navigate('/practice')}>
          Practice More
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
