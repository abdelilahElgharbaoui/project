const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { scenarios, updateScenarios } = require('../data/mockData');

const router = express.Router();

// Validation middleware
const validateScenario = [
  body('name').trim().notEmpty().withMessage('Scenario name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('requiredEquipment').isArray().withMessage('Required equipment must be an array'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('roomTypes').isArray().withMessage('Room types must be an array'),
];

// GET /api/scenarios - Get all scenarios
router.get('/', (req, res) => {
  try {
    const { search, roomType } = req.query;
    
    let filteredScenarios = [...scenarios];
    
    // Apply filters
    if (search) {
      filteredScenarios = filteredScenarios.filter(scenario => 
        scenario.name.toLowerCase().includes(search.toLowerCase()) ||
        scenario.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (roomType && roomType !== 'all') {
      filteredScenarios = filteredScenarios.filter(scenario => 
        scenario.roomTypes.includes(roomType)
      );
    }
    
    res.json({
      success: true,
      data: filteredScenarios,
      total: filteredScenarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des scénarios',
      message: error.message
    });
  }
});

// GET /api/scenarios/:id - Get scenario by ID
router.get('/:id', (req, res) => {
  try {
    const scenario = scenarios.find(s => s.id === req.params.id);
    
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scénario non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: scenario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération du scénario',
      message: error.message
    });
  }
});

// POST /api/scenarios - Create new scenario
router.post('/', validateScenario, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const newScenario = {
      id: uuidv4(),
      ...req.body
    };
    
    scenarios.push(newScenario);
    updateScenarios(scenarios);
    
    res.status(201).json({
      success: true,
      message: 'Scénario créé avec succès',
      data: newScenario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la création du scénario',
      message: error.message
    });
  }
});

// PUT /api/scenarios/:id - Update scenario
router.put('/:id', validateScenario, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const scenarioIndex = scenarios.findIndex(s => s.id === req.params.id);
    
    if (scenarioIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Scénario non trouvé'
      });
    }
    
    const updatedScenario = {
      ...scenarios[scenarioIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    scenarios[scenarioIndex] = updatedScenario;
    updateScenarios(scenarios);
    
    res.json({
      success: true,
      message: 'Scénario mis à jour avec succès',
      data: updatedScenario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour du scénario',
      message: error.message
    });
  }
});

// DELETE /api/scenarios/:id - Delete scenario
router.delete('/:id', (req, res) => {
  try {
    const scenarioIndex = scenarios.findIndex(s => s.id === req.params.id);
    
    if (scenarioIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Scénario non trouvé'
      });
    }
    
    const deletedScenario = scenarios.splice(scenarioIndex, 1)[0];
    updateScenarios(scenarios);
    
    res.json({
      success: true,
      message: 'Scénario supprimé avec succès',
      data: deletedScenario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la suppression du scénario',
      message: error.message
    });
  }
});

module.exports = router; 