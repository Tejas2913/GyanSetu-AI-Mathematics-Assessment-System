// Navbar — Top navigation bar
// Renders different links based on user role

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function Navbar() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="glass sticky top-0 z-40 border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">GyanSetu</span>
          </Link>

          {/* Desktop nav links — role-specific */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link to="/dashboard" className="text-surface-300 hover:text-surface-50 transition-default text-sm">
                  Dashboard
                </Link>

                {role === 'student' && (
                  <>
                    <Link to="/practice" className="text-surface-300 hover:text-surface-50 transition-default text-sm">
                      Practice
                    </Link>
                    <Link to="/cheatsheet" className="text-surface-300 hover:text-surface-50 transition-default text-sm">
                      Cheat Sheet
                    </Link>
                  </>
                )}

                {role === 'teacher' && (
                  <span className="text-surface-500 text-xs">
                    View student reports from your dashboard
                  </span>
                )}

                {role === 'parent' && (
                  <span className="text-surface-500 text-xs">
                    View your child's progress from the dashboard
                  </span>
                )}
              </>
            )}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {role && (
                  <Badge variant={role === 'teacher' ? 'primary' : role === 'parent' ? 'success' : 'secondary'} size="sm">
                    {role}
                  </Badge>
                )}
                <span className="text-sm text-surface-400 hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log In</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
