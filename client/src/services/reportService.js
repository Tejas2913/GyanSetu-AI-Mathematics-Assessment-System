// reportService.js — GET / generate reports for teachers and parents

import api from './api'

export async function generateTeacherReport(studentId) {
  const { data } = await api.post(`/reports/teacher/${studentId}`)
  return data
}

export async function getTeacherReport(studentId) {
  const { data } = await api.get(`/reports/teacher/${studentId}`)
  return data
}

export async function generateParentReport(studentId) {
  const { data } = await api.post(`/reports/parent/${studentId}`)
  return data
}

export async function getParentReport(studentId) {
  const { data } = await api.get(`/reports/parent/${studentId}`)
  return data
}
