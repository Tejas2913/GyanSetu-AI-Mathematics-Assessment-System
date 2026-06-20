// analyticsService.js — GET weak topics, performance data

import api from './api'

export async function getWeakTopics(studentId) {
  const { data } = await api.get(`/analytics/${studentId}/weak-topics`)
  return data
}

export async function getPerformance(studentId, days = 30) {
  const { data } = await api.get(`/analytics/${studentId}/performance?days=${days}`)
  return data
}
