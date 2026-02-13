import React, { useState } from 'react';
import { Waves } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, {
        email,
        password
      });

      const { token, user_id, email: userEmail } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('email', userEmail);

      toast.success(isLogin ? 'Вход выполнен!' : 'Регистрация успешна!');
      onLogin();
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Ошибка аутентификации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #050A14 0%, #0A1628 50%, #050A14 100%)' }}>
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-8 w-full max-w-md relative z-10" data-testid="auth-form">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-center">AquaGacha</h1>
          <p className="text-gray-400 text-sm mt-2">Собери коллекцию редких рыбок</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-white"
              placeholder="your@email.com"
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-white"
              placeholder="••••••••"
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 rounded-lg font-bold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            data-testid="auth-submit-btn"
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            data-testid="toggle-auth-mode"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  );
}