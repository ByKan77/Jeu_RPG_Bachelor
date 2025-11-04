/**
 * Calcule les récompenses d'une quête basées sur son niveau
 * @param {number} questLevel - Le niveau de la quête
 * @returns {Object} - Un objet contenant l'expérience calculée
 */
function calculateReward(questLevel) {
  if (questLevel < 1) {
    throw new Error('Le niveau de la quête doit être au moins 1');
  }
  
  // Formule de calcul : 50 * niveau^1.5 (arrondi)
  // Cela donne des récompenses qui augmentent progressivement
  const baseReward = 50;
  const experience = Math.round(baseReward * Math.pow(questLevel, 1.5));
  
  return {
    experience,
    // Pour des besoins futurs, on pourrait aussi calculer la quantité d'objets
    // itemsQuantity: Math.max(1, Math.floor(questLevel / 2))
  };
}

/**
 * Valide que les récompenses calculées sont valides
 * @param {Object} rewards - Les récompenses à valider
 * @returns {boolean} - True si les récompenses sont valides
 */
function validateRewards(rewards) {
  if (!rewards || typeof rewards !== 'object') {
    return false;
  }
  
  if (typeof rewards.experience !== 'number' || rewards.experience < 0) {
    return false;
  }
  
  return true;
}

module.exports = {
  calculateReward,
  validateRewards
};
