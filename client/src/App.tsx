import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import TitleBar from './components/TitleBar'
import SplashScreen from './components/SplashScreen'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import QuizSetup from './pages/QuizSetup'
import QuizResult from './pages/QuizResult'
import BattleLobby from './pages/BattleLobby'
import Battle from './pages/Battle'
import BattleResult from './pages/BattleResult'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ToastContainer from './components/Toast'
import { useAuthStore } from './stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  if (showSplash) {
    return (
      <>
        <TitleBar />
        <SplashScreen onDone={handleSplashDone} />
      </>
    )
  }

  return (
    <>
    <TitleBar />
    <ToastContainer />
    <Routes>
      {/* Public routes — no Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/quiz/setup" element={<QuizSetup />} />
        <Route path="/quiz/play" element={<Quiz />} />
        <Route path="/quiz/result" element={<QuizResult />} />
        <Route path="/battle" element={<BattleLobby />} />
        <Route path="/battle/lobby" element={<BattleLobby />} />
        <Route path="/battle/play" element={<Battle />} />
        <Route path="/battle/result" element={<BattleResult />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
