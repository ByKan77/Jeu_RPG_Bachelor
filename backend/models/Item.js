const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de l\'objet est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description de l\'objet est requise'],
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  type: {
    type: String,
    required: [true, 'Le type de l\'objet est requis'],
    enum: {
      values: ['potion', 'arme', 'armure', 'consommable', 'autre'],
      message: 'Le type doit être: potion, arme, armure, consommable ou autre'
    },
    lowercase: true
  }
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour améliorer les performances de recherche
itemSchema.index({ nom: 1 });
itemSchema.index({ type: 1 });

module.exports = mongoose.model('Item', itemSchema);

