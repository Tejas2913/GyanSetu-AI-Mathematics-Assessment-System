// ConceptAccordion — Expandable concept section for cheat sheet

import { useState } from 'react'
import { MathJax } from 'better-react-mathjax'
import Card from '../../components/ui/Card'

export default function ConceptAccordion({ concept }) {
  const [expanded, setExpanded] = useState(false)

  if (!concept) return null

  return (
    <Card variant="glass" hover className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-surface-50 mb-3">{concept.title}</h3>
          {concept.formula_latex && (
            <div className="bg-surface-900/60 rounded-xl px-4 py-3 mb-3 overflow-x-auto">
              <MathJax className="text-primary-300 text-lg">
                {`\\[${concept.formula_latex}\\]`}
              </MathJax>
            </div>
          )}
          <p className="text-sm text-surface-300 leading-relaxed">{concept.explanation}</p>
          {expanded && concept.example && (
            <div className="mt-3 p-3 bg-accent-500/5 border border-accent-500/20 rounded-xl">
              <p className="text-xs font-medium text-accent-400 mb-1">Example:</p>
              <p className="text-sm text-surface-300 font-mono">{concept.example}</p>
            </div>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-surface-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </Card>
  )
}
