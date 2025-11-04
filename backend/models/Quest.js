const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre de la quête est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description de la quête est requise'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  statut: {
    type: String,
    enum: {
      values: ['disponible', 'en cours', 'terminée', 'abandonnée'],
      message: 'Le statut doit être: disponible, en cours, terminée ou abandonnée'
    },
    default: 'disponible',
    lowercase: true
  },
  recompenses: {
    experience: {
      type: Number,
      default: 0,
      min: [0, 'L\'expérience ne peut pas être négative']
    },
    objets: [{
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
      },
      quantite: {
        type: Number,
        default: 1,
        min: [1, 'La quantité doit être au moins 1']
      }
    }]
  },
  joueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null // null si la quête n'est assignée à aucun joueur
  }
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour améliorer les performances
questSchema.index({ statut: 1 });
questSchema.index({ joueur: 1 });
questSchema.index({ createdAt: -1 });

// Méthode pour attribuer la quête à un joueur
questSchema.methods.assignToPlayer = async function(playerId) {
  if (this.statut !== 'disponible') {
    throw new Error('Seules les quêtes disponibles peuvent être assignées');
  }
  
  const Player = mongoose.model('Player');
  const player = await Player.findById(playerId);
  if (!player) {
    throw new Error('Le joueur n\'existe pas');
  }
  
  this.joueur = playerId;
  this.statut = 'en cours';
  await this.save();
  
  // Ajouter la quête aux quêtes en cours du joueur
  await player.addQuestInProgress(this._id);
  
  return this;
};

// Méthode pour compléter la quête et distribuer les récompenses
questSchema.methods.complete = async function() {
  if (this.statut !== 'en cours') {
    throw new Error('Seules les quêtes en cours peuvent être complétées');
  }
  
  if (!this.joueur) {
    throw new Error('La quête n\'est assignée à aucun joueur');
  }
  
  const Player = mongoose.model('Player');
  const player = await Player.findById(this.joueur);
  
  if (!player) {
    throw new Error('Le joueur assigné à cette quête n\'existe plus');
  }
  
  // Distribuer les récompenses au joueur
  const rewards = await player.receiveQuestRewards(this);
  
  // Marquer la quête comme terminée
  this.statut = 'terminée';
  await this.save();
  
  return {
    quest: this,
    rewards
  };
};

// Méthode pour abandonner la quête
questSchema.methods.abandon = async function() {
  if (this.statut !== 'en cours') {
    throw new Error('Seules les quêtes en cours peuvent être abandonnées');
  }
  
  const playerId = this.joueur;
  this.statut = 'abandonnée';
  this.joueur = null;
  await this.save();
  
  // Retirer la quête des quêtes en cours du joueur
  if (playerId) {
    const Player = mongoose.model('Player');
    const player = await Player.findById(playerId);
    if (player) {
      player.quetes.enCours = player.quetes.enCours.filter(
        q => q.toString() !== this._id.toString()
      );
      await player.save();
    }
  }
  
  return this;
};

// Middleware pour valider que les items des récompenses existent
questSchema.pre('save', async function(next) {
  if (this.isModified('recompenses.objets')) {
    const Item = mongoose.model('Item');
    
    for (const rewardItem of this.recompenses.objets) {
      const itemExists = await Item.findById(rewardItem.item);
      if (!itemExists) {
        return next(new Error(`L'objet avec l'ID ${rewardItem.item} n'existe pas`));
      }
    }
  }
  next();
});

module.exports = mongoose.model('Quest', questSchema);

