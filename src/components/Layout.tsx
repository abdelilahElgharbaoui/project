'use client';

import { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  DoorOpen, 
  Package, 
  Wrench, 
  Settings, 
  History,
  User,
  Shield,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'admin' | 'user';
  onRoleChange?: (role: 'admin' | 'user') => void;
}

export default function Layout({ children, activeTab, onTabChange, userRole, onRoleChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'rooms', label: 'Gestion des Salles', icon: DoorOpen },
    { id: 'stock', label: 'Gestion du Stock', icon: Package },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'scenarios', label: 'Scénarios', icon: Settings },
    { id: 'history', label: 'Historique', icon: History },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Superposition du menu mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Barre latérale */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* En-tête */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <DoorOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">MedRoom</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6 px-3 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 mb-1 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sélecteur de rôle (à des fins de démonstration) */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Rôle Actuel</span>
                {userRole === 'admin' ? (
                  <Shield className="w-4 h-4 text-blue-600" />
                ) : (
                  <User className="w-4 h-4 text-green-600" />
                )}
              </div>
              {onRoleChange && (
                <button
                  onClick={() => onRoleChange(userRole === 'admin' ? 'user' : 'admin')}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    userRole === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {userRole === 'admin' ? 'Administrateur' : 'Utilisateur Standard'}
                </button>
              )}
              {!onRoleChange && (
                <div className={`w-full px-3 py-2 rounded-md text-sm font-medium ${
                  userRole === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {userRole === 'admin' ? 'Administrateur' : 'Utilisateur Standard'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Barre supérieure */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Bon retour, {user?.first_name} {user?.last_name}
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Contenu de la page */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}