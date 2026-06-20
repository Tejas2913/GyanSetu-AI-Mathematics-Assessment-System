// FormulaCard — Standalone formula display card

import { MathJax } from 'better-react-mathjax'
import Card from '../../components/ui/Card'

export default function FormulaCard({ title, formula, description }) {
  return (
    <Card variant="glass" padding="p-4">
      {title && <h4 className="text-sm font-medium text-surface-200 mb-2">{title}</h4>}
      {formula && (
        <div className="bg-surface-900/60 rounded-lg px-3 py-2 mb-2 overflow-x-auto">
          <MathJax className="text-primary-300">
            {`\\[${formula}\\]`}
          </MathJax>
        </div>
      )}
      {description && <p className="text-xs text-surface-400">{description}</p>}
    </Card>
  )
}
