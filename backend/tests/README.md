# Tests Unitaires - RPG Quest System

Ce dossier contient les tests unitaires pour les fonctions critiques du backend.

## Configuration

Les tests utilisent **Jest** comme framework de test.

## Prérequis

1. MongoDB doit être installé et en cours d'exécution
2. Une base de données de test (par défaut : `rpg-quest-test`)
3. Les dépendances doivent être installées : `npm install`

## Exécution des tests

### Tous les tests
```bash
npm test
```

### Tests avec couverture de code
```bash
npm test -- --coverage
```

### Tests en mode watch (redémarre automatiquement lors des changements)
```bash
npm run test:watch
```

### Un fichier de test spécifique
```bash
npm test rewardCalculator.test.js
```

## Structure des tests

### 1. `rewardCalculator.test.js`
Tests pour la fonction de calcul de récompenses basées sur le niveau de la quête.

**Fonctions testées :**
- `calculateReward(questLevel)` : Calcule l'expérience en fonction du niveau de la quête
- `validateRewards(rewards)` : Valide que les récompenses sont valides

**Cas de test :**
- Calcul correct pour différents niveaux (1, 5, 10)
- Vérification de la progression logarithmique
- Gestion des erreurs (niveau < 1)
- Validation des récompenses

### 2. `playerInventory.test.js`
Tests pour la vérification de l'inventaire avant utilisation d'un objet.

**Fonctions testées :**
- `removeFromInventory(itemId, quantite)` : Retire un objet de l'inventaire du joueur

**Cas de test :**
- Retrait d'un seul objet
- Retrait de plusieurs objets
- Retrait complet (objet retiré de l'inventaire)
- Vérification que l'objet existe dans l'inventaire
- Gestion des erreurs (objet inexistant)
- Gestion de plusieurs objets différents
- Persistance dans la base de données

## Configuration de la base de données de test

Par défaut, les tests utilisent la base de données `rpg-quest-test` sur `mongodb://localhost:27017`.

Pour utiliser une autre base de données, définissez la variable d'environnement :
```bash
TEST_MONGODB_URI=mongodb://localhost:27017/votre-base-de-test npm test
```

## Note importante

Les tests de `playerInventory.test.js` nécessitent une connexion MongoDB active. Assurez-vous que MongoDB est en cours d'exécution avant d'exécuter les tests.

## Couverture de code

Pour voir le rapport de couverture détaillé :
```bash
npm test -- --coverage
```

Le rapport sera généré dans le dossier `coverage/`.
