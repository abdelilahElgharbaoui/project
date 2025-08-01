import { Room, Reservation, StockItem, MaintenanceTask, Scenario, User } from '@/types';

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Consultation Room A',
    type: 'consultation',
    capacity: 4,
    equipment: ['Examination Table', 'Blood Pressure Monitor', 'Stethoscope'],
    status: 'available',
    floor: 1,
    lastMaintenance: new Date('2024-01-15'),
    nextMaintenance: new Date('2024-04-15'),
  },
  {
    id: '2',
    name: 'Surgery Theater 1',
    type: 'surgery',
    capacity: 8,
    equipment: ['Operating Table', 'Anesthesia Machine', 'Surgical Lights', 'Monitors'],
    status: 'occupied',
    floor: 2,
    lastMaintenance: new Date('2024-01-20'),
    nextMaintenance: new Date('2024-04-20'),
  },
  {
    id: '3',
    name: 'Emergency Room',
    type: 'emergency',
    capacity: 6,
    equipment: ['Trauma Bed', 'Defibrillator', 'Ventilator', 'Crash Cart'],
    status: 'available',
    floor: 1,
    lastMaintenance: new Date('2024-01-25'),
    nextMaintenance: new Date('2024-04-25'),
  },
  {
    id: '4',
    name: 'MRI Suite',
    type: 'imaging',
    capacity: 3,
    equipment: ['MRI Machine', 'Patient Monitor', 'Contrast Injector'],
    status: 'maintenance',
    floor: 3,
    lastMaintenance: new Date('2024-02-01'),
    nextMaintenance: new Date('2024-05-01'),
  },
];

export const mockReservations: Reservation[] = [
  {
    id: '1',
    roomId: '1',
    userId: 'user1',
    userName: 'Dr. Smith',
    startTime: new Date('2024-01-30T09:00:00'),
    endTime: new Date('2024-01-30T10:00:00'),
    scenario: 'Regular Check-up',
    status: 'confirmed',
    notes: 'Annual physical examination',
  },
  {
    id: '2',
    roomId: '2',
    userId: 'user2',
    userName: 'Dr. Johnson',
    startTime: new Date('2024-01-30T14:00:00'),
    endTime: new Date('2024-01-30T16:00:00'),
    scenario: 'Minor Surgery',
    status: 'confirmed',
    notes: 'Appendectomy procedure',
  },
];

export const mockStockItems: StockItem[] = [
  {
    id: '1',
    name: 'Surgical Gloves',
    category: 'supplies',
    currentStock: 250,
    minStock: 100,
    maxStock: 500,
    unit: 'pairs',
    lastRestocked: new Date('2024-01-20'),
    roomIds: ['1', '2', '3'],
  },
  {
    id: '2',
    name: 'Syringes',
    category: 'medical',
    currentStock: 45,
    minStock: 50,
    maxStock: 200,
    unit: 'pieces',
    lastRestocked: new Date('2024-01-15'),
    roomIds: ['1', '3'],
  },
  {
    id: '3',
    name: 'Blood Pressure Cuffs',
    category: 'equipment',
    currentStock: 8,
    minStock: 5,
    maxStock: 15,
    unit: 'pieces',
    lastRestocked: new Date('2024-01-10'),
    roomIds: ['1', '3'],
  },
];

export const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: '1',
    roomId: '4',
    title: 'MRI Machine Calibration',
    description: 'Monthly calibration and safety check',
    type: 'preventive',
    status: 'in-progress',
    scheduledDate: new Date('2024-01-30'),
    assignedTo: 'Tech Team A',
    priority: 'high',
  },
  {
    id: '2',
    roomId: '1',
    title: 'Air Conditioning Service',
    description: 'Filter replacement and system cleaning',
    type: 'preventive',
    status: 'scheduled',
    scheduledDate: new Date('2024-02-05'),
    assignedTo: 'Maintenance Team',
    priority: 'medium',
  },
];

export const mockScenarios: Scenario[] = [
  {
    id: '1',
    name: 'Regular Check-up',
    description: 'Standard patient consultation and examination',
    requiredEquipment: ['Examination Table', 'Blood Pressure Monitor', 'Stethoscope'],
    estimatedDuration: 30,
    roomTypes: ['consultation'],
  },
  {
    id: '2',
    name: 'Minor Surgery',
    description: 'Outpatient surgical procedures',
    requiredEquipment: ['Operating Table', 'Surgical Lights', 'Anesthesia Machine'],
    estimatedDuration: 120,
    roomTypes: ['surgery'],
  },
  {
    id: '3',
    name: 'Emergency Treatment',
    description: 'Urgent medical care and trauma response',
    requiredEquipment: ['Trauma Bed', 'Defibrillator', 'Crash Cart'],
    estimatedDuration: 60,
    roomTypes: ['emergency'],
  },
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Dr. Smith',
    email: 'smith@hospital.com',
    role: 'user',
    department: 'Internal Medicine',
  },
  {
    id: 'admin1',
    name: 'Admin Johnson',
    email: 'admin@hospital.com',
    role: 'admin',
    department: 'Administration',
  },
];