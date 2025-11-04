const { Player } = require('../models');
const jwt = require('jsonwebtoken');

/**
 * Enregistre un nouveau joueur
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    // Vérifier que tous les champs sont présents
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nom, un email et un mot de passe'
      });
    }

    // Vérifier si le Player existe déjà
    const existingPlayer = await Player.findOne({ email });
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Créer le nouveau Player
    // Le mot de passe sera automatiquement hashé par le middleware pre('save') du modèle
    const player = new Player({
      nom,
      email,
      motDePasse
    });

    await player.save();

    // Ne pas retourner le mot de passe (déjà exclu par select: false, mais on s'assure)
    const playerResponse = player.toObject();
    delete playerResponse.motDePasse;

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: playerResponse
    });
  } catch (error) {
    console.error('Error registering player:', error);
    
    // Gérer les erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }

    // Gérer les erreurs de duplication (email unique)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Connecte un joueur et génère un JWT
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier que tous les champs sont présents
    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Trouver le Player avec le mot de passe (normalement exclu par select: false)
    // On utilise .select('+motDePasse') pour l'inclure explicitement
    const player = await Player.findOne({ email }).select('+motDePasse');

    if (!player) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await player.comparePassword(motDePasse);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le JWT
    // Vérifier que JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Erreur de configuration du serveur'
      });
    }

    const token = jwt.sign(
      { playerId: player._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Le token expire après 7 jours
    );

    // Préparer la réponse (sans le mot de passe)
    const playerResponse = player.toObject();
    delete playerResponse.motDePasse;

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      data: playerResponse
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login
};

