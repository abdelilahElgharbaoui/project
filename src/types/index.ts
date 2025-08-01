export interface Room {
  id: string;
  name: string;
  type: 'consultation' | 'surgery' | 'emergency' | 'meeting' | 'imaging';
  capacity: number;
  equipment: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  floor: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface Reservation {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  scenario: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'medical' | 'equipment' | 'supplies' | 'medication';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked: Date;
  expiryDate?: Date;
  roomIds: string[];
}

export interface MaintenanceTask {
  id: string;
  roomId: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  scheduledDate: Date;
  completedDate?: Date;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  requiredEquipment: string[];
  estimatedDuration: number;
  roomTypes: Room['type'][];
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  totalReservations: number;
  maintenanceTasks: number;
  lowStockItems: number;
}