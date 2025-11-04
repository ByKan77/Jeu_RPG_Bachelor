const jwt = require('jsonwebtoken');
const { Player } = require('../models');

/**
 * Middleware pour vérifier le JWT et protéger les routes
 * Utilisez-le avec : router.get('/route-protégée', authMiddleware, votreControleur)
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token depuis les headers
    // Format attendu : "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant ou invalide'
      });
    }

    // Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7);

    // Vérifier que JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Erreur de configuration du serveur'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer le Player depuis la base de données
    const player = await Player.findById(decoded.playerId).select('-motDePasse');

    if (!player) {
      return res.status(401).json({
        success: false,
        message: 'Joueur non trouvé ou token invalide'
      });
    }

    // Ajouter le Player à la requête pour que les contrôleurs y aient accès
    req.player = player;
    req.playerId = decoded.playerId;

    // Passer au middleware suivant ou à la route
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);

    // Gérer les différents types d'erreurs JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'authentification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = authMiddleware;