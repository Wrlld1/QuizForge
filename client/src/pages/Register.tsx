import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({})

  const validate = () => {
    const errs: typeof errors = {}
    if (!username.trim()) errs.username = 'Введите имя пользователя'
    else if (username.length < 3) errs.username = 'Минимум 3 символа'
    if (!email.trim()) errs.email = 'Введите email'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Некорректный email'
    if (!password) errs.password = 'Введите пароль'
    else if (password.length < 6) errs.password = 'Минимум 6 символов'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    await register(username, email, password)
    if (useAuthStore.getState().token) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-8">
      <div className="w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">QuizForge</h1>
          <p className="text-gray-400 mt-1">Создайте аккаунт</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-5"
        >
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg p-3 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Имя пользователя</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 outline-none transition-all border ${
                  errors.username ? 'border-red-500' : 'border-transparent focus:border-purple-500'
                }`}
                placeholder="Ваше имя"
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Эл. почта</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 outline-none transition-all border ${
                  errors.email ? 'border-red-500' : 'border-transparent focus:border-purple-500'
                }`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Пароль</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 outline-none transition-all border ${
                  errors.password ? 'border-red-500' : 'border-transparent focus:border-purple-500'
                }`}
                placeholder="Минимум 6 символов"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all duration-300"
          >
            {isLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Войти
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
