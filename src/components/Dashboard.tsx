'use client';

import { 
  DoorOpen, 
  Package, 
  Wrench, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { dashboardApi, roomApi, reservationApi, stockApi, maintenanceApi } from '@/lib/api';

interface DashboardProps {
  userRole: 'admin' | 'user';
}

export default function Dashboard({ userRole }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [stats, setStats] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Définir l'heure initiale
    const interval = setInterval(updateTime, 1000); // Mettre à jour chaque seconde
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les données des APIs individuelles
        const [statsResponse, roomsResponse, reservationsResponse, stockResponse, maintenanceResponse] = await Promise.all([
          dashboardApi.getStats(),
          roomApi.getRooms(),
          reservationApi.getReservations(),
          stockApi.getStockItems(),
          maintenanceApi.getMaintenanceTasks()
        ]);

        if (statsResponse.success && roomsResponse.success && reservationsResponse.success && stockResponse.success && maintenanceResponse.success) {
          const dashboardStats = statsResponse.data as any;
          const roomsData = roomsResponse.data as any[];
          const reservations = reservationsResponse.data as any[];
          const stockItems = stockResponse.data as any[];
          const maintenanceTasks = maintenanceResponse.data as any[];
          
          // Calculer les statistiques
          const availableRooms = roomsData.filter((room: any) => room.status === 'disponible').length;
          const todayReservations = reservations.filter((res: any) => {
            const today = new Date().toDateString();
            const resDate = new Date(res.startTime).toDateString();
            return resDate === today;
          }).length;
          const lowStockItems = stockItems.filter((item: any) => item.currentStock <= item.minStock).length;
          const pendingMaintenance = maintenanceTasks.filter((task: any) => task.status === 'programmée').length;
          
          const statsArray = [
            {
              title: 'Salles Disponibles',
              value: availableRooms,
              total: roomsData.length,
              icon: DoorOpen,
              color: 'text-green-600',
              bgColor: 'bg-green-50',
            },
            {
              title: 'Réservations d\'Aujourd\'hui',
              value: todayReservations,
              total: reservations.length,
              icon: Calendar,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
            },
            {
              title: 'Alertes de Stock Faible',
              value: lowStockItems,
              total: stockItems.length,
              icon: Package,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50',
            },
            {
              title: 'Maintenance en Attente',
              value: pendingMaintenance,
              total: maintenanceTasks.length,
              icon: Wrench,
              color: 'text-red-600',
              bgColor: 'bg-red-50',
            },
          ];

          setStats(statsArray);
          setRooms(roomsData);
          setRecentReservations(reservations.slice(0, 3));
          setStockAlerts(stockItems.filter((item: any) => item.currentStock <= item.minStock).slice(0, 3));
        } else {
          setError('Échec de la récupération des données du tableau de bord');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        setError('Échec du chargement des données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {currentTime || 'Chargement...'}
        </div>
      </div>

      {/* Grille des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.total && (
                      <p className="text-sm text-gray-500">/ {stat.total}</p>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Réservations récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Réservations Récentes</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentReservations.slice(0, 3).map((reservation) => {
              const room = rooms.find(r => r.id === reservation.roomId);
              return (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{room?.name || 'Salle Inconnue'}</p>
                    <p className="text-sm text-gray-600">{reservation.userName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'confirmée' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aperçu du statut des salles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Statut des Salles</h2>
            <DoorOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {rooms.slice(0, 4).map((room) => (
              <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{room.name}</p>
                  <p className="text-sm text-gray-600">Étage {room.floor} • {room.type}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  room.status === 'disponible' 
                    ? 'bg-green-100 text-green-800'
                    : room.status === 'occupée'
                    ? 'bg-red-100 text-red-800'
                    : room.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes de maintenance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Alertes de Stock</h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stockAlerts.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    {item.currentStock} {item.unit}
                  </p>
                  <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}