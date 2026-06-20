// CheatSheetPage — Quadratic Equations cheat sheet with LaTeX rendering via MathJax

import { useState, useEffect } from 'react'
import { MathJax } from 'better-react-mathjax'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Loader from '../../components/ui/Loader'

const SECTION_ICONS = {
  'Standard Form': '📋',
  'Solution Methods': '🔧',
  'Discriminant & Nature of Roots': '🔍',
  'Important Identities': '🧮',
  'Word Problem Strategies': '💡',
  'Exam Tips': '🎯',
}

export default function CheatSheetPage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCheatSheet()
  }, [])

  const loadCheatSheet = async () => {
    try {
      const { data } = await api.get('/cheatsheet')
      setSections(data.sections || [])
      if (data.sections?.length) {
        setActiveSection(data.sections[0].section)
      }
    } catch (err) {
      setError('Failed to load cheat sheet. Please refresh the page.')
      console.error('Failed to load cheatsheet:', err)
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

  if (error && sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card variant="glass" className="text-center max-w-md w-full">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-surface-300 mb-4">{error}</p>
          <button
            onClick={loadCheatSheet}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-default"
          >
            Retry
          </button>
        </Card>
      </div>
    )
  }

  // Filter concepts by search
  const filteredSections = sections.map((section) => ({
    ...section,
    concepts: section.concepts.filter((c) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        c.title.toLowerCase().includes(q) ||
        c.explanation.toLowerCase().includes(q) ||
        c.example?.toLowerCase().includes(q)
      )
    }),
  })).filter((s) => s.concepts.length > 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">📚 Cheat Sheet</h1>
        <p className="text-surface-400">Quadratic Equations — All formulas, methods & exam tips</p>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search formulas, concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-800 border border-surface-600 rounded-xl pl-10 pr-4 py-2.5 text-surface-50 placeholder-surface-500 focus:border-primary-500 outline-none transition-default"
          />
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.section}
            onClick={() => setActiveSection(section.section)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-default cursor-pointer ${
              activeSection === section.section
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/50'
                : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-500'
            }`}
          >
            {SECTION_ICONS[section.section] || '📖'}
            {section.section}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {filteredSections
          .filter((s) => !activeSection || s.section === activeSection || searchQuery)
          .map((section) => (
            <div key={section.section}>
              {searchQuery && (
                <h2 className="text-lg font-semibold text-surface-200 mb-3 flex items-center gap-2">
                  {SECTION_ICONS[section.section] || '📖'} {section.section}
                </h2>
              )}
              <div className="grid gap-4">
                {section.concepts.map((concept, i) => (
                  <ConceptCard key={i} concept={concept} />
                ))}
              </div>
            </div>
          ))}
      </div>

      {filteredSections.length === 0 && !searchQuery && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-surface-400 mb-2">No formulas available yet.</p>
          <p className="text-sm text-surface-500">The cheat sheet content will be added soon.</p>
        </div>
      )}

      {filteredSections.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-surface-400">No matching formulas found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}


function ConceptCard({ concept }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      variant="glass"
      hover
      className="cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-surface-50 mb-3">{concept.title}</h3>

          {/* LaTeX Formula */}
          <div className="bg-surface-900/60 rounded-xl px-4 py-3 mb-3 overflow-x-auto">
            <MathJax className="text-primary-300 text-lg">
              {`\\[${concept.formula_latex}\\]`}
            </MathJax>
          </div>

          {/* Explanation */}
          <p className="text-sm text-surface-300 leading-relaxed">{concept.explanation}</p>

          {/* Example (expandable) */}
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