const { Player, Quest, Item } = require('../models');

/**
 * Récupère le profil complet du joueur authentifié
 * GET /api/player/profile
 * @access Protected
 */
const getProfile = async (req, res) => {
  try {
    // req.player est disponible grâce au middleware authMiddleware
    const playerId = req.playerId;

    // Récupérer le Player avec tous les détails (inventaire et quêtes populées)
    const player = await Player.findById(playerId)
      .populate({
        path: 'inventaire.item',
        select: 'nom description type'
      })
      .populate({
        path: 'quetes.enCours',
        select: 'titre description statut recompenses createdAt',
        populate: {
          path: 'recompenses.objets.item',
          select: 'nom description type'
        }
      })
      .populate({
        path: 'quetes.completes.quest',
        select: 'titre description recompenses',
        populate: {
          path: 'recompenses.objets.item',
          select: 'nom description type'
        }
      })
      .select('-motDePasse -__v');

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    // Calculer l'expérience pour le prochain niveau
    const expForNextLevel = player.getExpForNextLevel();
    const expProgress = player.experience;
    const expNeeded = expForNextLevel - expProgress;

    // Préparer la réponse avec les stats
    const profile = {
      stats: {
        id: player._id,
        nom: player.nom,
        email: player.email,
        niveau: player.niveau,
        experience: player.experience,
        expForNextLevel: expForNextLevel,
        expNeeded: expNeeded,
        progressPercentage: expForNextLevel > 0 
          ? Math.min(100, Math.round((expProgress / expForNextLevel) * 100))
          : 0
      },
      inventaire: player.inventaire || [],
      quetes: {
        enCours: player.quetes.enCours || [],
        completes: player.quetes.completes || []
      },
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    };

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching player profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Le joueur accepte une quête disponible
 * POST /api/player/accept-quest/:questId
 * @access Protected
 */
const acceptQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    const playerId = req.playerId;
    const player = req.player;

    // Vérifier que la quête existe
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quête non trouvée'
      });
    }

    // Vérifier que la quête est disponible
    if (quest.statut !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: `Cette quête n'est pas disponible. Statut actuel: ${quest.statut}`
      });
    }

    // Vérifier que le joueur n'a pas déjà cette quête en cours
    const hasQuestInProgress = player.quetes.enCours.some(
      q => q.toString() === questId
    );
    if (hasQuestInProgress) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà cette quête en cours'
      });
    }

    // Vérifier que le joueur n'a pas déjà complété cette quête
    const hasQuestCompleted = player.quetes.completes.some(
      q => q.quest && q.quest.toString() === questId
    );
    if (hasQuestCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà complété cette quête'
      });
    }

    // Utiliser la méthode assignToPlayer du modèle Quest
    await quest.assignToPlayer(playerId);

    // Recharger le Player pour obtenir les quêtes mises à jour
    const updatedPlayer = await Player.findById(playerId);

    // Recharger la quête avec les détails populés
    const questPopulated = await Quest.findById(questId)
      .populate({
        path: 'recompenses.objets.item',
        select: 'nom description type'
      })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: 'Quête acceptée avec succès',
      data: {
        quest: questPopulated,
        playerQuestsInProgress: updatedPlayer.quetes.enCours.length
      }
    });
  } catch (error) {
    console.error('Error accepting quest:', error);
    
    if (error.message.includes('assignées') || error.message.includes('assignée')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'acceptation de la quête',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Le joueur utilise un objet de son inventaire (le retire)
 * POST /api/player/use-item/:itemId
 * @access Protected
 */
const useItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const player = req.player;

    // Vérifier que l'item existe dans la base de données
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Objet non trouvé'
      });
    }

    // Vérifier que le joueur a cet item dans son inventaire
    const inventoryItem = player.inventaire.find(
      invItem => invItem.item.toString() === itemId
    );

    if (!inventoryItem) {
      return res.status(400).json({
        success: false,
        message: 'Cet objet n\'est pas dans votre inventaire'
      });
    }

    // Utiliser la méthode removeFromInventory du modèle Player
    // Par défaut, on retire 1 unité (quantité = 1)
    const quantityToRemove = req.body.quantite || 1;
    
    if (quantityToRemove < 1) {
      return res.status(400).json({
        success: false,
        message: 'La quantité doit être au moins 1'
      });
    }

    if (quantityToRemove > inventoryItem.quantite) {
      return res.status(400).json({
        success: false,
        message: `Vous n'avez que ${inventoryItem.quantite} de cet objet dans votre inventaire`
      });
    }

    // Retirer l'objet de l'inventaire
    await player.removeFromInventory(itemId, quantityToRemove);

    // Recharger le Player pour obtenir l'inventaire à jour
    const updatedPlayer = await Player.findById(player._id)
      .populate({
        path: 'inventaire.item',
        select: 'nom description type'
      })
      .select('-motDePasse -__v');

    res.status(200).json({
      success: true,
      message: `Objet "${item.nom}" utilisé (${quantityToRemove} unité(s) retirée(s))`,
      data: {
        item: {
          _id: item._id,
          nom: item.nom,
          description: item.description,
          type: item.type
        },
        quantityUsed: quantityToRemove,
        remainingQuantity: inventoryItem.quantite - quantityToRemove,
        inventaire: updatedPlayer.inventaire
      }
    });
  } catch (error) {
    console.error('Error using item:', error);
    
    if (error.message.includes('inventaire')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'utilisation de l\'objet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Le joueur complète une quête en cours
 * POST /api/player/complete-quest/:questId
 * @access Protected
 */
const completeQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    const playerId = req.playerId;
    const player = req.player;

    // Vérifier que la quête existe
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quête non trouvée'
      });
    }

    // Vérifier que la quête est "en cours" pour ce joueur
    if (quest.statut !== 'en cours') {
      return res.status(400).json({
        success: false,
        message: `Cette quête n'est pas en cours. Statut actuel: ${quest.statut}`
      });
    }

    // Vérifier que la quête appartient bien à ce joueur
    if (quest.joueur?.toString() !== playerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cette quête ne vous appartient pas'
      });
    }

    // Vérifier que le joueur a bien cette quête dans ses quêtes en cours
    const hasQuestInProgress = player.quetes.enCours.some(
      q => q.toString() === questId
    );
    if (!hasQuestInProgress) {
      return res.status(400).json({
        success: false,
        message: 'Cette quête n\'est pas dans vos quêtes en cours'
      });
    }

    // Simuler la validation (pour ce projet, on accepte simplement)
    // Dans un vrai jeu, on pourrait vérifier des conditions (objectifs atteints, etc.)

    // Utiliser la méthode complete() du modèle Quest qui distribue les récompenses
    const result = await quest.complete();

    // Recharger le Player pour obtenir les données mises à jour
    const updatedPlayer = await Player.findById(playerId)
      .populate({
        path: 'inventaire.item',
        select: 'nom description type'
      })
      .populate({
        path: 'quetes.enCours',
        select: 'titre description statut'
      })
      .populate({
        path: 'quetes.completes.quest',
        select: 'titre description'
      })
      .select('-motDePasse -__v');

    // Recharger la quête avec les détails populés
    const questPopulated = await Quest.findById(questId)
      .populate({
        path: 'recompenses.objets.item',
        select: 'nom description type'
      })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: `Quête "${quest.titre}" complétée avec succès !`,
      data: {
        quest: questPopulated,
        rewards: result.rewards,
        player: {
          niveau: updatedPlayer.niveau,
          experience: updatedPlayer.experience,
          quetesEnCours: updatedPlayer.quetes.enCours.length,
          quetesCompletes: updatedPlayer.quetes.completes.length,
          inventaire: updatedPlayer.inventaire.length
        }
      }
    });
  } catch (error) {
    console.error('Error completing quest:', error);
    
    if (error.message.includes('complétées') || error.message.includes('en cours')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la complétion de la quête',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProfile,
  acceptQuest,
  useItem,
  completeQuest
};

