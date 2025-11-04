const { Quest } = require('../models');

/**
 * Récupère la liste des quêtes disponibles dans le monde
 * GET /api/quests
 */
const getAvailableQuests = async (req, res) => {
  try {
    // Options de filtrage depuis les query params
    const { 
      statut = 'disponible', 
      sort = 'createdAt', 
      order = 'desc',
      limit,
      page = 1 
    } = req.query;
    
    // Construction du filtre
    const filter = {};
    
    // Filtrer par statut (par défaut: seulement disponibles)
    if (statut === 'all') {
      // Pas de filtre de statut
    } else if (statut) {
      filter.statut = statut.toLowerCase();
    } else {
      filter.statut = 'disponible';
    }
    
    // Options de tri
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;
    
    // Pagination
    const limitNum = limit ? parseInt(limit) : undefined;
    const pageNum = parseInt(page);
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;
    
    // Requête avec population des objets de récompenses et du joueur
    const query = Quest.find(filter)
      .sort(sortOptions)
      .populate({
        path: 'recompenses.objets.item',
        select: 'nom description type'
      })
      .populate({
        path: 'joueur',
        select: 'nom niveau',
        options: { strictPopulate: false }
      })
      .select('-__v');
    
    if (limitNum) {
      query.limit(limitNum).skip(skip);
    }
    
    const quests = await query.exec();
    
    // Compter le total pour la pagination
    const total = await Quest.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: quests.length,
      total,
      page: limitNum ? pageNum : undefined,
      limit: limitNum,
      filter: {
        statut: filter.statut || 'all'
      },
      data: quests
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des quêtes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère une quête spécifique par son ID
 * GET /api/quests/:id
 */
const getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id)
      .populate({
        path: 'recompenses.objets.item',
        select: 'nom description type'
      })
      .populate({
        path: 'joueur',
        select: 'nom niveau email',
        options: { strictPopulate: false }
      })
      .select('-__v');
    
    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quête non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: quest
    });
  } catch (error) {
    console.error('Error fetching quest:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la quête',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère les quêtes par statut
 * GET /api/quests/statut/:statut
 */
const getQuestsByStatus = async (req, res) => {
  try {
    const { statut } = req.params;
    
    const validStatuses = ['disponible', 'en cours', 'terminée', 'abandonnée'];
    if (!validStatuses.includes(statut.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Statuts valides: ${validStatuses.join(', ')}`
      });
    }
    
    const quests = await Quest.find({ statut: statut.toLowerCase() })
      .sort({ createdAt: -1 })
      .populate({
        path: 'recompenses.objets.item',
        select: 'nom description type'
      })
      .populate({
        path: 'joueur',
        select: 'nom niveau',
        options: { strictPopulate: false }
      })
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: quests.length,
      statut,
      data: quests
    });
  } catch (error) {
    console.error('Error fetching quests by status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des quêtes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAvailableQuests,
  getQuestById,
  getQuestsByStatus
};

