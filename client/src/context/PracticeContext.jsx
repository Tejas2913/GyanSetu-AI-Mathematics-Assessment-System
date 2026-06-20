// PracticeContext — Manages current practice session state
// Tracks: current question index, selected questions, answers, session progress

import { createContext, useState, useContext, useCallback } from 'react'

const PracticeContext = createContext(null)

export function PracticeProvider({ children }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: { input_mode, raw_input, transcribed_text } }
  const [sessionActive, setSessionActive] = useState(false)

  const currentQuestion = questions[currentIndex] || null
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0

  const startSession = useCallback((questionList) => {
    setQuestions(questionList)
    setCurrentIndex(0)
    setAnswers({})
    setSessionActive(true)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))
  }, [questions.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const goToQuestion = useCallback((index) => {
    setCurrentIndex(index)
  }, [])

  const saveAnswer = useCallback((questionId, answerData) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerData }))
  }, [])

  const endSession = useCallback(() => {
    setSessionActive(false)
  }, [])

  return (
    <PracticeContext.Provider
      value={{
        questions,
        currentQuestion,
        currentIndex,
        totalQuestions,
        progress,
        answers,
        sessionActive,
        startSession,
        goToNext,
        goToPrevious,
        goToQuestion,
        saveAnswer,
        endSession,
      }}
    >
      {children}
    </PracticeContext.Provider>
  )
}

export function usePractice() {
  const context = useContext(PracticeContext)
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider')
  }
  return context
}

export { PracticeContext }
