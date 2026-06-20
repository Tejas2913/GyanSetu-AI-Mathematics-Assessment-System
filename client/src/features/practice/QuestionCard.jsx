// QuestionCard — Displays question text, subtopic, marks, difficulty badges

import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function QuestionCard({ question }) {
  if (!question) return null

  const meta = question.question_metadata
  const metadata = Array.isArray(meta) ? meta[0] : meta

  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="primary">{question.subtopic?.replace(/_/g, ' ')}</Badge>
        <Badge variant="secondary">{question.marks} mark{question.marks > 1 ? 's' : ''}</Badge>
        {metadata?.is_hot_question && <Badge variant="warning">🔥 Hot</Badge>}
        {metadata?.difficulty && (
          <Badge variant={metadata.difficulty === 'hard' ? 'error' : metadata.difficulty === 'medium' ? 'warning' : 'success'}>
            {metadata.difficulty}
          </Badge>
        )}
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-surface-50 leading-relaxed">
        {question.question_text}
      </h2>
    </Card>
  )
}
