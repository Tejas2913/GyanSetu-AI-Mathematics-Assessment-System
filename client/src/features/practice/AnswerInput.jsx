// AnswerInput — Container for typed/voice/photo input modes

import Card from '../../components/ui/Card'

export default function AnswerInput({ inputMode, answerText, onAnswerChange, children }) {
  if (inputMode === 'typed') {
    return (
      <Card>
        <label className="block text-sm font-medium text-surface-300 mb-2">Your Solution</label>
        <textarea
          value={answerText}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={"Write your step-by-step solution here...\n\nStep 1: ...\nStep 2: ...\nStep 3: ..."}
          rows={8}
          className="w-full bg-surface-900 border border-surface-600 rounded-xl px-4 py-3 text-surface-50 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-default resize-none font-mono text-sm"
        />
        <p className="mt-1.5 text-xs text-surface-500">
          Tip: Show each step clearly for maximum marks
        </p>
      </Card>
    )
  }

  // For voice and photo, render children (VoiceInput / PhotoInput)
  return <Card>{children}</Card>
}
