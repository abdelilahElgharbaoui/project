'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Building2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect to main page if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Force white background
  useEffect(() => {
    document.body.style.background = 'white';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400/30 border-t-blue-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400/20"></div>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://3.88.252.96:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Use auth context to login
      login(data.token, data.user);

      // Redirect to main page
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden" data-page="login">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <Heart className="h-10 w-10 text-white drop-shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold text-black mb-3">
            Bienvenue
          </h2>
          <p className="text-black text-lg">
            Connectez-vous à votre compte hospitalier
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Adresse Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-4 pr-12 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 hover:border-gray-400"
                  placeholder="votre@email.com"
                />
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-4 pr-20 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 placeholder-gray-500 hover:border-gray-400"
                  placeholder="••••••••"
                />
                <div className="absolute top-1/2 right-12 transform -translate-y-1/2 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-600" />
                </div>
                <button
                  type="button"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span className="text-lg">Connexion en cours...</span>
                </div>
              ) : (
                <span className="text-lg text-black">Se Connecter</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
            <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Comptes de démonstration
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                <div className="text-blue-700 font-semibold mb-1">👨‍⚕️ Administrateur</div>
                <div className="text-gray-600 text-xs">
                  <span className="font-medium">Email:</span> admin@hospital.com
                </div>
                <div className="text-gray-600 text-xs">
                  <span className="font-medium">Mot de passe:</span> admin123
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100 shadow-sm">
                <div className="text-purple-700 font-semibold mb-1">👤 Utilisateur</div>
                <div className="text-gray-600 text-xs">
                  <span className="font-medium">Email:</span> user@hospital.com
                </div>
                <div className="text-gray-600 text-xs">
                  <span className="font-medium">Mot de passe:</span> user123
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">
            Système de Gestion Hospitalière
          </p>
          <p className="text-xs text-gray-500 mt-1">
            © 2024 MedRoom - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
} 