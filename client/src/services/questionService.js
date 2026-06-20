// questionService.js — GET questions, metadata, filtered queries

import api from './api'

export async function getQuestions(filters = {}) {
  const params = new URLSearchParams()
  if (filters.subtopic) params.append('subtopic', filters.subtopic)
  if (filters.marks) params.append('marks', filters.marks)
  if (filters.difficulty) params.append('difficulty', filters.difficulty)
  if (filters.is_hot !== undefined) params.append('is_hot', filters.is_hot)
  if (filters.limit) params.append('limit', filters.limit)

  const { data } = await api.get(`/questions?${params.toString()}`)
  return data
}

export async function getQuestionById(questionId) {
  const { data } = await api.get(`/questions/${questionId}`)
  return data
}

export async function getWeakPracticeQuestions(studentId, limit = 20) {
  const { data } = await api.get(`/questions/weak-practice/${studentId}?limit=${limit}`)
  return data
}
