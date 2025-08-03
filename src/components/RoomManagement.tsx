'use client';

import { useState, useEffect } from 'react';
import { 
  DoorOpen, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Users,
  Settings,
  Calendar,
  Clock,
  Edit,
  Trash2,
  X,
  Eye,
  RefreshCw
} from 'lucide-react';
import { roomApi, reservationApi, ApiError } from '@/lib/api';
import { Room } from '@/types';

interface RoomManagementProps {
  userRole: 'admin' | 'user';
}

export default function RoomManagement({ userRole }: RoomManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [roomSchedule, setRoomSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for add/edit
  const [formData, setFormData] = useState({
    name: '',
    type: 'consultation',
    capacity: 4,
    floor: 1,
    status: 'available',
    equipment: [] as string[],
    equipmentInput: ''
  });

  // Reserve form state
  const [reserveForm, setReserveForm] = useState({
    date: '',
    time: '',
    duration: '60',
    scenario: 'consultation',
    notes: ''
  });

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || room.type === filterType;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Fetch rooms from backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    roomApi.getRooms({
      search: searchTerm,
      type: filterType !== 'all' ? filterType : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
    })
      .then(res => setRooms(res.data as Room[]))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchTerm, filterType, filterStatus]);

  // Fetch reservations from backend
  useEffect(() => {
    reservationApi.getReservations()
      .then(res => setReservations(res.data as any[]))
      .catch((err: ApiError) => console.error('Error fetching reservations:', err));
  }, []);

  // Remove the problematic useEffect that was causing too many API calls
  // Room status updates will be handled manually when needed

  const handleReserveRoom = (room: Room) => {
    setSelectedRoom(room);
    setReserveForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      duration: '60',
      scenario: 'consultation',
      notes: ''
    });
    setShowReserveModal(true);
    
    // Fetch room schedule for today
    fetchRoomSchedule(room.id, new Date().toISOString().split('T')[0]);
  };

  const fetchRoomSchedule = async (roomId: string, date: string) => {
    try {
      const response = await fetch(`http://3.88.252.96:5000/api/reservations/room/${roomId}/schedule?date=${date}`);
      const data = await response.json();
      if (data.success) {
        setRoomSchedule(data.data.schedule);
      }
    } catch (err) {
      console.error('Error fetching room schedule:', err);
    }
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowDetailsModal(true);
  };

  const handleAddRoom = () => {
    setFormData({
      name: '',
      type: 'consultation',
      capacity: 4,
      floor: 1,
      status: 'available',
      equipment: [],
      equipmentInput: ''
    });
    setShowAddModal(true);
  };

  const handleEditRoom = (room: Room) => {
    setFormData({
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      floor: room.floor,
      status: room.status,
      equipment: room.equipment,
      equipmentInput: ''
    });
    setSelectedRoom(room);
    setShowEditModal(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      setLoading(true);
      setError(null);
      try {
        await roomApi.deleteRoom(roomId);
        setRooms((rooms) => rooms.filter(room => room.id !== roomId) as Room[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitRoom = async () => {
    if (!formData.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (showEditModal && selectedRoom) {
        const res = await roomApi.updateRoom(selectedRoom.id, {
          ...formData,
          equipment: formData.equipment,
        });
        setRooms((rooms) => rooms.map(room => room.id === selectedRoom.id ? res.data as Room : room));
        setShowEditModal(false);
      } else {
        const res = await roomApi.createRoom({
          ...formData,
          equipment: formData.equipment,
        });
        setRooms((rooms) => [...rooms, res.data as Room]);
        setShowAddModal(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReservation = async () => {
    if (!reserveForm.date || !reserveForm.time || !selectedRoom) return;
    
    setLoading(true);
    setError(null);
    try {
      // Calculate start and end times
      const startDateTime = new Date(`${reserveForm.date}T${reserveForm.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(reserveForm.duration) * 60000);
      
      // Create reservation data according to backend requirements
      const reservationData = {
        roomId: selectedRoom.id,
        userId: 'user1', // Default user ID - in a real app this would come from auth context
        userName: 'Dr. Hamza', // Default user name - in a real app this would come from auth context
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        scenario: reserveForm.scenario,
        status: 'confirmed',
        notes: reserveForm.notes || ''
      };

      console.log('Creating reservation:', reservationData);
      const res = await reservationApi.createReservation(reservationData);
      console.log('Reservation created:', res);

      // Update room status to 'occupied'
      const updatedRoom = await roomApi.updateRoom(selectedRoom.id, {
        ...selectedRoom,
        status: 'occupied'
      });

      setRooms((rooms) => rooms.map(room => room.id === selectedRoom.id ? updatedRoom.data as Room : room));
      
      // Refresh reservations list
      const updatedReservations = await reservationApi.getReservations();
      setReservations(updatedReservations.data as any[]);
      
      alert(`Réservation créée avec succès pour ${selectedRoom.name} le ${reserveForm.date} à ${reserveForm.time}`);
      setShowReserveModal(false);
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      if (err.status === 409 && err.details?.conflicts) {
        // Handle time conflict error
        const conflicts = err.details.conflicts;
        const conflictMessage = conflicts.map((conflict: any) => 
          `- ${conflict.userName}: ${new Date(conflict.startTime).toLocaleString()} - ${new Date(conflict.endTime).toLocaleString()} (${conflict.scenario})`
        ).join('\n');
        
        setError(`Conflit d'horaire détecté!\n\nRéservations existantes:\n${conflictMessage}\n\nVeuillez choisir une autre heure ou une autre salle.`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = () => {
    if (formData.equipmentInput.trim()) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, formData.equipmentInput.trim()],
        equipmentInput: ''
      });
    }
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupée';
      case 'maintenance':
        return 'Maintenance';
      case 'reserved':
        return 'Réservée';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consultation';
      case 'surgery':
        return 'Chirurgie';
      case 'emergency':
        return 'Urgence';
      case 'meeting':
        return 'Réunion';
      case 'imaging':
        return 'Imagerie';
      default:
        return type;
    }
  };

  const getRoomReservations = (roomId: string) => {
    return reservations.filter(reservation => reservation.roomId === roomId);
  };

  const getRoomStatusInfo = (room: Room) => {
    const roomReservations = getRoomReservations(room.id);
    const currentTime = new Date();
    
    // Check for active reservation (simplified check)
    const activeReservation = roomReservations.find(r => {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return currentTime >= start && currentTime <= end;
    });
    
    if (activeReservation) {
      return {
        status: 'occupied',
        text: 'Occupée',
        color: 'bg-red-100 text-red-800',
        details: `Occupée par ${activeReservation.userName}`
      };
    } else if (roomReservations.length > 0) {
      // Check for upcoming reservations today
      const todayReservations = roomReservations.filter(r => {
        const start = new Date(r.startTime);
        return start.toDateString() === currentTime.toDateString();
      });
      
      if (todayReservations.length > 0) {
        return {
          status: 'reserved',
          text: 'Réservée',
          color: 'bg-blue-100 text-blue-800',
          details: `${todayReservations.length} réservation(s) aujourd'hui`
        };
      }
    }
    
    return {
      status: 'available',
      text: 'Disponible',
      color: 'bg-green-100 text-green-800',
      details: 'Aucune réservation prévue'
    };
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await reservationApi.deleteReservation(reservationId);
      
      // Refresh reservations list
      const updatedReservations = await reservationApi.getReservations();
      setReservations(updatedReservations.data as any[]);
      
      // Refresh rooms list to update status
      const updatedRooms = await roomApi.getRooms();
      setRooms(updatedRooms.data as Room[]);
      
      alert('Réservation annulée avec succès');
    } catch (err: any) {
      console.error('Error canceling reservation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedRooms = await roomApi.getRooms();
      setRooms(updatedRooms.data as Room[]);
      
      const updatedReservations = await reservationApi.getReservations();
      setReservations(updatedReservations.data as any[]);
    } catch (err: any) {
      console.error('Error refreshing rooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <div className="text-center text-blue-600">Chargement...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Salles</h1>
        {userRole === 'admin' && (
          <button 
            onClick={handleAddRoom}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une Salle
          </button>
        )}
        <button 
          onClick={handleRefreshRooms}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Rafraîchir
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des salles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="all">Tous les Types</option>
              <option value="consultation">Consultation</option>
              <option value="surgery">Chirurgie</option>
              <option value="emergency">Urgence</option>
              <option value="meeting">Réunion</option>
              <option value="imaging">Imagerie</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="all">Tous les Statuts</option>
              <option value="available">Disponible</option>
              <option value="occupied">Occupée</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Réservée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const statusInfo = getRoomStatusInfo(room);
          return (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    Superficie {room.floor} m2 • {getTypeText(room.type)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Capacité: {room.capacity} personnes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Settings className="w-4 h-4 mr-2" />
                    {room.equipment.length} équipements
                  </div>
                  <div className="text-xs text-gray-500">
                    {statusInfo.details}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Prochaine maintenance: {new Date(room.nextMaintenance).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {statusInfo.status === 'available' && (
                      <button
                        onClick={() => handleReserveRoom(room)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Réserver
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDetails(room)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Détails
                    </button>
                    {userRole === 'admin' && (
                      <>
                        <button 
                          onClick={() => handleEditRoom(room)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)}
                          className="px-3 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Details Modal */}
      {showDetailsModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Détails de la Salle - {selectedRoom.name}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Informations de Base</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Nom:</span> {selectedRoom.name}</div>
                      <div><span className="font-medium">Type:</span> {getTypeText(selectedRoom.type)}</div>
                      <div><span className="font-medium">Étage:</span> {selectedRoom.floor}</div>
                      <div><span className="font-medium">Capacité:</span> {selectedRoom.capacity} personnes</div>
                      <div><span className="font-medium">Statut:</span> 
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoom.status)}`}>
                          {getStatusText(selectedRoom.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Maintenance</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Dernière Maintenance:</span> {new Date(selectedRoom.lastMaintenance).toLocaleDateString()}</div>
                      <div><span className="font-medium">Prochaine Maintenance:</span> {new Date(selectedRoom.nextMaintenance).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Équipements</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRoom.equipment.map((equipment, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span>{equipment}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Réservations Actuelles</h3>
                  {getRoomReservations(selectedRoom.id).length > 0 ? (
                    <div className="space-y-2">
                      {getRoomReservations(selectedRoom.id).map((reservation) => (
                        <div key={reservation.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{reservation.userName}</p>
                              <p className="text-sm text-gray-600">{reservation.scenario}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleString()}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {reservation.status}
                            </span>
                            {userRole === 'admin' && (
                              <button
                                onClick={() => handleCancelReservation(reservation.id)}
                                className="ml-2 text-red-600 hover:text-red-800 text-sm"
                              >
                                Annuler
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune réservation actuelle</p>
                  )}
                </div>
                
                {selectedRoom.status === 'available' && (
                  <div className="border-t pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleReserveRoom(selectedRoom);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Réserver Cette Salle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showAddModal ? 'Ajouter une Nouvelle Salle' : 'Modifier la Salle'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la Salle *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Entrer le nom de la salle"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de Salle
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="surgery">Chirurgie</option>
                      <option value="emergency">Urgence</option>
                      <option value="meeting">Réunion</option>
                      <option value="imaging">Imagerie</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="available">Disponible</option>
                      <option value="occupied">Occupée</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="reserved">Réservée</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacité
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Étage
                    </label>
                    <input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Équipements
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.equipmentInput}
                      onChange={(e) => setFormData({...formData, equipmentInput: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Ajouter un équipement"
                      onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                    />
                    <button
                      onClick={addEquipment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipment.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {item}
                        <button
                          onClick={() => removeEquipment(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmitRoom}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showAddModal ? 'Ajouter la Salle' : 'Mettre à Jour'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reserve Room Modal */}
      {showReserveModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Réserver {selectedRoom.name}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={reserveForm.date}
                      onChange={(e) => {
                        setReserveForm({...reserveForm, date: e.target.value});
                        if (selectedRoom) {
                          fetchRoomSchedule(selectedRoom.id, e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure *
                    </label>
                    <input
                      type="time"
                      value={reserveForm.time}
                      onChange={(e) => setReserveForm({...reserveForm, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
                
                {/* Room Schedule Display */}
                {roomSchedule.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planning du {reserveForm.date}
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                      {roomSchedule.map((item) => (
                        <div key={item.id} className="text-sm mb-2 last:mb-0">
                          <span className="font-medium">{item.userName}</span>
                          <span className="text-gray-600 ml-2">
                            {new Date(item.startTime).toLocaleTimeString()} - {new Date(item.endTime).toLocaleTimeString()}
                          </span>
                          <span className="text-gray-500 ml-2">({item.scenario})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (minutes)
                  </label>
                  <select 
                    value={reserveForm.duration}
                    onChange={(e) => setReserveForm({...reserveForm, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 heure</option>
                    <option value="90">1.5 heures</option>
                    <option value="120">2 heures</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scénario
                  </label>
                  <select 
                    value={reserveForm.scenario}
                    onChange={(e) => setReserveForm({...reserveForm, scenario: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="consultation">Consultation Régulière</option>
                    <option value="surgery">Chirurgie Mineure</option>
                    <option value="emergency">Traitement d'Urgence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={reserveForm.notes}
                    onChange={(e) => setReserveForm({...reserveForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    rows={3}
                    placeholder="Notes supplémentaires..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleSubmitReservation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirmer la Réservation
                </button>
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}