const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { reservations, rooms, updateReservations } = require('../data/mockData');

const router = express.Router();

// Validation middleware
const validateReservation = [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('userId').notEmpty().withMessage('User ID is required'),
  body('userName').notEmpty().withMessage('User name is required'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO date'),
  body('endTime').isISO8601().withMessage('End time must be a valid ISO date'),
  body('scenario').notEmpty().withMessage('Scenario is required'),
  body('status').isIn(['confirmed', 'pending', 'cancelled', 'completed']).withMessage('Invalid status'),
];

// Helper function to check for time conflicts
const checkTimeConflict = (roomId, startTime, endTime, excludeId = null) => {
  return reservations.some(reservation => {
    if (reservation.roomId !== roomId || (excludeId && reservation.id === excludeId)) {
      return false;
    }
    
    const existingStart = new Date(reservation.startTime);
    const existingEnd = new Date(reservation.endTime);
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);
    
    // Check for overlap - if either start time is before the other's end time
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Helper function to get conflicting reservations
const getConflictingReservations = (roomId, startTime, endTime, excludeId = null) => {
  return reservations.filter(reservation => {
    if (reservation.roomId !== roomId || (excludeId && reservation.id === excludeId)) {
      return false;
    }
    
    const existingStart = new Date(reservation.startTime);
    const existingEnd = new Date(reservation.endTime);
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);
    
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// GET /api/reservations - Get all reservations
router.get('/', (req, res) => {
  try {
    const { roomId, userId, status, date } = req.query;
    
    let filteredReservations = [...reservations];
    
    // Apply filters
    if (roomId) {
      filteredReservations = filteredReservations.filter(res => res.roomId === roomId);
    }
    
    if (userId) {
      filteredReservations = filteredReservations.filter(res => res.userId === userId);
    }
    
    if (status && status !== 'all') {
      filteredReservations = filteredReservations.filter(res => res.status === status);
    }
    
    if (date) {
      const targetDate = new Date(date);
      filteredReservations = filteredReservations.filter(res => {
        const reservationDate = new Date(res.startTime);
        return reservationDate.toDateString() === targetDate.toDateString();
      });
    }
    
    // Add room information to each reservation
    const reservationsWithRoomInfo = filteredReservations.map(reservation => {
      const room = rooms.find(r => r.id === reservation.roomId);
      return {
        ...reservation,
        room: room ? { id: room.id, name: room.name, type: room.type } : null
      };
    });
    
    res.json({
      success: true,
      data: reservationsWithRoomInfo,
      total: reservationsWithRoomInfo.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des réservations',
      message: error.message
    });
  }
});

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', (req, res) => {
  try {
    const reservation = reservations.find(r => r.id === req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée'
      });
    }
    
    // Add room information
    const room = rooms.find(r => r.id === reservation.roomId);
    const reservationWithRoom = {
      ...reservation,
      room: room ? { id: room.id, name: room.name, type: room.type } : null
    };
    
    res.json({
      success: true,
      data: reservationWithRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de la réservation',
      message: error.message
    });
  }
});

// POST /api/reservations - Create new reservation
router.post('/', validateReservation, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const { roomId, startTime, endTime } = req.body;
    
    // Check if room exists
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    // Check if room is available
    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: 'Room is not available for reservation'
      });
    }
    
    // Check for time conflicts
    if (checkTimeConflict(roomId, startTime, endTime)) {
      const conflicts = getConflictingReservations(roomId, startTime, endTime);
      return res.status(409).json({
        success: false,
        error: 'Time conflict: Room is already reserved for this time period',
        conflicts: conflicts.map(conflict => ({
          id: conflict.id,
          userName: conflict.userName,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          scenario: conflict.scenario
        })),
        requestedTime: {
          startTime,
          endTime
        }
      });
    }
    
    const newReservation = {
      id: uuidv4(),
      ...req.body
    };
    
    reservations.push(newReservation);
    updateReservations(reservations);
    
    // Update room status to reserved
    room.status = 'reserved';
    
    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: newReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la création de la réservation',
      message: error.message
    });
  }
});

