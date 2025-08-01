'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import RoomManagement from '@/components/RoomManagement';
import StockManagement from '@/components/StockManagement';
import MaintenanceManagement from '@/components/MaintenanceManagement';
import ScenarioManagement from '@/components/ScenarioManagement';
import HistoryTracking from '@/components/HistoryTracking';
import ChatBot from '@/components/ChatBot';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userRole={user?.role || 'user'}
      onRoleChange={() => {}} // Remove role switching since we're using real auth
    >
      {activeTab === 'dashboard' && <Dashboard userRole={user?.role || 'user'} />}
      {activeTab === 'rooms' && <RoomManagement userRole={user?.role || 'user'} />}
      {activeTab === 'stock' && <StockManagement userRole={user?.role || 'user'} />}
      {activeTab === 'maintenance' && <MaintenanceManagement userRole={user?.role || 'user'} />}
      {activeTab === 'scenarios' && <ScenarioManagement userRole={user?.role || 'user'} />}
      {activeTab === 'history' && <HistoryTracking userRole={user?.role || 'user'} />}
      <ChatBot />
    </Layout>
  );
}