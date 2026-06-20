// TeacherReportPage — Teacher view of student performance with step-level detail

import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { generateTeacherReport, getTeacherReport } from '../../services/reportService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import Loader from '../../components/ui/Loader'
import ExportButton from './ExportButton'

const SUBTOPIC_INFO = {
  factorization: { icon: '🔢' },
  quadratic_formula: { icon: '📐' },
  completing_the_square: { icon: '⬜' },
  nature_of_roots: { icon: '🌱' },
  word_problems: { icon: '📝' },
}

export default function TeacherReportPage() {
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
      const data = await getTeacherReport(studentId)
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
      const data = await generateTeacherReport(studentId)
      setReport(data)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to generate report'
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.')
      } else if (msg.includes('No attempts found')) {
        setError('Student has no attempts yet. Ask them to complete a practice session first.')
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1">📊 Teacher Report</h1>
          <p className="text-surface-400 text-sm">Student performance analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </Button>
          {report && <ExportButton text={report.summary_text} label="Copy Report" />}
          <Button variant="primary" onClick={handleGenerate} loading={generating}>
            {report ? '🔄 Refresh Report' : '📝 Generate Report'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error-500/10 border border-error-500/30 rounded-xl px-4 py-3 text-sm text-error-400 mb-6">
          {error}
        </div>
      )}

      {!report ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-surface-200 mb-2">No Report Available</h3>
          <p className="text-surface-400 mb-6">This student has no practice attempts yet. Generate a report once they complete a session.</p>
          <Button variant="primary" onClick={handleGenerate} loading={generating}>
            Generate Report
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <h3 className="text-lg font-semibold text-surface-50 mb-3">📝 Summary</h3>
            <pre className="text-sm text-surface-300 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
              {report.summary_text}
            </pre>
          </Card>

          {/* Weak Topics */}
          {report.weak_topics && report.weak_topics.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-surface-50 mb-4">🎯 Topic Breakdown</h3>
              <div className="space-y-3">
                {report.weak_topics.map((topic) => {
                  const pct = topic.average_score_pct || 0
                  const icon = SUBTOPIC_INFO[topic.subtopic]?.icon || '📖'
                  return (
                    <div key={topic.subtopic} className="flex items-center gap-3">
                      <span className="text-lg w-8 text-center">{icon}</span>
                      <Badge
                        variant={topic.status === 'strong' ? 'success' : topic.status === 'weak' ? 'error' : 'warning'}
                      >
                        {topic.status}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-surface-200 capitalize">{topic.subtopic.replace(/_/g, ' ')}</span>
                          <span className="text-surface-400">{topic.attempts_count || 0} attempts</span>
                        </div>
                        <ProgressBar
                          value={pct}
                          showPercent={false}
                          variant={topic.status === 'strong' ? 'success' : topic.status === 'weak' ? 'error' : 'warning'}
                        />
                      </div>
                      <span className="text-sm font-medium text-surface-200 w-12 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {report.weak_topics && report.weak_topics.length === 0 && (
            <Card>
              <p className="text-center text-surface-400 py-4">No topic data available yet.</p>
            </Card>
          )}

          {/* Performance */}
          {report.performance && (
            <Card>
              <h3 className="text-lg font-semibold text-surface-50 mb-4">📈 Performance Trend</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-surface-800/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-surface-50">{report.performance.total_attempts || 0}</p>
                  <p className="text-xs text-surface-400">Total Attempts</p>
                </div>
                <div className="bg-surface-800/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-surface-50">{report.performance.avg_score || 0}%</p>
                  <p className="text-xs text-surface-400">Average Score</p>
                </div>
              </div>
              {report.performance.trend?.length > 0 && (
                <div className="space-y-1">
                  {report.performance.trend.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center gap-3 text-sm">
                      <span className="text-surface-400 w-24">{day.date}</span>
                      <div className="flex-1">
                        <ProgressBar value={day.score} showPercent={false} variant={day.score >= 75 ? 'success' : day.score >= 40 ? 'warning' : 'error'} />
                      </div>
                      <span className="text-surface-200 w-16 text-right">{day.score}% ({day.attempts})</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Generated timestamp */}
          <p className="text-center text-xs text-surface-500">
            Report generated: {report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}
          </p>
        </div>
      )}
    </div>
  )
}