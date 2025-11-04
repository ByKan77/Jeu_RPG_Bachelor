const { Item } = require('../models');

/**
 * Récupère la liste de tous les items disponibles dans le jeu
 * GET /api/items
 */
const getItems = async (req, res) => {
  try {
    // Options de filtrage et tri depuis les query params
    const { type, sort = 'nom', order = 'asc', limit, page = 1 } = req.query;
    
    // Construction du filtre
    const filter = {};
    if (type) {
      filter.type = type.toLowerCase();
    }
    
    // Options de tri
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;
    
    // Pagination
    const limitNum = limit ? parseInt(limit) : undefined;
    const pageNum = parseInt(page);
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;
    
    // Requête avec options
    const query = Item.find(filter)
      .sort(sortOptions)
      .select('-__v'); // Exclure le champ __v
    
    if (limitNum) {
      query.limit(limitNum).skip(skip);
    }
    
    const items = await query.exec();
    
    // Compter le total pour la pagination
    const total = await Item.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: limitNum ? pageNum : undefined,
      limit: limitNum,
      data: items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère un item spécifique par son ID
 * GET /api/items/:id
 */
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('-__v');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère les items par type
 * GET /api/items/type/:type
 */
const getItemsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const items = await Item.find({ type: type.toLowerCase() })
      .sort({ nom: 1 })
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: items.length,
      type,
      data: items
    });
  } catch (error) {
    console.error('Error fetching items by type:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getItems,
  getItemById,
  getItemsByType
};

