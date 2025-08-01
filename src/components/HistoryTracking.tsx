'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Calendar,
  User,
  DoorOpen,
  Package,
  Wrench,
  Filter
} from 'lucide-react';
import { reservationApi, roomApi, maintenanceApi, stockApi } from '@/lib/api';

interface HistoryTrackingProps {
  userRole: 'admin' | 'user';
}

interface HistoryEvent {
  id: string;
  type: 'reservation' | 'maintenance' | 'stock';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  roomId?: string;
  status: string;
}

export default function HistoryTracking({ userRole }: HistoryTrackingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistoryData();
  }, [dateRange]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données des différentes APIs
      const [reservationsResponse, maintenanceResponse, stockResponse, roomsResponse] = await Promise.all([
        reservationApi.getReservations(),
        maintenanceApi.getMaintenanceTasks(),
        stockApi.getStockItems(),
        roomApi.getRooms()
      ]);

      if (reservationsResponse.success && maintenanceResponse.success && stockResponse.success && roomsResponse.success) {
        const reservations = reservationsResponse.data as any[];
        const maintenanceTasks = maintenanceResponse.data as any[];
        const stockItems = stockResponse.data as any[];
        const roomsData = roomsResponse.data as any[];

        setRooms(roomsData);

        // Convertir en événements d'historique
        const events: HistoryEvent[] = [];

        // Ajouter les événements de réservation
        reservations.forEach(reservation => {
          events.push({
            id: `res-${reservation.id}`,
            type: 'reservation',
            title: 'Salle Réservée',
            description: `${reservation.userName} a réservé une salle pour ${reservation.scenario}`,
            timestamp: new Date(reservation.startTime),
            user: reservation.userName,
            roomId: reservation.roomId,
            status: reservation.status
          });
        });

        // Ajouter les événements de maintenance
        maintenanceTasks.forEach(task => {
          events.push({
            id: `maint-${task.id}`,
            type: 'maintenance',
            title: task.title,
            description: task.description,
            timestamp: new Date(task.scheduledDate),
            user: task.assignedTo,
            roomId: task.roomId,
            status: task.status
          });
        });

        // Ajouter les événements de stock (simplifié - vous pourriez vouloir ajouter un historique réel des mouvements de stock)
        stockItems.forEach(item => {
          if (item.currentStock <= item.minStock) {
            events.push({
              id: `stock-${item.id}`,
              type: 'stock',
              title: 'Alerte de Stock Faible',
              description: `${item.name} est en rupture (${item.currentStock} ${item.unit})`,
              timestamp: new Date(item.lastRestocked),
              user: 'Système',
              status: 'alerte'
            });
          }
        });

        // Trier par timestamp (plus récent en premier)
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setHistoryEvents(events);
      } else {
        setError('Échec de la récupération des données d\'historique');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des données d\'historique:', err);
      setError('Échec du chargement des données d\'historique');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = historyEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    
    // Filtrer par plage de dates
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    const matchesDate = event.timestamp >= cutoffDate;
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'reservation': return Calendar;
      case 'maintenance': return Wrench;
      case 'stock': return Package;
      default: return History;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'reservation': return 'text-blue-600 bg-blue-50';
      case 'maintenance': return 'text-amber-600 bg-amber-50';
      case 'stock': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terminée':
      case 'confirmée':
        return 'bg-green-100 text-green-800';
      case 'annulée':
        return 'bg-red-100 text-red-800';
      case 'programmée':
        return 'bg-blue-100 text-blue-800';
      case 'en-cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'alerte':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Suivi de l'Historique</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <History className="w-4 h-4" />
          <span>Journal d'Activité</span>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total des Événements</p>
              <p className="text-2xl font-bold text-gray-900">{historyEvents.length}</p>
            </div>
            <History className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Réservations</p>
              <p className="text-2xl font-bold text-blue-600">
                {historyEvents.filter(event => event.type === 'reservation').length}
              </p>
            </div>
            <DoorOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-amber-600">
                {historyEvents.filter(event => event.type === 'maintenance').length}
              </p>
            </div>
            <Wrench className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans l'historique..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les Types</option>
              <option value="reservation">Réservations</option>
              <option value="maintenance">Maintenance</option>
              <option value="stock">Stock</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
              <option value="365">Dernière année</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chronologie de l'historique */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chronologie d'Activité</h2>
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const Icon = getEventIcon(event.type);
              const room = event.roomId ? rooms.find((r: any) => r.id === event.roomId) : null;
              
              return (
                <div key={event.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.user}
                          </div>
                          {room && (
                            <div className="flex items-center gap-1">
                              <DoorOpen className="w-3 h-3" />
                              {room.name}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)} capitalize`}>
                          {event.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize`}>
                          {event.type === 'reservation' ? 'réservation' : 
                           event.type === 'maintenance' ? 'maintenance' : 
                           event.type === 'stock' ? 'stock' : event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}