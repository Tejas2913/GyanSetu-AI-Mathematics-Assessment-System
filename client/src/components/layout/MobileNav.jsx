// MobileNav — Bottom navigation bar for mobile screens
// Shows role-specific navigation items

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const studentNav = [
  { to: '/dashboard', label: 'Home', icon: '📊' },
  { to: '/practice', label: 'Practice', icon: '✏️' },
  { to: '/cheatsheet', label: 'Formulas', icon: '📐' },
]

const teacherNav = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
]

const parentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
]

export default function MobileNav() {
  const { user, role } = useAuth()

  if (!user) return null

  const navItems =
    role === 'teacher' ? teacherNav :
    role === 'parent' ? parentNav :
    studentNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-surface-700/50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-default ${
                isActive ? 'text-primary-400' : 'text-surface-400 hover:text-surface-200'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
