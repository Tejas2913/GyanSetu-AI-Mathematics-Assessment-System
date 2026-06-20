// attemptService.js — POST attempt, GET history

import api from './api'

export async function submitAttempt({ student_id, question_id, input_mode, raw_input, transcribed_text }) {
  const { data } = await api.post('/attempts', {
    student_id,
    question_id,
    input_mode,
    raw_input,
    transcribed_text,
  })
  return data
}

export async function getAttemptHistory(studentId, { limit = 20, offset = 0 } = {}) {
  const { data } = await api.get(`/attempts/${studentId}?limit=${limit}&offset=${offset}`)
  return data
}
