// API service layer for connecting to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  error?: string;
  details?: any[];
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'API request failed',
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error: Unable to connect to the server',
        0,
        []
      );
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500,
      []
    );
  }
}

// Room Management API
export const roomApi = {
  // Get all rooms with optional filters
  getRooms: (params?: {
    search?: string;
    type?: string;
    status?: string;
    floor?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.floor) searchParams.append('floor', params.floor.toString());
    
    const query = searchParams.toString();
    return apiRequest(`/rooms${query ? `?${query}` : ''}`);
  },

  // Get room by ID
  getRoom: (id: string) => apiRequest(`/rooms/${id}`),

  // Create new room
  createRoom: (roomData: any) => 
    apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    }),

  // Update room
  updateRoom: (id: string, roomData: any) =>
    apiRequest(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    }),

  // Delete room
  deleteRoom: (id: string) =>
    apiRequest(`/rooms/${id}`, {
      method: 'DELETE',
    }),

  // Update room status
  updateRoomStatus: (id: string, status: string) =>
    apiRequest(`/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Reservation Management API
export const reservationApi = {
  // Get all reservations with optional filters
  getReservations: (params?: {
    roomId?: string;
    userId?: string;
    status?: string;
    date?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.roomId) searchParams.append('roomId', params.roomId);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.date) searchParams.append('date', params.date);
    
    const query = searchParams.toString();
    return apiRequest(`/reservations${query ? `?${query}` : ''}`);
  },

  // Get reservation by ID
  getReservation: (id: string) => apiRequest(`/reservations/${id}`),

  // Create new reservation
  createReservation: (reservationData: any) =>
    apiRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    }),

  // Update reservation
  updateReservation: (id: string, reservationData: any) =>
    apiRequest(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reservationData),
    }),

  // Delete reservation
  deleteReservation: (id: string) =>
    apiRequest(`/reservations/${id}`, {
      method: 'DELETE',
    }),

  // Update reservation status
  updateReservationStatus: (id: string, status: string) =>
    apiRequest(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Check room availability
  checkRoomAvailability: (roomId: string, date: string, startTime: string, endTime: string) => {
    const params = new URLSearchParams({
      date,
      startTime,
      endTime,
    });
    return apiRequest(`/reservations/room/${roomId}/availability?${params}`);
  },
};

// Stock Management API
export const stockApi = {
  // Get all stock items with optional filters
  getStockItems: (params?: {
    search?: string;
    category?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return apiRequest(`/stock${query ? `?${query}` : ''}`);
  },

  // Get stock item by ID
  getStockItem: (id: string) => apiRequest(`/stock/${id}`),

  // Create new stock item
  createStockItem: (stockData: any) =>
    apiRequest('/stock', {
      method: 'POST',
      body: JSON.stringify(stockData),
    }),

  // Update stock item
  updateStockItem: (id: string, stockData: any) =>
    apiRequest(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData),
    }),

  // Delete stock item
  deleteStockItem: (id: string) =>
    apiRequest(`/stock/${id}`, {
      method: 'DELETE',
    }),

  // Restock item
  restockItem: (id: string, quantity: number) =>
    apiRequest(`/stock/${id}/restock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  // Use stock item
  useStockItem: (id: string, quantity: number) =>
    apiRequest(`/stock/${id}/use`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  // Get low stock alerts
  getLowStockAlerts: () => apiRequest('/stock/alerts/low-stock'),

  // Get stock analytics
  getStockAnalytics: () => apiRequest('/stock/analytics/summary'),
};

// Maintenance Management API
export const maintenanceApi = {
  // Get all maintenance tasks with optional filters
  getMaintenanceTasks: (params?: {
    roomId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.roomId) searchParams.append('roomId', params.roomId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.assignedTo) searchParams.append('assignedTo', params.assignedTo);
    
    const query = searchParams.toString();
    return apiRequest(`/maintenance${query ? `?${query}` : ''}`);
  },

  // Get maintenance task by ID
  getMaintenanceTask: (id: string) => apiRequest(`/maintenance/${id}`),

  // Create new maintenance task
  createMaintenanceTask: (taskData: any) =>
    apiRequest('/maintenance', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  // Update maintenance task
  updateMaintenanceTask: (id: string, taskData: any) =>
    apiRequest(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),

  // Delete maintenance task
  deleteMaintenanceTask: (id: string) =>
    apiRequest(`/maintenance/${id}`, {
      method: 'DELETE',
    }),

  // Update task status
  updateTaskStatus: (id: string, status: string) =>
    apiRequest(`/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Get overdue tasks
  getOverdueTasks: () => apiRequest('/maintenance/overdue/tasks'),
};

// Scenario Management API
export const scenarioApi = {
  // Get all scenarios with optional filters
  getScenarios: (params?: {
    search?: string;
    roomType?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.roomType) searchParams.append('roomType', params.roomType);
    
    const query = searchParams.toString();
    return apiRequest(`/scenarios${query ? `?${query}` : ''}`);
  },

  // Get scenario by ID
  getScenario: (id: string) => apiRequest(`/scenarios/${id}`),

  // Create new scenario
  createScenario: (scenarioData: any) =>
    apiRequest('/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenarioData),
    }),

  // Update scenario
  updateScenario: (id: string, scenarioData: any) =>
    apiRequest(`/scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scenarioData),
    }),

  // Delete scenario
  deleteScenario: (id: string) =>
    apiRequest(`/scenarios/${id}`, {
      method: 'DELETE',
    }),
};

// User Management API
export const userApi = {
  // Get all users with optional filters
  getUsers: (params?: {
    search?: string;
    role?: string;
    department?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.department) searchParams.append('department', params.department);
    
    const query = searchParams.toString();
    return apiRequest(`/users${query ? `?${query}` : ''}`);
  },

  // Get user by ID
  getUser: (id: string) => apiRequest(`/users/${id}`),

  // Create new user
  createUser: (userData: any) =>
    apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Update user
  updateUser: (id: string, userData: any) =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Delete user
  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardApi = {
  // Get comprehensive statistics
  getStats: () => apiRequest('/dashboard/stats'),

  // Get room status overview
  getRoomStatus: () => apiRequest('/dashboard/rooms/status'),

  // Get reservation timeline
  getReservationTimeline: (days: number = 7) =>
    apiRequest(`/dashboard/reservations/timeline?days=${days}`),

  // Get maintenance overview
  getMaintenanceOverview: () => apiRequest('/dashboard/maintenance/overview'),

  // Get stock overview
  getStockOverview: () => apiRequest('/dashboard/stock/overview'),
};

// Health check API
export const healthApi = {
  checkHealth: () => fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.json()),
};

export { ApiError }; 