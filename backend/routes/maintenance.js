const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { maintenanceTasks, rooms, updateMaintenanceTasks } = require('../data/mockData');

const router = express.Router();

// Validation middleware
const validateMaintenanceTask = [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['preventive', 'corrective', 'emergency']).withMessage('Invalid type'),
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'overdue']).withMessage('Invalid status'),
  body('scheduledDate').isISO8601().withMessage('Scheduled date must be a valid ISO date'),
  body('assignedTo').notEmpty().withMessage('Assigned to is required'),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
];

// GET /api/maintenance - Get all maintenance tasks
router.get('/', (req, res) => {
  try {
    const { roomId, status, priority, assignedTo } = req.query;
    
    let filteredTasks = [...maintenanceTasks];
    
    // Apply filters
    if (roomId) {
      filteredTasks = filteredTasks.filter(task => task.roomId === roomId);
    }
    
    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (priority && priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    if (assignedTo) {
      filteredTasks = filteredTasks.filter(task => 
        task.assignedTo.toLowerCase().includes(assignedTo.toLowerCase())
      );
    }
    
    // Add room information to each task
    const tasksWithRoomInfo = filteredTasks.map(task => {
      const room = rooms.find(r => r.id === task.roomId);
      return {
        ...task,
        room: room ? { id: room.id, name: room.name, type: room.type } : null
      };
    });
    
    res.json({
      success: true,
      data: tasksWithRoomInfo,
      total: tasksWithRoomInfo.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des tâches de maintenance',
      message: error.message
    });
  }
});

// GET /api/maintenance/:id - Get maintenance task by ID
router.get('/:id', (req, res) => {
  try {
    const task = maintenanceTasks.find(t => t.id === req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tâche de maintenance non trouvée'
      });
    }
    
    // Add room information
    const room = rooms.find(r => r.id === task.roomId);
    const taskWithRoom = {
      ...task,
      room: room ? { id: room.id, name: room.name, type: room.type } : null
    };
    
    res.json({
      success: true,
      data: taskWithRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de la tâche de maintenance',
      message: error.message
    });
  }
});

// POST /api/maintenance - Create new maintenance task
router.post('/', validateMaintenanceTask, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const { roomId } = req.body;
    
    // Check if room exists
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    const newTask = {
      id: uuidv4(),
      ...req.body
    };
    
    maintenanceTasks.push(newTask);
    updateMaintenanceTasks(maintenanceTasks);
    
    // Update room status to maintenance if task is in-progress
    if (newTask.status === 'in-progress') {
      room.status = 'maintenance';
    }
    
    const taskWithRoom = {
      ...newTask,
      room: { id: room.id, name: room.name, type: room.type }
    };
    
    res.status(201).json({
      success: true,
      message: 'Tâche de maintenance créée avec succès',
      data: taskWithRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la création de la tâche de maintenance',
      message: error.message
    });
  }
});

// PUT /api/maintenance/:id - Update maintenance task
router.put('/:id', validateMaintenanceTask, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const taskIndex = maintenanceTasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Tâche de maintenance non trouvée'
      });
    }
    
    const updatedTask = {
      ...maintenanceTasks[taskIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    maintenanceTasks[taskIndex] = updatedTask;
    updateMaintenanceTasks(maintenanceTasks);
    
    // Update room status based on task status
    const room = rooms.find(r => r.id === updatedTask.roomId);
    if (room) {
      if (updatedTask.status === 'completed') {
        room.status = 'available';
      } else if (updatedTask.status === 'in-progress') {
        room.status = 'maintenance';
      }
    }
    
    const taskWithRoom = {
      ...updatedTask,
      room: room ? { id: room.id, name: room.name, type: room.type } : null
    };
    
    res.json({
      success: true,
      message: 'Tâche de maintenance mise à jour avec succès',
      data: taskWithRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour de la tâche de maintenance',
      message: error.message
    });
  }
});

// DELETE /api/maintenance/:id - Delete maintenance task
router.delete('/:id', (req, res) => {
  try {
    const taskIndex = maintenanceTasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Tâche de maintenance non trouvée'
      });
    }
    
    const deletedTask = maintenanceTasks.splice(taskIndex, 1)[0];
    updateMaintenanceTasks(maintenanceTasks);
    
    res.json({
      success: true,
      message: 'Tâche de maintenance supprimée avec succès',
      data: deletedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la suppression de la tâche de maintenance',
      message: error.message
    });
  }
});

// PATCH /api/maintenance/:id/status - Update task status
router.patch('/:id/status', [
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'overdue']).withMessage('Invalid status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const task = maintenanceTasks.find(t => t.id === req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tâche de maintenance non trouvée'
      });
    }
    
    const oldStatus = task.status;
    task.status = req.body.status;
    
    // Update completed date if task is completed
    if (task.status === 'completed' && oldStatus !== 'completed') {
      task.completedDate = new Date().toISOString().split('T')[0];
    }
    
    updateMaintenanceTasks(maintenanceTasks);
    
    // Update room status based on task status
    const room = rooms.find(r => r.id === task.roomId);
    if (room) {
      if (task.status === 'completed') {
        room.status = 'available';
      } else if (task.status === 'in-progress') {
        room.status = 'maintenance';
      }
    }
    
    res.json({
      success: true,
      message: 'Statut de la tâche de maintenance mis à jour avec succès',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour du statut de la tâche de maintenance',
      message: error.message
    });
  }
});

// GET /api/maintenance/overdue - Get overdue tasks
router.get('/overdue/tasks', (req, res) => {
  try {
    const today = new Date();
    const overdueTasks = maintenanceTasks.filter(task => {
      const scheduledDate = new Date(task.scheduledDate);
      return scheduledDate < today && task.status !== 'completed';
    }).map(task => {
      const room = rooms.find(r => r.id === task.roomId);
      return {
        ...task,
        room: room ? { id: room.id, name: room.name, type: room.type } : null
      };
    });
    
    res.json({
      success: true,
      data: overdueTasks,
      total: overdueTasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des tâches en retard',
      message: error.message
    });
  }
});

module.exports = router; 