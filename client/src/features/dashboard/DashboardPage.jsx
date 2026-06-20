// DashboardPage — Shared dashboard with role-based sections
// Student: analytics, weak topics, quick actions, recent attempts
// Teacher: assigned students list, student performance, reports
// Parent: linked child, child performance, reports

import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getQuestions } from '../../services/questionService'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Loader from '../../components/ui/Loader'

const SUBTOPIC_INFO = {
  factorization: { icon: '🔢', color: 'primary' },
  quadratic_formula: { icon: '📐', color: 'accent' },
  completing_the_square: { icon: '⬜', color: 'warning' },
  nature_of_roots: { icon: '🌱', color: 'success' },
  word_problems: { icon: '📝', color: 'error' },
}

export default function DashboardPage() {
  const { user, role } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!user) {
    return <WelcomeView navigate={navigate} />
  }

  if (role === 'teacher') return <TeacherDashboard user={user} navigate={navigate} />
  if (role === 'parent') return <ParentDashboard user={user} navigate={navigate} />
  if (role === 'student') return <StudentDashboard user={user} navigate={navigate} />

  return <UnknownRoleView navigate={navigate} />
}


// ════════════════════════════════════════════
// STUDENT DASHBOARD
// ════════════════════════════════════════════

function StudentDashboard({ user, navigate }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAttempts: 0, avgScore: 0, trend: [] })
  const [weakTopics, setWeakTopics] = useState([])
  const [recentAttempts, setRecentAttempts] = useState([])
  const [questionCount, setQuestionCount] = useState(0)

  const weakestSubtopic = (weakTopics || [])
    .slice()
    .sort((a, b) => (a.average_score_pct || 0) - (b.average_score_pct || 0))[0]?.subtopic || ''

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, attemptsRes, questionsRes] = await Promise.allSettled([
        api.get(`/analytics/${user.id}/performance`),
        api.get(`/attempts/${user.id}?limit=5`),
        getQuestions({ limit: 40 }),
      ])

      if (analyticsRes.status === 'fulfilled') {
        const data = analyticsRes.value.data
        setStats({
          totalAttempts: data.total_attempts || 0,
          avgScore: data.avg_score || 0,
          trend: data.trend || [],
        })
      }

      try {
        const weakRes = await api.get(`/analytics/${user.id}/weak-topics`)
        setWeakTopics(weakRes.data.weak_topics || [])
      } catch {}

      if (attemptsRes.status === 'fulfilled') {
        setRecentAttempts(attemptsRes.value.data.attempts || [])
      }

      if (questionsRes.status === 'fulfilled') {
        const qs = questionsRes.value.questions || questionsRes.value
        setQuestionCount(Array.isArray(qs) ? qs.length : 0)
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLoader />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <DashboardHeader user={user} subtitle="Your Quadratic Equations practice dashboard" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Questions" value={questionCount} icon="📖" />
        <StatCard label="Attempts" value={stats.totalAttempts} icon="✍️" />
        <StatCard label="Avg Score" value={`${stats.avgScore}%`} icon="📊" />
        <StatCard label="Subtopics" value="5" icon="🎯" />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <QuickActionCard icon="🚀" title="Start Practice" desc="Solve questions & get graded" color="primary" onClick={() => navigate('/practice')} />
        <QuickActionCard icon="📚" title="Cheat Sheet" desc="Formulas & concepts" color="accent" onClick={() => navigate('/cheatsheet')} />
        <QuickActionCard icon="🎯" title="Weak Topics" desc="Focus on gaps" color="warning" onClick={() => navigate('/practice', { state: { subtopic: weakestSubtopic } })} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <Card>
          <h3 className="text-lg font-semibold text-surface-50 mb-4">📊 Topic Performance</h3>
{weakTopics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-surface-300 font-medium mb-1">No analytics yet</p>
              <p className="text-sm text-surface-400 mb-4">Complete at least one practice session to see your topic performance.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/practice')}>
                Start Practicing
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((topic) => {
                const info = SUBTOPIC_INFO[topic.subtopic] || { icon: '📖' }
                const pct = topic.average_score_pct || 0
                return (
                  <div key={topic.subtopic} className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-surface-200 capitalize">
                          {topic.subtopic.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-surface-400">{topic.attempts_count} attempts</span>
                          <Badge
                            variant={topic.status === 'strong' ? 'success' : topic.status === 'weak' ? 'error' : 'warning'}
                            size="sm"
                          >
                            {pct.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <ProgressBar
                        value={pct}
                        variant={topic.status === 'strong' ? 'success' : topic.status === 'weak' ? 'error' : 'warning'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent Attempts */}
        <Card>
          <h3 className="text-lg font-semibold text-surface-50 mb-4">🕐 Recent Attempts</h3>
          {recentAttempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-surface-400 text-sm mb-3">No attempts yet</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/practice')}>
                Start your first practice!
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((attempt) => {
                const q = attempt.questions || {}
                const ev = Array.isArray(attempt.evaluations) ? attempt.evaluations[0] : attempt.evaluations
                const score = ev?.total_marks_awarded
                const max = ev?.total_max_marks
                const pct = max ? Math.round((score / max) * 100) : null
                return (
                  <div
                    key={attempt.attempt_id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:border-surface-600 transition-default"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-200 truncate">{q.question_text || 'Question'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm" variant="secondary">{attempt.input_mode}</Badge>
                        <span className="text-xs text-surface-500">
                          {new Date(attempt.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {pct !== null && (
                      <Badge variant={pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'error'}>
                        {score}/{max}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}


// ════════════════════════════════════════════
// TEACHER DASHBOARD
// ════════════════════════════════════════════

function TeacherDashboard({ user, navigate }) {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [studentCount, setStudentCount] = useState(0)

  useEffect(() => {
    loadTeacherData()
  }, [user])

  const loadTeacherData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/users/teacher/${user.id}/students`)
      setStudents(res.data.students || [])
      setStudentCount(res.data.count || 0)
    } catch (err) {
      console.error('Teacher dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLoader />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <DashboardHeader user={user} subtitle="Teacher dashboard — student performance overview" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Students" value={studentCount} icon="👥" />
        <StatCard
          label="Avg Class Score"
          value={studentCount > 0 ? `${Math.round(students.reduce((s, st) => s + (st.avg_score || 0), 0) / studentCount)}%` : '—'}
          icon="📊"
        />
        <StatCard
          label="Total Attempts"
          value={students.reduce((s, st) => s + (st.total_attempts || 0), 0)}
          icon="✍️"
        />
      </div>

      {/* Student Roster */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-surface-50 mb-4">👥 Your Students</h3>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-surface-300 font-medium mb-2">No students linked yet</p>
            <p className="text-surface-500 text-sm">
              Students will appear here once they sign up and enter your email address.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => {
              const score = student.avg_score || 0
              const weakCount = (student.weak_topics || []).length
              return (
                <div
                  key={student.student_id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:border-surface-600 transition-default"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-lg font-bold text-primary-300 flex-shrink-0">
                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-50 truncate">{student.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-surface-400">{student.email}</span>
                      <Badge size="sm" variant="secondary">{student.total_attempts || 0} attempts</Badge>
                      {weakCount > 0 && (
                        <Badge size="sm" variant="error">{weakCount} weak topic{weakCount > 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Score + Action */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={score >= 75 ? 'success' : score >= 40 ? 'warning' : 'error'}>
                      {score.toFixed(0)}%
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/reports/teacher/${student.student_id}`)}
                    >
                      📊 Report
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Weak Topics Overview */}
      {students.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-surface-50 mb-4">🎯 Class Weak Areas</h3>
          <div className="space-y-2">
            {(() => {
              // Aggregate weak topics across all students
              const topicCounts = {}
              students.forEach((s) => {
                (s.weak_topics || []).forEach((t) => {
                  topicCounts[t] = (topicCounts[t] || 0) + 1
                })
              })
              const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])
              if (sorted.length === 0) {
                return <p className="text-surface-400 text-sm text-center py-4">No weak areas detected yet.</p>
              }
              return sorted.map(([subtopic, count]) => {
                const info = SUBTOPIC_INFO[subtopic] || { icon: '📖' }
                return (
                  <div key={subtopic} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/30">
                    <span className="text-xl">{info.icon}</span>
                    <span className="text-sm text-surface-200 capitalize flex-1">{subtopic.replace(/_/g, ' ')}</span>
                    <Badge variant="error" size="sm">{count} student{count > 1 ? 's' : ''}</Badge>
                  </div>
                )
              })
            })()}
          </div>
        </Card>
      )}
    </div>
  )
}


// ════════════════════════════════════════════
// PARENT DASHBOARD
// ════════════════════════════════════════════

function ParentDashboard({ user, navigate }) {
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])

  useEffect(() => {
    loadParentData()
  }, [user])

  const loadParentData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/users/parent/${user.id}/children`)
      setChildren(res.data.children || [])
    } catch (err) {
      console.error('Parent dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLoader />

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <DashboardHeader user={user} subtitle="Track your child's progress in Quadratic Equations" />

      {children.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-5xl mb-4">👪</p>
          <h3 className="text-lg font-semibold text-surface-200 mb-2">No child linked yet</h3>
          <p className="text-surface-400 text-sm">
            Your child will appear here once they sign up and enter your email address.
          </p>
        </Card>
      ) : (
        children.map((child) => {
          const score = child.avg_score || 0
          const weakTopics = child.weak_topics || []
          const weakList = weakTopics.filter((t) => t.status === 'weak')
          const strongList = weakTopics.filter((t) => t.status === 'strong')

          return (
            <div key={child.student_id} className="space-y-6">
              {/* Child Overview */}
              <Card variant="glass">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary-600/20 flex items-center justify-center text-2xl font-bold text-primary-300">
                    {child.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-surface-50">{child.name}</h2>
                    <p className="text-sm text-surface-400">Class {child.class || '10'} • {child.board || 'CBSE'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-800/50 rounded-xl p-4 text-center">
                    <p className={`text-3xl font-bold ${score >= 75 ? 'text-accent-400' : score >= 40 ? 'text-warning-400' : 'text-error-400'}`}>
                      {score.toFixed(0)}%
                    </p>
                    <p className="text-xs text-surface-400 mt-1">Average Score</p>
                  </div>
                  <div className="bg-surface-800/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-surface-50">{child.total_attempts || 0}</p>
                    <p className="text-xs text-surface-400 mt-1">Questions Done</p>
                  </div>
                  <div className="bg-surface-800/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-surface-50">{strongList.length}</p>
                    <p className="text-xs text-surface-400 mt-1">Strong Topics</p>
                  </div>
                </div>
              </Card>

              {/* Topic Breakdown */}
              <Card>
                <h3 className="text-lg font-semibold text-surface-50 mb-4">📊 Topic Breakdown</h3>
                <div className="space-y-3">
                  {weakTopics.map((topic) => {
                    const info = SUBTOPIC_INFO[topic.subtopic] || { icon: '📖' }
                    const pct = topic.average_score_pct || 0
                    return (
                      <div key={topic.subtopic} className="flex items-center gap-3">
                        <span className="text-xl w-8 text-center">{info.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-surface-200 capitalize">
                              {topic.subtopic.replace(/_/g, ' ')}
                            </span>
                            <Badge
                              variant={topic.status === 'strong' ? 'success' : topic.status === 'weak' ? 'error' : 'warning'}
                              size="sm"
                            >
                              {pct.toFixed(0)}%
                            </Badge>
                          </div>
                          <ProgressBar
                            value={pct}
                            variant={topic.status === 'strong' ? 'success' : topic.status === 'weak' ? 'error' : 'warning'}
                            showPercent={false}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Encouragement + Report */}
              <Card variant="glass">
                <div className="text-center">
                  <p className="text-lg mb-2">
                    {score >= 75 ? '🌟 Excellent progress!' :
                     score >= 40 ? '👍 Good effort! Keep it up.' :
                     '💪 Regular practice will help improve scores.'}
                  </p>
                  {weakList.length > 0 && (
                    <p className="text-sm text-surface-400 mb-4">
                      Could use more practice in: {weakList.map((t) => t.subtopic.replace(/_/g, ' ')).join(', ')}
                    </p>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/reports/parent/${child.student_id}`)}
                  >
                    📝 View Detailed Report
                  </Button>
                </div>
              </Card>
            </div>
          )
        })
      )}
    </div>
  )
}


