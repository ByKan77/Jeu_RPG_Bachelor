const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const playerSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir un email valide']
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas retourner le mot de passe par défaut dans les requêtes
  },
  niveau: {
    type: Number,
    default: 1,
    min: [1, 'Le niveau doit être au moins 1']
  },
  experience: {
    type: Number,
    default: 0,
    min: [0, 'L\'expérience ne peut pas être négative']
  },
  inventaire: [{
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
  }],
  quetes: {
    enCours: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    }],
    completes: [{
      quest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
      },
      dateCompletion: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour améliorer les performances
// Note: email a déjà un index via unique: true dans le schéma
playerSchema.index({ niveau: -1 });
playerSchema.index({ experience: -1 });
playerSchema.index({ 'quetes.enCours': 1 });
playerSchema.index({ 'inventaire.item': 1 });

// Middleware pour hasher le mot de passe avant de sauvegarder
playerSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié (nouveau ou changé)
  if (!this.isModified('motDePasse')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pour valider que les items de l'inventaire existent
playerSchema.pre('save', async function(next) {
  if (this.isModified('inventaire')) {
    const Item = mongoose.model('Item');
    
    for (const invItem of this.inventaire) {
      const itemExists = await Item.findById(invItem.item);
      if (!itemExists) {
        return next(new Error(`L'objet avec l'ID ${invItem.item} n'existe pas`));
      }
    }
  }
  next();
});

// Méthode pour comparer les mots de passe
playerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

// Méthode pour calculer l'expérience nécessaire pour le prochain niveau
playerSchema.methods.getExpForNextLevel = function() {
  // Formule simple : niveau suivant * 100
  return (this.niveau + 1) * 100;
};

// Méthode pour vérifier si le joueur peut monter de niveau
playerSchema.methods.checkLevelUp = function() {
  const expNeeded = this.getExpForNextLevel();
  if (this.experience >= expNeeded) {
    this.niveau += 1;
    this.experience -= expNeeded;
    return true;
  }
  return false;
};

// Méthode pour ajouter un objet à l'inventaire
playerSchema.methods.addToInventory = async function(itemId, quantite = 1) {
  const Item = mongoose.model('Item');
  
  // Vérifier que l'item existe
  const item = await Item.findById(itemId);
  if (!item) {
    throw new Error('L\'objet n\'existe pas');
  }
  
  // Chercher si l'item existe déjà dans l'inventaire
  const existingItemIndex = this.inventaire.findIndex(
    invItem => invItem.item.toString() === itemId.toString()
  );
  
  if (existingItemIndex !== -1) {
    // Ajouter à la quantité existante
    this.inventaire[existingItemIndex].quantite += quantite;
  } else {
    // Ajouter un nouvel objet
    this.inventaire.push({ item: itemId, quantite });
  }
  
  return this.save();
};

// Méthode pour retirer un objet de l'inventaire
playerSchema.methods.removeFromInventory = function(itemId, quantite = 1) {
  const itemIndex = this.inventaire.findIndex(
    invItem => invItem.item.toString() === itemId.toString()
  );
  
  if (itemIndex === -1) {
    throw new Error('L\'objet n\'est pas dans l\'inventaire');
  }
  
  const currentQuantite = this.inventaire[itemIndex].quantite;
  
  if (currentQuantite <= quantite) {
    // Retirer complètement l'objet
    this.inventaire.splice(itemIndex, 1);
  } else {
    // Diminuer la quantité
    this.inventaire[itemIndex].quantite -= quantite;
  }
  
  return this.save();
};

// Méthode pour ajouter de l'expérience et vérifier le level up
playerSchema.methods.addExperience = function(amount) {
  this.experience += amount;
  let levelUps = 0;
  
  // Vérifier les montées de niveau multiples
  while (this.checkLevelUp()) {
    levelUps++;
  }
  
  return { newExperience: this.experience, newLevel: this.niveau, levelUps };
};

// Méthode pour recevoir les récompenses d'une quête
playerSchema.methods.receiveQuestRewards = async function(quest) {
  const rewards = {
    experience: 0,
    items: []
  };
  
  // Ajouter l'expérience
  if (quest.recompenses.experience > 0) {
    const expResult = this.addExperience(quest.recompenses.experience);
    rewards.experience = expResult.newExperience;
    rewards.levelUp = expResult.levelUps > 0;
  }
  
  // Ajouter les objets
  if (quest.recompenses.objets && quest.recompenses.objets.length > 0) {
    for (const rewardItem of quest.recompenses.objets) {
      await this.addToInventory(rewardItem.item, rewardItem.quantite);
      rewards.items.push({
        item: rewardItem.item,
        quantite: rewardItem.quantite
      });
    }
  }
  
  // Ajouter la quête aux quêtes complétées
  this.quetes.completes.push({
    quest: quest._id,
    dateCompletion: new Date()
  });
  
  // Retirer de la liste des quêtes en cours
  this.quetes.enCours = this.quetes.enCours.filter(
    q => q.toString() !== quest._id.toString()
  );
  
  await this.save();
  return rewards;
};

// Méthode pour ajouter une quête en cours
playerSchema.methods.addQuestInProgress = function(questId) {
  const questIdString = questId.toString();
  const exists = this.quetes.enCours.some(
    q => q.toString() === questIdString
  );
  
  if (!exists) {
    this.quetes.enCours.push(questId);
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Player', playerSchema);

