const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware');
const {
  getProfile,
  acceptQuest,
  useItem,
  completeQuest
} = require('../controllers/playerController');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route   GET /api/player/profile
 * @desc    Récupère le profil complet du joueur (stats, inventaire, quêtes)
 * @access  Protected
 */
router.get('/profile', getProfile);

/**
 * @route   POST /api/player/accept-quest/:questId
 * @desc    Le joueur accepte une quête disponible
 * @access  Protected
 */
router.post('/accept-quest/:questId', acceptQuest);

/**
 * @route   POST /api/player/use-item/:itemId
 * @desc    Le joueur utilise un objet de son inventaire (le retire)
 * @access  Protected
 */
router.post('/use-item/:itemId', useItem);

/**
 * @route   POST /api/player/complete-quest/:questId
 * @desc    Le joueur complète une quête en cours
 * @access  Protected
 */
router.post('/complete-quest/:questId', completeQuest);

module.exports = router;

