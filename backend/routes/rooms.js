const express = require('express');
const { body, validationResult } = require('express-validator');
const { rooms, updateRooms } = require('../data/mockData');

const router = express.Router();

// Middleware de validation
const validateRoom = [
  body('name').trim().notEmpty().withMessage('Le nom de la salle est requis'),
  body('type').isIn(['consultation', 'surgery', 'emergency', 'meeting', 'imaging', 'recovery', 'intensive care']).withMessage('Type de salle invalide'),
  body('capacity').isInt({ min: 1 }).withMessage('La capacité doit être un entier positif'),
  body('floor').isFloat({ min: 0 }).withMessage('L\'étage doit être un nombre positif'),
  body('status').isIn(['available', 'occupied', 'maintenance', 'reserved']).withMessage('Statut invalide'),
  body('equipment').isArray().withMessage('L\'équipement doit être un tableau'),
];

// GET /api/rooms - Obtenir toutes les salles
router.get('/', (req, res) => {
  try {
    const { search, type, status, floor } = req.query;
    
    let filteredRooms = [...rooms];
    
    // Appliquer les filtres
    if (search) {
      filteredRooms = filteredRooms.filter(room => 
        room.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (type && type !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.type === type);
    }
    
    if (status && status !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.status === status);
    }
    
    if (floor) {
      filteredRooms = filteredRooms.filter(room => room.floor === parseInt(floor));
    }
    
    res.json({
      success: true,
      data: filteredRooms,
      total: filteredRooms.length
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des salles',
      message: error.message
    });
  }
});

// GET /api/rooms/:id - Obtenir une salle par ID
router.get('/:id', (req, res) => {
  try {
    const room = rooms.find(r => r.id === req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de la salle',
      message: error.message
    });
  }
});

// POST /api/rooms - Créer une nouvelle salle
router.post('/', validateRoom, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const newRoom = {
      id: Date.now().toString(), // Simple ID generation
      ...req.body
    };
    
    rooms.push(newRoom);
    updateRooms(rooms);
    
    res.status(201).json({
      success: true,
      message: 'Salle créée avec succès',
      data: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la création de la salle',
      message: error.message
    });
  }
});

// PUT /api/rooms/:id - Mettre à jour une salle
router.put('/:id', validateRoom, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    const updatedRoom = {
      ...rooms[roomIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    rooms[roomIndex] = updatedRoom;
    updateRooms(rooms);
    
    res.json({
      success: true,
      message: 'Salle mise à jour avec succès',
      data: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour de la salle',
      message: error.message
    });
  }
});

// DELETE /api/rooms/:id - Supprimer une salle
router.delete('/:id', (req, res) => {
  try {
    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    const deletedRoom = rooms.splice(roomIndex, 1)[0];
    updateRooms(rooms);
    
    res.json({
      success: true,
      message: 'Salle supprimée avec succès',
      data: deletedRoom
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la suppression de la salle',
      message: error.message
    });
  }
});

// PATCH /api/rooms/:id/status - Mettre à jour le statut d'une salle
router.patch('/:id/status', [
  body('status').isIn(['available', 'occupied', 'maintenance', 'reserved']).withMessage('Statut invalide')
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
    
    const room = rooms.find(r => r.id === req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Salle non trouvée'
      });
    }
    
    room.status = req.body.status;
    updateRooms(rooms);
    
    res.json({
      success: true,
      message: 'Statut de la salle mis à jour avec succès',
      data: room
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour du statut de la salle',
      message: error.message
    });
  }
});

module.exports = router; 