// PUT /api/reservations/:id - Update reservation
router.put('/:id', validateReservation, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const reservationIndex = reservations.findIndex(r => r.id === req.params.id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée'
      });
    }
    
    const { roomId, startTime, endTime } = req.body;
    
    // Check for time conflicts (excluding current reservation)
    if (checkTimeConflict(roomId, startTime, endTime, req.params.id)) {
      return res.status(409).json({
        success: false,
        error: 'Time conflict: Room is already reserved for this time period'
      });
    }
    
    const updatedReservation = {
      ...reservations[reservationIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    reservations[reservationIndex] = updatedReservation;
    updateReservations(reservations);
    
    res.json({
      success: true,
      message: 'Réservation mise à jour avec succès',
      data: updatedReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour de la réservation',
      message: error.message
    });
  }
});

// DELETE /api/reservations/:id - Delete reservation
router.delete('/:id', (req, res) => {
  try {
    const reservationIndex = reservations.findIndex(r => r.id === req.params.id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée'
      });
    }
    
    const deletedReservation = reservations.splice(reservationIndex, 1)[0];
    updateReservations(reservations);
    
    // Update room status back to available if no other reservations
    const room = rooms.find(r => r.id === deletedReservation.roomId);
    if (room) {
      const hasOtherReservations = reservations.some(r => r.roomId === room.id);
      if (!hasOtherReservations) {
        room.status = 'available';
      }
    }
    
    res.json({
      success: true,
      message: 'Réservation supprimée avec succès',
      data: deletedReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la suppression de la réservation',
      message: error.message
    });
  }
});

// PATCH /api/reservations/:id/status - Update reservation status
router.patch('/:id/status', [
  body('status').isIn(['confirmed', 'pending', 'cancelled', 'completed']).withMessage('Invalid status')
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
    
    const reservation = reservations.find(r => r.id === req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Réservation non trouvée'
      });
    }
    
    reservation.status = req.body.status;
    updateReservations(reservations);
    
    res.json({
      success: true,
      message: 'Statut de la réservation mis à jour avec succès',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour du statut de la réservation',
      message: error.message
    });
  }
});

// GET /api/reservations/room/:roomId/availability - Check room availability
router.get('/room/:roomId/availability', (req, res) => {
  try {
    const { roomId } = req.params;
    const { date, startTime, endTime } = req.query;
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    let availability = {
      roomId,
      roomName: room.name,
      isAvailable: room.status === 'available',
      conflicts: []
    };
    
    if (date && startTime && endTime) {
      const requestedStart = new Date(`${date}T${startTime}`);
      const requestedEnd = new Date(`${date}T${endTime}`);
      
      const conflicts = reservations.filter(reservation => {
        if (reservation.roomId !== roomId) return false;
        
        const existingStart = new Date(reservation.startTime);
        const existingEnd = new Date(reservation.endTime);
        
        return (requestedStart < existingEnd && requestedEnd > existingStart);
      });
      
      availability.conflicts = conflicts.map(conflict => ({
        id: conflict.id,
        userName: conflict.userName,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        scenario: conflict.scenario,
        status: conflict.status
      }));
      availability.isAvailable = conflicts.length === 0;
      availability.requestedTime = {
        startTime: requestedStart.toISOString(),
        endTime: requestedEnd.toISOString()
      };
    }
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la vérification de la disponibilité de la salle',
      message: error.message
    });
  }
});

// GET /api/reservations/room/:roomId/schedule - Get room schedule for a specific date
router.get('/room/:roomId/schedule', (req, res) => {
  try {
    const { roomId } = req.params;
    const { date } = req.query;
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    let schedule = [];
    
    if (date) {
      const targetDate = new Date(date);
      schedule = reservations.filter(reservation => {
        if (reservation.roomId !== roomId) return false;
        
        const reservationDate = new Date(reservation.startTime);
        return reservationDate.toDateString() === targetDate.toDateString();
      }).map(reservation => ({
        id: reservation.id,
        userName: reservation.userName,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        scenario: reservation.scenario,
        status: reservation.status
      }));
    }
    
    res.json({
      success: true,
      data: {
        roomId,
        roomName: room.name,
        date: date,
        schedule: schedule.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération du planning de la salle',
      message: error.message
    });
  }
});

module.exports = router; 