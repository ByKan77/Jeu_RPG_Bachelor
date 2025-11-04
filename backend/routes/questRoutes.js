const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware');
const {
  getAvailableQuests,
  getQuestById,
  getQuestsByStatus
} = require('../controllers/questController');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

/**
 * @route   GET /api/quests
 * @desc    Récupère la liste des quêtes disponibles dans le monde
 * @access  Protected (Authentification requise)
 * @query   statut, sort, order, limit, page
 */
router.get('/', getAvailableQuests);

/**
 * @route   GET /api/quests/statut/:statut
 * @desc    Récupère les quêtes par statut
 * @access  Protected (Authentification requise)
 * @note    Doit être avant /:id pour éviter les conflits de routes
 */
router.get('/statut/:statut', getQuestsByStatus);

/**
 * @route   GET /api/quests/:id
 * @desc    Récupère une quête spécifique par son ID
 * @access  Protected (Authentification requise)
 */
router.get('/:id', getQuestById);

module.exports = router;

