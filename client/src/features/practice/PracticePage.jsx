// PracticePage — Full practice flow
// Setup → Question Display → Answer Input → Submit → Grade → Result

import { useState, useContext, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { usePractice } from '../../context/PracticeContext'
import { getQuestions } from '../../services/questionService'
import { submitAttempt } from '../../services/attemptService'
import { gradeAttempt } from '../../services/gradingService'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Loader from '../../components/ui/Loader'

const SUBTOPICS = [
  { value: '', label: 'All Topics', icon: '📖' },
  { value: 'factorization', label: 'Factorization', icon: '🔢' },
  { value: 'quadratic_formula', label: 'Quadratic Formula', icon: '📐' },
  { value: 'completing_the_square', label: 'Completing the Square', icon: '⬜' },
  { value: 'nature_of_roots', label: 'Nature of Roots', icon: '🌱' },
  { value: 'word_problems', label: 'Word Problems', icon: '📝' },
]

export default function PracticePage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const {
    questions, currentQuestion, currentIndex, totalQuestions,
    progress, answers, sessionActive,
    startSession, goToNext, goToPrevious, saveAnswer, endSession,
  } = usePractice()

  const location = useLocation()
  const [phase, setPhase] = useState('setup')
  const initialSubtopic = location.state?.subtopic || ''
  const [selectedSubtopic, setSelectedSubtopic] = useState(initialSubtopic)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [inputMode, setInputMode] = useState('typed')
  const [submitting, setSubmitting] = useState(false)
  const [gradingResult, setGradingResult] = useState(null)
  const [error, setError] = useState('')

  // Load saved answer when navigating between questions
  useEffect(() => {
    if (currentQuestion) {
      const saved = answers[currentQuestion.question_id]
      setAnswerText(saved?.transcribed_text || '')
      setInputMode(saved?.input_mode || 'typed')
    }
  }, [currentIndex, currentQuestion, answers])

  // ── SETUP PHASE ──
  const handleStartPractice = async () => {
    setLoadingQuestions(true)
    setError('')
    try {
      const filters = { limit: 10 }
      if (selectedSubtopic) filters.subtopic = selectedSubtopic
      const result = await getQuestions(filters)
      const qs = result.questions || result
      if (!qs.length) {
        setError('No questions found. Try another topic.')
        return
      }
      startSession(qs)
      setPhase('practice')
    } catch (err) {
      setError('Failed to load questions. Check your connection.')
    } finally {
      setLoadingQuestions(false)
    }
  }

  // ── SUBMIT & GRADE ──
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() && inputMode !== 'photo') {
      setError('Please write your answer before submitting.')
      return
    }
    setSubmitting(true)
    setError('')
    setPhase('grading')

    try {
      // Save answer locally
      saveAnswer(currentQuestion.question_id, {
        input_mode: inputMode,
        transcribed_text: answerText,
      })

      // Submit attempt to backend
      const attempt = await submitAttempt({
        student_id: user.id,
        question_id: currentQuestion.question_id,
        input_mode: inputMode,
        transcribed_text: inputMode === 'photo' ? null : answerText,
        raw_input: inputMode === 'photo' ? answerText : null,
      })

      // Grade the attempt via AI
      const evaluation = await gradeAttempt(attempt.attempt_id)
      setGradingResult(evaluation)
      setPhase('result')
    } catch (err) {
      setError(err.response?.data?.detail || 'Grading failed. Please try again.')
      setPhase('practice')
    } finally {
      setSubmitting(false)
    }
  }

  // ── NEXT QUESTION ──
  const handleNextQuestion = () => {
    setGradingResult(null)
    setAnswerText('')
    if (currentIndex < totalQuestions - 1) {
      goToNext()
      setPhase('practice')
    } else {
      endSession()
      setPhase('setup')
      navigate('/dashboard')
    }
  }

  // ── SETUP VIEW ──
  if (phase === 'setup') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold gradient-text mb-2">Practice Mode</h1>
          <p className="text-surface-400">Choose a subtopic and start solving</p>
        </div>

        {/* Subtopic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {SUBTOPICS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedSubtopic(s.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-default cursor-pointer ${
                selectedSubtopic === s.value
                  ? 'border-primary-500 bg-primary-600/15 text-primary-300 shadow-glow'
                  : 'border-surface-600 bg-surface-800/50 text-surface-300 hover:border-surface-500 hover:bg-surface-700/50'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-sm font-medium text-center">{s.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-error-500/10 border border-error-500/30 rounded-xl px-4 py-3 text-sm text-error-400 mb-4">
            {error}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStartPractice}
          loading={loadingQuestions}
        >
          🚀 Start Practice
        </Button>
      </div>
    )
  }

  // ── GRADING VIEW ──
  if (phase === 'grading') {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card variant="glass" className="text-center max-w-md w-full mx-4">
          <Loader size="lg" />
          <h2 className="text-xl font-bold text-surface-50 mt-6 mb-2">AI is grading your answer...</h2>
          <p className="text-surface-400 text-sm">
            Gemini 2.5 Flash is analyzing each step against the rubric
          </p>
          <div className="mt-4">
            <div className="w-full bg-surface-700 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // ── RESULT VIEW ──
  if (phase === 'result' && gradingResult) {
    const score = gradingResult.total_marks_awarded || 0
    const maxMarks = gradingResult.total_max_marks || 1
    const pct = Math.round((score / maxMarks) * 100)
    const steps = gradingResult.step_marks || []

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Score Header */}
        <Card variant="glass" className="text-center mb-6">
          <div className="text-6xl font-bold mb-2">
            <span className={pct >= 75 ? 'text-accent-400' : pct >= 40 ? 'text-warning-400' : 'text-error-400'}>
              {score}
            </span>
            <span className="text-surface-500 text-3xl">/{maxMarks}</span>
          </div>
          <p className="text-surface-400 mb-3">
            {pct >= 75 ? '🌟 Excellent!' : pct >= 40 ? '👍 Good effort!' : '💪 Keep practicing!'}
          </p>
          <Badge variant={pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'error'}>
            {pct}%
          </Badge>
          <p className="text-xs text-surface-500 mt-2">
            Confidence: {gradingResult.confidence_flag || gradingResult.confidence || 'N/A'}
          </p>
        </Card>

        {/* Step-by-Step Breakdown */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-surface-50 mb-4">Step-by-Step Breakdown</h3>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  step.marks_awarded === step.max_marks
                    ? 'border-accent-500/30 bg-accent-500/5'
                    : step.marks_awarded > 0
                    ? 'border-warning-400/30 bg-warning-400/5'
                    : 'border-error-500/30 bg-error-500/5'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.marks_awarded === step.max_marks
                    ? 'bg-accent-500/20 text-accent-400'
                    : step.marks_awarded > 0
                    ? 'bg-warning-400/20 text-warning-400'
                    : 'bg-error-500/20 text-error-400'
                }`}>
                  {step.marks_awarded === step.max_marks ? '✓' : step.marks_awarded > 0 ? '~' : '✗'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-surface-200">Step {step.step_id}</span>
                    <Badge variant={step.marks_awarded === step.max_marks ? 'success' : step.marks_awarded > 0 ? 'warning' : 'error'} size="sm">
                      {step.marks_awarded}/{step.max_marks}
                    </Badge>
                  </div>
                  <p className="text-xs text-surface-400">{step.justification}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Feedback */}
        <Card variant="glass" className="mb-6">
          <h3 className="text-lg font-semibold text-surface-50 mb-2">💡 AI Feedback</h3>
          <p className="text-surface-300 text-sm leading-relaxed">
            {gradingResult.feedback_text || gradingResult.feedback}
          </p>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => { setPhase('practice'); setGradingResult(null); setAnswerText('') }}>
            🔄 Retry
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleNextQuestion}>
            {currentIndex < totalQuestions - 1 ? '➡️ Next Question' : '🏁 Finish'}
          </Button>
        </div>
      </div>
    )
  }

  // ── PRACTICE VIEW (Main) ──
  if (!currentQuestion) {
    return <Loader />
  }

  const meta = currentQuestion.question_metadata
  const metadata = Array.isArray(meta) ? meta[0] : meta

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-surface-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-surface-400">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Question Card */}
      <Card variant="glass" className="mb-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="primary">{currentQuestion.subtopic?.replace(/_/g, ' ')}</Badge>
          <Badge variant="secondary">{currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}</Badge>
          {metadata?.is_hot_question && <Badge variant="warning">🔥 Hot</Badge>}
          {metadata?.difficulty && (
            <Badge variant={metadata.difficulty === 'hard' ? 'error' : metadata.difficulty === 'medium' ? 'warning' : 'success'}>
              {metadata.difficulty}
            </Badge>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-surface-50 leading-relaxed">
          {currentQuestion.question_text}
        </h2>
      </Card>

      {/* Input Mode Tabs */}
      <div className="flex gap-2 mb-4">
        {['typed', 'voice', 'photo'].map((mode) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-default cursor-pointer ${
              inputMode === mode
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/50'
                : 'bg-surface-800 text-surface-400 border border-surface-600 hover:border-surface-500'
            }`}
          >
            {mode === 'typed' && '⌨️'}
            {mode === 'voice' && '🎤'}
            {mode === 'photo' && '📷'}
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Answer Input */}
      <Card className="mb-6">
        {inputMode === 'typed' && (
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Your Solution</label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your step-by-step solution here...&#10;&#10;Step 1: ...&#10;Step 2: ...&#10;Step 3: ..."
              rows={8}
              className="w-full bg-surface-900 border border-surface-600 rounded-xl px-4 py-3 text-surface-50 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-default resize-none font-mono text-sm"
            />
            <p className="mt-1.5 text-xs text-surface-500">
              Tip: Show each step clearly for maximum marks
            </p>
          </div>
        )}

        {inputMode === 'voice' && (
          <VoiceInput
            value={answerText}
            onChange={setAnswerText}
          />
        )}

        {inputMode === 'photo' && (
          <PhotoInput
            onCapture={(text) => setAnswerText(text)}
          />
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-error-500/10 border border-error-500/30 rounded-xl px-4 py-3 text-sm text-error-400 mb-4">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            if (currentIndex > 0) goToPrevious()
          }}
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>
        <div className="flex-1" />
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmitAnswer}
          loading={submitting}
          disabled={!answerText.trim() && inputMode !== 'photo'}
        >
          Submit & Grade ✨
        </Button>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex justify-center gap-1.5 mt-8">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPhase('practice'); setGradingResult(null); }}
            className={`w-2.5 h-2.5 rounded-full transition-default cursor-pointer ${
              i === currentIndex
                ? 'bg-primary-500 scale-125'
                : answers[questions[i]?.question_id]
                ? 'bg-accent-500'
                : 'bg-surface-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}


// ── VOICE INPUT SUB-COMPONENT ──
function VoiceInput({ value, onChange }) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  )
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.continuous = true

    recognition.onresult = (event) => {
      let newText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newText += event.results[i][0].transcript + ' '
        }
      }
      if (newText.trim()) {
        onChange((prev) => (prev ? prev + ' ' : '') + newText.trim())
      }
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)

    // Auto-stop after 60s
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
    }, 60000)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setListening(false)
  }

  if (!supported) {
    return (
      <div className="text-center py-8 text-surface-400">
        <p className="text-lg mb-2">🎤</p>
        <p>Voice input is not supported in this browser.</p>
        <p className="text-sm">Try Chrome or Edge.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant={listening ? 'danger' : 'primary'}
          onClick={listening ? stopListening : startListening}
        >
          {listening ? '⏹ Stop Recording' : '🎤 Start Speaking'}
        </Button>
        {listening && (
          <span className="flex items-center gap-2 text-sm text-error-400">
            <span className="w-2 h-2 bg-error-500 rounded-full animate-pulse" />
            Listening...
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your voice will be transcribed here. You can also edit the text."
        rows={6}
        className="w-full bg-surface-900 border border-surface-600 rounded-xl px-4 py-3 text-surface-50 placeholder-surface-500 focus:border-primary-500 outline-none transition-default resize-none text-sm"
      />
    </div>
  )
}


// ── PHOTO INPUT SUB-COMPONENT ──
function PhotoInput({ onCapture }) {
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target.result)
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64 = event.target.result.split(',')[1]
      onCapture(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="border-2 border-dashed border-surface-600 rounded-xl p-6 text-center hover:border-primary-500/50 transition-default">
        {preview ? (
          <div>
            <img src={preview} alt="Answer" className="max-h-64 mx-auto rounded-lg mb-3" />
            <Button variant="ghost" size="sm" onClick={() => { setPreview(null); onCapture('') }}>
              ✕ Remove
            </Button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-surface-300 font-medium mb-1">Upload your handwritten answer</p>
            <p className="text-surface-500 text-sm">Click to browse or drag & drop</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  )
}
