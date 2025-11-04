const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware');
const {
  getItems,
  getItemById,
  getItemsByType
} = require('../controllers/itemController');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

/**
 * @route   GET /api/items
 * @desc    Récupère la liste de tous les items disponibles
 * @access  Protected (Authentification requise)
 * @query   type, sort, order, limit, page
 */
router.get('/', getItems);

/**
 * @route   GET /api/items/type/:type
 * @desc    Récupère les items par type
 * @access  Protected (Authentification requise)
 * @note    Doit être avant /:id pour éviter les conflits de routes
 */
router.get('/type/:type', getItemsByType);

/**
 * @route   GET /api/items/:id
 * @desc    Récupère un item spécifique par son ID
 * @access  Protected (Authentification requise)
 */
router.get('/:id', getItemById);

module.exports = router;

