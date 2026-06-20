// useQuestions — Fetch + cache questions from API

import { useState, useEffect, useCallback } from 'react'
import { getQuestions } from '../services/questionService'

export function useQuestions(filters = {}) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getQuestions(filters)
      // API returns { questions: [...], count: N }
      const qs = data.questions || data
      setQuestions(Array.isArray(qs) ? qs : [])
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  return { questions, loading, error, refetch: fetchQuestions }
}
