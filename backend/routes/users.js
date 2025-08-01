const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { users, updateUsers } = require('../data/mockData');

const router = express.Router();

// Validation middleware
const validateUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'user']).withMessage('Invalid role'),
  body('department').trim().notEmpty().withMessage('Department is required'),
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  try {
    const { search, role, department } = req.query;
    
    let filteredUsers = [...users];
    
    // Apply filters
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (department && department !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        user.department.toLowerCase().includes(department.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des utilisateurs',
      message: error.message
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de l\'utilisateur',
      message: error.message
    });
  }
});

// POST /api/users - Create new user
router.post('/', validateUser, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === req.body.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    const newUser = {
      id: uuidv4(),
      ...req.body
    };
    
    users.push(newUser);
    updateUsers(users);
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la création de l\'utilisateur',
      message: error.message
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', validateUser, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    // Check if email already exists (excluding current user)
    const existingUser = users.find(u => u.email === req.body.email && u.id !== req.params.id);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    users[userIndex] = updatedUser;
    updateUsers(users);
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour de l\'utilisateur',
      message: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    updateUsers(users);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      data: deletedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la suppression de l\'utilisateur',
      message: error.message
    });
  }
});

module.exports = router; 