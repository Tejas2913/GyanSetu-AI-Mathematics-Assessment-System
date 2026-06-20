// formatters.js — Date, score, and math formatting helpers

/**
 * Format a score as a percentage string
 */
export function formatScorePercent(awarded, max) {
  if (!max || max === 0) return '0%'
  return `${Math.round((awarded / max) * 100)}%`
}

/**
 * Format a score as "3/4" style
 */
export function formatScoreFraction(awarded, max) {
  return `${awarded}/${max}`
}

/**
 * Format a date to a human-readable relative string
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date for display in reports
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Get the color variant for a topic status
 */
export function getStatusVariant(status) {
  const map = {
    strong: 'success',
    average: 'warning',
    weak: 'error',
  }
  return map[status] || 'default'
}

/**
 * Get the color variant for a confidence flag
 */
export function getConfidenceVariant(flag) {
  const map = {
    high: 'success',
    medium: 'warning',
    low: 'error',
  }
  return map[flag] || 'default'
}
