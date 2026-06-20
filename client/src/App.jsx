import { Routes, Route, Navigate } from 'react-router-dom'
import { PracticeProvider } from './context/PracticeContext.jsx'

// Layout
import PageWrapper from './components/layout/PageWrapper.jsx'
import RoleGuard from './features/auth/RoleGuard.jsx'

// Pages
import LoginPage from './features/auth/LoginPage.jsx'
import SignupPage from './features/auth/SignupPage.jsx'
import DashboardPage from './features/dashboard/DashboardPage.jsx'
import PracticePage from './features/practice/PracticePage.jsx'
import ResultPage from './features/grading/ResultPage.jsx'
import CheatSheetPage from './features/cheatsheet/CheatSheetPage.jsx'
import TeacherReportPage from './features/reports/TeacherReportPage.jsx'
import ParentReportPage from './features/reports/ParentReportPage.jsx'

function App() {
  return (
    <PageWrapper>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboard — all authenticated roles */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Student routes */}
        <Route
          path="/practice"
          element={
            <RoleGuard allowedRoles={['student']}>
              <PracticeProvider>
                <PracticePage />
              </PracticeProvider>
            </RoleGuard>
          }
        />
        <Route
          path="/practice/result/:attemptId"
          element={
            <RoleGuard allowedRoles={['student']}>
              <ResultPage />
            </RoleGuard>
          }
        />
        <Route path="/cheatsheet" element={<CheatSheetPage />} />

        {/* Teacher routes */}
        <Route
          path="/reports/teacher/:studentId"
          element={
            <RoleGuard allowedRoles={['teacher']}>
              <TeacherReportPage />
            </RoleGuard>
          }
        />

        {/* Parent routes */}
        <Route
          path="/reports/parent/:studentId"
          element={
            <RoleGuard allowedRoles={['parent']}>
              <ParentReportPage />
            </RoleGuard>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </PageWrapper>
  )
}

export default App
