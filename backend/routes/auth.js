const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { generateToken, hashPassword, comparePassword, authenticateToken } = require('../config/auth');

const router = express.Router();

// Validation middleware
const validateLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

const validateRegister = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom de famille est requis'),
  body('role').isIn(['admin', 'user']).withMessage('Rôle invalide')
];

// Login route
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const userResult = await pool.query(
      'SELECT id, email, password, first_name, last_name, role, department FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentification échouée',
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentification échouée',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Connexion réussie',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur s\'est produite lors de la connexion'
    });
  }
});

// Register route (admin only)
router.post('/register', authenticateToken, validateRegister, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Seuls les administrateurs peuvent créer de nouveaux utilisateurs'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, department, phone } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Utilisateur existant',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUserResult = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, department, phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, first_name, last_name, role, department, phone, created_at`,
      [email, hashedPassword, firstName, lastName, role, department, phone]
    );

    const newUser = newUserResult.rows[0];

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur s\'est produite lors de la création de l\'utilisateur'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, role, department, phone, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    res.json({
      user: userResult.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur s\'est produite lors de la récupération du profil'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom de famille est requis'),
  body('phone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { firstName, lastName, department, phone } = req.body;

    const updateResult = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, department = $3, phone = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, email, first_name, last_name, role, department, phone, created_at, updated_at`,
      [firstName, lastName, department, phone, req.user.userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur s\'est produite lors de la mise à jour du profil'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user password
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, userResult.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Mot de passe incorrect',
        message: 'Le mot de passe actuel est incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, req.user.userId]
    );

    res.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur s\'est produite lors du changement de mot de passe'
    });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Seuls les administrateurs peuvent voir tous les utilisateurs'
      });
    }

    const usersResult = await pool.query(
      'SELECT id, email, first_name, last_name, role, department, phone, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      users: usersResult.rows
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur s\'est produite lors de la récupération des utilisateurs'
    });
  }
});

module.exports = router; 