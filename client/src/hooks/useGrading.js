// useGrading — Submit answer + get grading result with proper error handling

import { useState, useCallback } from 'react'
import { submitAttempt } from '../services/attemptService'
import { gradeAttempt } from '../services/gradingService'

export function useGrading() {
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitAndGrade = useCallback(async (attemptData) => {
    try {
      setLoading(true)
      setError(null)

      // Step 1: Submit the attempt
      const attempt = await submitAttempt(attemptData)

      // Step 2: Grade the attempt
      const result = await gradeAttempt(attempt.attempt_id)
      setEvaluation(result)

      return { attempt, evaluation: result }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Grading failed. Please try again.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetGrading = useCallback(() => {
    setEvaluation(null)
    setError(null)
  }, [])

  return { evaluation, loading, error, submitAndGrade, resetGrading }
}
