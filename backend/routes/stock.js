const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { stockItems, updateStockItems } = require('../data/mockData');

const router = express.Router();

// Validation middleware
const validateStockItem = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category').isIn(['medical', 'equipment', 'supplies', 'medication']).withMessage('Invalid category'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('maxStock').isInt({ min: 1 }).withMessage('Maximum stock must be a positive integer'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('roomIds').isArray().withMessage('Room IDs must be an array'),
];

// Helper function to get stock status
const getStockStatus = (item) => {
  const percentage = (item.currentStock / item.maxStock) * 100;
  
  if (item.currentStock <= item.minStock) {
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  } else if (percentage <= 25) {
    return { status: 'low', color: 'text-amber-600', bgColor: 'bg-amber-100' };
  } else if (percentage <= 50) {
    return { status: 'medium', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  } else {
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
  }
};

// GET /api/stock - Get all stock items
router.get('/', (req, res) => {
  try {
    const { search, category, status } = req.query;
    
    let filteredItems = [...stockItems];
    
    // Apply filters
    if (search) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    if (status && status !== 'all') {
      filteredItems = filteredItems.filter(item => {
        const itemStatus = getStockStatus(item);
        return itemStatus.status === status;
      });
    }
    
    // Add status information to each item
    const itemsWithStatus = filteredItems.map(item => ({
      ...item,
      status: getStockStatus(item)
    }));
    
    res.json({
      success: true,
      data: itemsWithStatus,
      total: itemsWithStatus.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des articles de stock',
      message: error.message
    });
  }
});

// GET /api/stock/:id - Get stock item by ID
router.get('/:id', (req, res) => {
  try {
    const item = stockItems.find(i => i.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Article de stock non trouvé'
      });
    }
    
    const itemWithStatus = {
      ...item,
      status: getStockStatus(item)
    };
    
    res.json({
      success: true,
      data: itemWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération de l\'article de stock',
      message: error.message
    });
  }
});

// POST /api/stock - Create new stock item
router.post('/', validateStockItem, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const newItem = {
      id: uuidv4(),
      ...req.body,
      lastRestocked: new Date().toISOString().split('T')[0]
    };
    
    stockItems.push(newItem);
    updateStockItems(stockItems);
    
    const itemWithStatus = {
      ...newItem,
      status: getStockStatus(newItem)
    };
    
    res.status(201).json({
      success: true,
      message: 'Article de stock créé avec succès',
      data: itemWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la création de l\'article de stock',
      message: error.message
    });
  }
});

// PUT /api/stock/:id - Update stock item
router.put('/:id', validateStockItem, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Échec de la validation',
        details: errors.array()
      });
    }
    
    const itemIndex = stockItems.findIndex(i => i.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Article de stock non trouvé'
      });
    }
    
    const updatedItem = {
      ...stockItems[itemIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    stockItems[itemIndex] = updatedItem;
    updateStockItems(stockItems);
    
    const itemWithStatus = {
      ...updatedItem,
      status: getStockStatus(updatedItem)
    };
    
    res.json({
      success: true,
      message: 'Article de stock mis à jour avec succès',
      data: itemWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour de l\'article de stock',
      message: error.message
    });
  }
});

// DELETE /api/stock/:id - Delete stock item
router.delete('/:id', (req, res) => {
  try {
    const itemIndex = stockItems.findIndex(i => i.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Article de stock non trouvé'
      });
    }
    
    const deletedItem = stockItems.splice(itemIndex, 1)[0];
    updateStockItems(stockItems);
    
    res.json({
      success: true,
      message: 'Article de stock supprimé avec succès',
      data: deletedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la suppression de l\'article de stock',
      message: error.message
    });
  }
});

// PATCH /api/stock/:id/restock - Restock item
router.patch('/:id/restock', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
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
    
    const item = stockItems.find(i => i.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Article de stock non trouvé'
      });
    }
    
    const { quantity } = req.body;
    const newStock = Math.min(item.currentStock + quantity, item.maxStock);
    
    item.currentStock = newStock;
    item.lastRestocked = new Date().toISOString().split('T')[0];
    
    updateStockItems(stockItems);
    
    const itemWithStatus = {
      ...item,
      status: getStockStatus(item)
    };
    
    res.json({
      success: true,
      message: 'Item restocked successfully',
      data: itemWithStatus,
      restockedQuantity: quantity,
      actualAdded: newStock - (item.currentStock - quantity)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la réapprovisionnement de l\'article',
      message: error.message
    });
  }
});

// PATCH /api/stock/:id/use - Use stock item
router.patch('/:id/use', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
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
    
    const item = stockItems.find(i => i.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Article de stock non trouvé'
      });
    }
    
    const { quantity } = req.body;
    
    if (item.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        available: item.currentStock,
        requested: quantity
      });
    }
    
    item.currentStock -= quantity;
    updateStockItems(stockItems);
    
    const itemWithStatus = {
      ...item,
      status: getStockStatus(item)
    };
    
    res.json({
      success: true,
      message: 'Stock used successfully',
      data: itemWithStatus,
      usedQuantity: quantity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de l\'utilisation du stock',
      message: error.message
    });
  }
});

// GET /api/stock/alerts/low-stock - Get low stock alerts
router.get('/alerts/low-stock', (req, res) => {
  try {
    const lowStockItems = stockItems.filter(item => {
      const status = getStockStatus(item);
      return status.status === 'critical' || status.status === 'low';
    }).map(item => ({
      ...item,
      status: getStockStatus(item)
    }));
    
    res.json({
      success: true,
      data: lowStockItems,
      total: lowStockItems.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des alertes de stock faible',
      message: error.message
    });
  }
});

// GET /api/stock/analytics/summary - Get stock analytics
router.get('/analytics/summary', (req, res) => {
  try {
    const totalItems = stockItems.length;
    const totalStock = stockItems.reduce((sum, item) => sum + item.currentStock, 0);
    const totalValue = stockItems.reduce((sum, item) => sum + (item.currentStock * (item.unitPrice || 1)), 0);
    
    const statusCounts = {
      critical: 0,
      low: 0,
      medium: 0,
      good: 0
    };
    
    stockItems.forEach(item => {
      const status = getStockStatus(item);
      statusCounts[status.status]++;
    });
    
    const categoryCounts = stockItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        totalItems,
        totalStock,
        totalValue,
        statusCounts,
        categoryCounts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des analyses de stock',
      message: error.message
    });
  }
});

module.exports = router; 