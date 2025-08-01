const express = require('express');
const { rooms, reservations, stockItems, maintenanceTasks } = require('../data/mockData');

const router = express.Router();

// GET /api/dashboard/stats - Obtenir les statistiques du tableau de bord
router.get('/stats', (req, res) => {
  try {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.status === 'disponible').length;
    const occupiedRooms = rooms.filter(room => room.status === 'occupée').length;
    const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;
    const reservedRooms = rooms.filter(room => room.status === 'réservée').length;
    
    const totalReservations = reservations.length;
    const todayReservations = reservations.filter(res => {
      const today = new Date().toDateString();
      const resDate = new Date(res.startTime).toDateString();
      return resDate === today;
    }).length;
    
    const pendingMaintenance = maintenanceTasks.filter(task => 
      task.status === 'programmée' || task.status === 'en-cours'
    ).length;
    
    const overdueMaintenance = maintenanceTasks.filter(task => {
      const today = new Date();
      const scheduledDate = new Date(task.scheduledDate);
      return scheduledDate < today && task.status !== 'terminée';
    }).length;
    
    // Statistiques de stock
    const lowStockItems = stockItems.filter(item => {
      const percentage = (item.currentStock / item.maxStock) * 100;
      return item.currentStock <= item.minStock || percentage <= 25;
    }).length;
    
    const criticalStockItems = stockItems.filter(item => 
      item.currentStock <= item.minStock
    ).length;
    
    // Distribution des types de salles
    const roomTypeStats = rooms.reduce((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {});
    
    // Distribution par étage
    const floorStats = rooms.reduce((acc, room) => {
      acc[`Étage ${room.floor}`] = (acc[`Étage ${room.floor}`] || 0) + 1;
      return acc;
    }, {});
    
    // Réservations récentes (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReservations = reservations.filter(res => 
      new Date(res.startTime) >= sevenDaysAgo
    ).length;
    
    // Maintenance à venir (7 prochains jours)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingMaintenance = maintenanceTasks.filter(task => {
      const scheduledDate = new Date(task.scheduledDate);
      return scheduledDate <= nextWeek && task.status === 'programmée';
    }).length;
    
    res.json({
      success: true,
      data: {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          maintenance: maintenanceRooms,
          reserved: reservedRooms,
          typeDistribution: roomTypeStats,
          floorDistribution: floorStats
        },
        reservations: {
          total: totalReservations,
          today: todayReservations,
          recent: recentReservations
        },
        maintenance: {
          pending: pendingMaintenance,
          overdue: overdueMaintenance,
          upcoming: upcomingMaintenance
        },
        stock: {
          lowStock: lowStockItems,
          critical: criticalStockItems,
          totalItems: stockItems.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des statistiques du tableau de bord',
      message: error.message
    });
  }
});

// GET /api/dashboard/rooms/status - Obtenir l'aperçu du statut des salles
router.get('/rooms/status', (req, res) => {
  try {
    const statusCounts = rooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {});
    
    const typeStatus = rooms.reduce((acc, room) => {
      if (!acc[room.type]) {
        acc[room.type] = {};
      }
      acc[room.type][room.status] = (acc[room.type][room.status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        statusCounts,
        typeStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de l\'aperçu du statut des salles',
      message: error.message
    });
  }
});

// GET /api/dashboard/reservations/timeline - Obtenir la chronologie des réservations
router.get('/reservations/timeline', (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const timelineData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayReservations = reservations.filter(res => {
        const resDate = new Date(res.startTime).toISOString().split('T')[0];
        return resDate === dateStr;
      });
      
      timelineData.push({
        date: dateStr,
        count: dayReservations.length,
        reservations: dayReservations.map(res => ({
          id: res.id,
          roomId: res.roomId,
          userName: res.userName,
          startTime: res.startTime,
          endTime: res.endTime,
          status: res.status
        }))
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({
      success: true,
      data: timelineData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de la chronologie des réservations',
      message: error.message
    });
  }
});

// GET /api/dashboard/maintenance/overview - Obtenir l'aperçu de la maintenance
router.get('/maintenance/overview', (req, res) => {
  try {
    const statusCounts = maintenanceTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    const priorityCounts = maintenanceTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    const typeCounts = maintenanceTasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {});
    
    // Tâches par salle
    const tasksByRoom = maintenanceTasks.reduce((acc, task) => {
      const room = rooms.find(r => r.id === task.roomId);
      const roomName = room ? room.name : 'Salle Inconnue';
      
      if (!acc[roomName]) {
        acc[roomName] = [];
      }
      acc[roomName].push(task);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        statusCounts,
        priorityCounts,
        typeCounts,
        tasksByRoom
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de l\'aperçu de la maintenance',
      message: error.message
    });
  }
});

// GET /api/dashboard/stock/overview - Obtenir l'aperçu du stock
router.get('/stock/overview', (req, res) => {
  try {
    const categoryCounts = stockItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    const stockStatus = stockItems.map(item => {
      const percentage = (item.currentStock / item.maxStock) * 100;
      let status = 'bon';
      if (item.currentStock <= item.minStock) {
        status = 'critique';
      } else if (percentage <= 25) {
        status = 'faible';
      } else if (percentage <= 50) {
        status = 'moyen';
      }
      
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        currentStock: item.currentStock,
        maxStock: item.maxStock,
        percentage: Math.round(percentage),
        status
      };
    });
    
    const statusCounts = stockStatus.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        categoryCounts,
        statusCounts,
        stockStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de l\'aperçu du stock',
      message: error.message
    });
  }
});

module.exports = router; 