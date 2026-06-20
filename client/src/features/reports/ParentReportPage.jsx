// ParentReportPage — Parent-friendly student progress view

import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { generateParentReport, getParentReport } from '../../services/reportService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import ExportButton from './ExportButton'

export default function ParentReportPage() {
  const { studentId } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReport()
  }, [studentId])

  const loadReport = async () => {
    try {
      const data = await getParentReport(studentId)
      setReport(data)
    } catch {
      // No existing report
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const data = await generateParentReport(studentId)
      setReport(data)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to generate report'
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.')
      } else if (msg.includes('No attempts found')) {
        setError('Your child has not completed any practice sessions yet.')
      } else {
        setError(msg)
      }
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-1">👪 Parent Report</h1>
        <p className="text-surface-400 text-sm">Your child's progress in Quadratic Equations</p>
      </div>

      {error && (
        <div className="bg-error-500/10 border border-error-500/30 rounded-xl px-4 py-3 text-sm text-error-400 mb-6">
          {error}
        </div>
      )}

      {!report ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-5xl mb-4">📊</p>
          <h3 className="text-lg font-semibold text-surface-200 mb-2">No Report Available Yet</h3>
          <p className="text-surface-400 mb-6">
            Your child needs to complete at least one practice session before a report can be generated.
          </p>
          <Button variant="primary" size="lg" onClick={handleGenerate} loading={generating}>
            📝 Generate Report
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Report Card */}
          <Card variant="glass">
            <div className="prose prose-invert max-w-none">
              {report.summary_text.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />
                // Make emoji lines larger
                if (line.startsWith('📊') || line.startsWith('📝') || line.startsWith('📈') || line.startsWith('💡')) {
                  return <p key={i} className="text-base text-surface-200 leading-relaxed">{line}</p>
                }
                if (line.includes('🌟') || line.includes('👍') || line.includes('💪') || line.includes('📚')) {
                  return <p key={i} className="text-lg font-medium text-surface-100">{line}</p>
                }
                if (line.startsWith('✅') || line.startsWith('📖') || line.startsWith('🎯')) {
                  return <p key={i} className="text-sm text-surface-300 bg-surface-800/50 rounded-xl px-4 py-2">{line}</p>
                }
                return <p key={i} className="text-sm text-surface-300 leading-relaxed">{line}</p>
              })}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <ExportButton text={report.summary_text} label="Copy Report" />
            <Button variant="secondary" className="flex-1" onClick={handleGenerate} loading={generating}>
              🔄 Refresh Report
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/dashboard')}>
              🏠 Dashboard
            </Button>
          </div>

          <p className="text-center text-xs text-surface-500">
            Generated: {report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}
          </p>
        </div>
      )}
    </div>
  )
}