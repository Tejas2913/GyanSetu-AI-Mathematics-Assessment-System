// gradingService.js — POST grade, GET evaluation

import api from './api'

export async function gradeAttempt(attemptId) {
  const { data } = await api.post('/grade', { attempt_id: attemptId })
  return data
}

export async function getEvaluation(attemptId) {
  const { data } = await api.get(`/evaluations/${attemptId}`)
  return data
}
