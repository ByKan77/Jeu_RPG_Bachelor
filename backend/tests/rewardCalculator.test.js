const { calculateReward, validateRewards } = require('../utils/rewardCalculator');

describe('Reward Calculator', () => {
  describe('calculateReward', () => {
    test('devrait calculer correctement les récompenses pour un niveau 1', () => {
      const reward = calculateReward(1);
      expect(reward).toHaveProperty('experience');
      expect(reward.experience).toBeGreaterThan(0);
      expect(reward.experience).toBe(50); // 50 * 1^1.5 = 50
    });

    test('devrait calculer correctement les récompenses pour un niveau 5', () => {
      const reward = calculateReward(5);
      expect(reward).toHaveProperty('experience');
      expect(reward.experience).toBeGreaterThan(0);
      // 50 * 5^1.5 ≈ 50 * 11.18 ≈ 559
      expect(reward.experience).toBeGreaterThan(500);
      expect(reward.experience).toBeLessThan(600);
    });

    test('devrait calculer correctement les récompenses pour un niveau 10', () => {
      const reward = calculateReward(10);
      expect(reward).toHaveProperty('experience');
      expect(reward.experience).toBeGreaterThan(0);
      // 50 * 10^1.5 ≈ 50 * 31.62 ≈ 1581
      expect(reward.experience).toBeGreaterThan(1500);
      expect(reward.experience).toBeLessThan(1600);
    });

    test('devrait augmenter les récompenses avec le niveau', () => {
      const reward1 = calculateReward(1);
      const reward2 = calculateReward(2);
      const reward3 = calculateReward(3);
      
      expect(reward2.experience).toBeGreaterThan(reward1.experience);
      expect(reward3.experience).toBeGreaterThan(reward2.experience);
    });

    test('devrait retourner un nombre entier arrondi', () => {
      const reward = calculateReward(3);
      expect(Number.isInteger(reward.experience)).toBe(true);
    });

    test('devrait retourner une expérience positive', () => {
      const reward = calculateReward(1);
      expect(reward.experience).toBeGreaterThan(0);
    });

    test('devrait lancer une erreur pour un niveau inférieur à 1', () => {
      expect(() => calculateReward(0)).toThrow('Le niveau de la quête doit être au moins 1');
      expect(() => calculateReward(-1)).toThrow('Le niveau de la quête doit être au moins 1');
    });

    test('devrait gérer les niveaux élevés', () => {
      const reward = calculateReward(100);
      expect(reward.experience).toBeGreaterThan(0);
      expect(Number.isInteger(reward.experience)).toBe(true);
    });

    test('devrait avoir une progression logarithmique (niveau 2 ne double pas la récompense)', () => {
      const reward1 = calculateReward(1);
      const reward2 = calculateReward(2);
      
      // Niveau 2 ne devrait pas donner exactement le double
      // 50 * 2^1.5 ≈ 50 * 2.83 ≈ 141
      expect(reward2.experience).toBeGreaterThan(reward1.experience);
      expect(reward2.experience).toBeLessThan(reward1.experience * 3);
    });
  });

  describe('validateRewards', () => {
    test('devrait valider des récompenses valides', () => {
      const validRewards = { experience: 100 };
      expect(validateRewards(validRewards)).toBe(true);
    });

    test('devrait rejeter des récompenses avec expérience négative', () => {
      const invalidRewards = { experience: -10 };
      expect(validateRewards(invalidRewards)).toBe(false);
    });

    test('devrait rejeter des récompenses avec expérience non numérique', () => {
      const invalidRewards = { experience: '100' };
      expect(validateRewards(invalidRewards)).toBe(false);
    });

    test('devrait rejeter des récompenses null ou undefined', () => {
      expect(validateRewards(null)).toBe(false);
      expect(validateRewards(undefined)).toBe(false);
    });

    test('devrait rejeter des récompenses sans propriété experience', () => {
      const invalidRewards = { items: [] };
      expect(validateRewards(invalidRewards)).toBe(false);
    });

    test('devrait accepter des récompenses avec expérience zéro', () => {
      const validRewards = { experience: 0 };
      expect(validateRewards(validRewards)).toBe(true);
    });
  });
});