// ════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ════════════════════════════════════════════

function WelcomeView({ navigate }) {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card variant="glass" className="text-center max-w-md w-full">
        <div className="text-5xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold gradient-text mb-3">Welcome to GyanSetu</h2>
        <p className="text-surface-400 mb-6">Master Quadratic Equations with AI-powered grading</p>
        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate('/login')}>Log In</Button>
          <Button variant="secondary" onClick={() => navigate('/signup')}>Sign Up</Button>
        </div>
      </Card>
    </div>
  )
}

function DashboardHeader({ user, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-surface-50 mb-1">
        Hey, {user.user_metadata?.name || 'there'} 👋
      </h1>
      <p className="text-surface-400">{subtitle}</p>
    </div>
  )
}

function DashboardLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader size="lg" />
    </div>
  )
}

function UnknownRoleView({ navigate }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useContext(AuthContext)

  const ROLES = [
    { value: 'student', label: 'Student', icon: '🎓', desc: 'Practice questions & get AI graded' },
    { value: 'teacher', label: 'Teacher', icon: '📚', desc: 'View student reports & analytics' },
    { value: 'parent', label: 'Parent', icon: '👪', desc: "Track your child's progress" },
  ]

  const handleSetRole = async () => {
    if (!selectedRole || !user) return
    setSaving(true)
    setError('')
    try {
      await api.post('/auth/signup', {
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: selectedRole,
      })
      // Reload so AuthContext re-resolves the role from the DB
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to set role. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card variant="glass" className="text-center max-w-md w-full">
        <div className="text-5xl mb-4">🔑</div>
        <h2 className="text-2xl font-bold text-surface-50 mb-2">Select Your Role</h2>
        <p className="text-surface-400 text-sm mb-6">Your account needs a role to continue. Please choose one below.</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelectedRole(r.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-default cursor-pointer ${
                selectedRole === r.value
                  ? 'border-primary-500 bg-primary-600/15 text-primary-300'
                  : 'border-surface-600 bg-surface-800/50 text-surface-400 hover:border-surface-500'
              }`}
            >
              <span className="text-xl">{r.icon}</span>
              <span className="text-xs font-medium">{r.label}</span>
            </button>
          ))}
        </div>
        {selectedRole && (
          <p className="text-xs text-surface-500 mb-4">
            {ROLES.find((r) => r.value === selectedRole)?.desc}
          </p>
        )}

        {error && (
          <div className="bg-error-500/10 border border-error-500/30 rounded-xl px-4 py-3 text-sm text-error-400 mb-4">
            {error}
          </div>
        )}

        <Button variant="primary" className="w-full" onClick={handleSetRole} loading={saving} disabled={!selectedRole}>
          Continue as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}
        </Button>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <Card variant="glass" padding="p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xl font-bold text-surface-50">{value}</p>
          <p className="text-xs text-surface-400">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function QuickActionCard({ icon, title, desc, color, onClick }) {
  return (
    <Card variant="glass" hover className="cursor-pointer group" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-default`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-surface-50">{title}</h3>
          <p className="text-sm text-surface-400">{desc}</p>
        </div>
      </div>
    </Card>
  )
}
