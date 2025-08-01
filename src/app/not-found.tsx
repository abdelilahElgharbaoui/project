'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Redirect after a short delay to show the 404 message
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.push('/');
        } else {
          router.push('/login');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push(isAuthenticated ? '/' : '/login')}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isAuthenticated ? 'Retour au tableau de bord' : 'Aller à la connexion'}
          </button>
          
          <p className="text-sm text-gray-500">
            Redirection automatique dans 3 secondes...
          </p>
        </div>
      </div>
    </div>
  );
} 