// QuestionNav — Question navigation dots and progress indicator

export default function QuestionNav({ questions = [], currentIndex, answers = {}, onNavigate }) {
  return (
    <div className="flex justify-center gap-1.5 mt-8">
      {questions.map((q, i) => (
        <button
          key={q?.question_id || i}
          onClick={() => onNavigate?.(i)}
          className={`w-2.5 h-2.5 rounded-full transition-default cursor-pointer ${
            i === currentIndex
              ? 'bg-primary-500 scale-125'
              : answers[q?.question_id]
              ? 'bg-accent-500'
              : 'bg-surface-600'
          }`}
          aria-label={`Question ${i + 1}`}
        />
      ))}
    </div>
  )
}
