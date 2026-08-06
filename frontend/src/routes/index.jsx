import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import Dashboard from '../pages/Dashboard'
import Income from '../pages/Income'
import Expenses from '../pages/Expenses'
import Goals from '../pages/Goals'
import Reports from '../pages/Reports'
import Analytics from '../pages/Analytics'
import AIChat from '../pages/AIChat'
import Calendar from '../pages/Calendar'
import Budgets from '../pages/Budgets'
import Subscriptions from '../pages/Subscriptions'
import Achievements from '../pages/Achievements'
import Settings from '../pages/Settings'
import Statements from '../pages/Statements'
import NotFound from '../pages/NotFound'

function HomeRedirect() {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return null
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/login" state={{ from: location.pathname }} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="income" element={<Income />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="goals" element={<Goals />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="insights" element={<AIChat />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="statements" element={<Statements />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
