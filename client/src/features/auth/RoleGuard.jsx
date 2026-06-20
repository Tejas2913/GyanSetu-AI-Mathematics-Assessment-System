// RoleGuard — Protects routes based on user role
// Redirects to login if unauthenticated, or to dashboard if wrong role

import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import Loader from '../../components/ui/Loader'

export default function RoleGuard({ allowedRoles, children }) {
  const { user, role, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!role) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'role_missing' }} />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
