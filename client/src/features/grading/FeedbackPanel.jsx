// FeedbackPanel — Displays AI feedback text

import Card from '../../components/ui/Card'

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null

  return (
    <Card variant="glass">
      <h3 className="text-lg font-semibold text-surface-50 mb-2">💡 AI Feedback</h3>
      <p className="text-surface-300 text-sm leading-relaxed">{feedback}</p>
    </Card>
  )
}
