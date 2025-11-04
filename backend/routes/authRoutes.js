const express = require('express');
const router = express.Router();
const {
  register,
  login
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Crée un nouveau compte joueur
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Connecte un joueur et retourne un JWT
 * @access  Public
 */
router.post('/login', login);

module.exports = router;

