// SignupPage — Supabase Auth signup with role selection
// Students can optionally link to teacher/parent by email

import { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { signUp } from '../../services/authService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const ROLES = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Practice questions & get AI graded' },
  { value: 'teacher', label: 'Teacher', icon: '📚', desc: 'View student reports & analytics' },
  { value: 'parent', label: 'Parent', icon: '👪', desc: "Track your child's progress" },
]

export default function SignupPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [role, setRole] = useState('student')
  const [teacherEmail, setTeacherEmail] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const validatePassword = (pwd) => {
    if (pwd.length > 0 && pwd.length < 6) {
      setPasswordError('Password must be at least 6 characters')
    } else {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signUp({
        email,
        password,
        name,
        role,
        teacher_email: role === 'student' ? teacherEmail : undefined,
        parent_email: role === 'student' ? parentEmail : undefined,
      })
      setSuccess(true)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('already registered')) {
        setError('This email is already registered. Try logging in instead.')
      } else {
        setError(msg || 'Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[85vh] px-4">
        <Card variant="glass" className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-surface-50 mb-2">Account Created!</h2>
          <p className="text-surface-400 mb-6">
            Check your email to confirm your account, then sign in.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <Card variant="glass" className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-surface-400 text-sm">Join GyanSetu and start mastering Quadratic Equations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-default cursor-pointer ${
                    role === r.value
                      ? 'border-primary-500 bg-primary-600/15 text-primary-300'
                      : 'border-surface-600 bg-surface-800/50 text-surface-400 hover:border-surface-500'
                  }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span className="text-xs font-medium">{r.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-surface-500 text-center">
              {ROLES.find((r) => r.value === role)?.desc}
            </p>
          </div>

          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              validatePassword(e.target.value)
            }}
            required
            error={passwordError}
          />

          {/* Student-only: link to teacher and parent */}
          {role === 'student' && (
            <div className="space-y-4 pt-2 border-t border-surface-700/50">
              <p className="text-xs text-surface-400 pt-2">
                Link your account to your teacher and parent (optional — they must sign up first)
              </p>
              <Input
                label="Teacher's Email"
                type="email"
                placeholder="teacher@school.com"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
              />
              <Input
                label="Parent's Email"
                type="email"
                placeholder="parent@email.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="bg-error-500/10 border border-error-500/30 rounded-xl px-4 py-3 text-sm text-error-400">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} disabled={password.length > 0 && password.length < 6}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-default">
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}