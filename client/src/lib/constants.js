// constants.js — App-wide constants

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
}

export const INPUT_MODES = {
  TYPED: 'typed',
  VOICE: 'voice',
  PHOTO: 'photo',
}

export const SUBTOPICS = [
  { id: 'factorization', label: 'Factorization' },
  { id: 'quadratic_formula', label: 'Quadratic Formula' },
  { id: 'completing_the_square', label: 'Completing the Square' },
  { id: 'nature_of_roots', label: 'Nature of Roots (Discriminant)' },
  { id: 'word_problems', label: 'Word Problems' },
]

export const MARKS_OPTIONS = [1, 2, 3, 4]

export const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', color: 'success' },
  { id: 'medium', label: 'Medium', color: 'warning' },
  { id: 'hard', label: 'Hard', color: 'error' },
]

export const CONFIDENCE_FLAGS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const TOPIC_STATUS = {
  STRONG: 'strong',
  AVERAGE: 'average',
  WEAK: 'weak',
}
