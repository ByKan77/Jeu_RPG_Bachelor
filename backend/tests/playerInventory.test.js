const mongoose = require('mongoose');
const { Player, Item } = require('../models');

// Configuration de la base de données de test
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/rpg-quest-test';

describe('Player Inventory Verification', () => {
  let testPlayer;
  let testItem;
  let testItemId;

  beforeAll(async () => {
    // Connexion à la base de données de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Nettoyage : supprimer les données de test et fermer la connexion
    if (testPlayer) {
      await Player.deleteOne({ _id: testPlayer._id });
    }
    if (testItem) {
      await Item.deleteOne({ _id: testItem._id });
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Créer un item de test
    testItem = new Item({
      nom: 'Potion de test',
      description: 'Une potion pour les tests',
      type: 'potion'
    });
    await testItem.save();
    testItemId = testItem._id;

    // Créer un joueur de test avec un inventaire
    // Le modèle Player a un middleware qui hash automatiquement le mot de passe
    testPlayer = new Player({
      nom: 'Joueur Test',
      email: `test${Date.now()}@test.com`,
      motDePasse: 'password123',
      inventaire: [
        {
          item: testItemId,
          quantite: 5
        }
      ]
    });
    await testPlayer.save();
  });

  afterEach(async () => {
    // Nettoyage après chaque test
    if (testPlayer) {
      await Player.deleteOne({ _id: testPlayer._id });
    }
    if (testItem) {
      await Item.deleteOne({ _id: testItem._id });
    }
  });

  describe('removeFromInventory - Vérification de l\'inventaire', () => {
    test('devrait retirer correctement 1 objet de l\'inventaire', async () => {
      const initialQuantity = testPlayer.inventaire[0].quantite;
      
      await testPlayer.removeFromInventory(testItemId, 1);
      
      // Recharger le joueur depuis la base
      const updatedPlayer = await Player.findById(testPlayer._id);
      expect(updatedPlayer.inventaire[0].quantite).toBe(initialQuantity - 1);
    });

    test('devrait retirer plusieurs objets de l\'inventaire', async () => {
      const initialQuantity = testPlayer.inventaire[0].quantite;
      const quantityToRemove = 3;
      
      await testPlayer.removeFromInventory(testItemId, quantityToRemove);
      
      const updatedPlayer = await Player.findById(testPlayer._id);
      expect(updatedPlayer.inventaire[0].quantite).toBe(initialQuantity - quantityToRemove);
    });

    test('devrait retirer complètement l\'objet si la quantité est égale à celle en inventaire', async () => {
      const initialQuantity = testPlayer.inventaire[0].quantite;
      
      await testPlayer.removeFromInventory(testItemId, initialQuantity);
      
      const updatedPlayer = await Player.findById(testPlayer._id);
      expect(updatedPlayer.inventaire.length).toBe(0);
    });

    test('devrait retirer complètement l\'objet si la quantité demandée est supérieure à celle en inventaire', async () => {
      const initialQuantity = testPlayer.inventaire[0].quantite;
      const quantityToRemove = initialQuantity + 1;
      
      await testPlayer.removeFromInventory(testItemId, quantityToRemove);
      
      const updatedPlayer = await Player.findById(testPlayer._id);
      // L'objet devrait être retiré complètement
      expect(updatedPlayer.inventaire.length).toBe(0);
    });

    test('devrait lancer une erreur si l\'objet n\'est pas dans l\'inventaire', async () => {
      // Créer un nouvel item qui n'est pas dans l'inventaire
      const newItem = new Item({
        nom: 'Nouvel Objet',
        description: 'Un objet qui n\'est pas dans l\'inventaire',
        type: 'autre'
      });
      await newItem.save();

      try {
        await testPlayer.removeFromInventory(newItem._id, 1);
        // Si on arrive ici, l'erreur n'a pas été lancée
        expect(true).toBe(false); // Force l'échec du test
      } catch (error) {
        expect(error.message).toBe('L\'objet n\'est pas dans l\'inventaire');
      }

      // Nettoyage
      await Item.deleteOne({ _id: newItem._id });
    });

    test('devrait vérifier que l\'objet existe avant de le retirer', async () => {
      // Utiliser un ObjectId valide mais inexistant
      const fakeId = new mongoose.Types.ObjectId();

      try {
        await testPlayer.removeFromInventory(fakeId, 1);
        // Si on arrive ici, l'erreur n'a pas été lancée
        expect(true).toBe(false); // Force l'échec du test
      } catch (error) {
        expect(error.message).toBe('L\'objet n\'est pas dans l\'inventaire');
      }
    });

    test('devrait retirer par défaut 1 objet si aucune quantité n\'est spécifiée', async () => {
      const initialQuantity = testPlayer.inventaire[0].quantite;
      
      await testPlayer.removeFromInventory(testItemId);
      
      const updatedPlayer = await Player.findById(testPlayer._id);
      expect(updatedPlayer.inventaire[0].quantite).toBe(initialQuantity - 1);
    });

    test('devrait gérer plusieurs objets différents dans l\'inventaire', async () => {
      // Ajouter un deuxième objet à l'inventaire
      const secondItem = new Item({
        nom: 'Deuxième Objet',
        description: 'Un deuxième objet de test',
        type: 'arme'
      });
      await secondItem.save();

      await testPlayer.addToInventory(secondItem._id, 3);
      
      // Retirer seulement le premier objet
      await testPlayer.removeFromInventory(testItemId, 1);
      
      const updatedPlayer = await Player.findById(testPlayer._id);
      expect(updatedPlayer.inventaire.length).toBe(2);
      
      // Vérifier que le premier objet a été retiré
      const firstItem = updatedPlayer.inventaire.find(
        invItem => invItem.item.toString() === testItemId.toString()
      );
      expect(firstItem.quantite).toBe(4);
      
      // Vérifier que le deuxième objet est toujours là
      const secondItemInInventory = updatedPlayer.inventaire.find(
        invItem => invItem.item.toString() === secondItem._id.toString()
      );
      expect(secondItemInInventory.quantite).toBe(3);

      // Nettoyage
      await Item.deleteOne({ _id: secondItem._id });
    });

    test('devrait persister les changements dans la base de données', async () => {
      const initialQuantity = testPlayer.inventaire[0].quantite;
      
      await testPlayer.removeFromInventory(testItemId, 2);
      
      // Recharger depuis la base de données (pas depuis l'objet en mémoire)
      const freshPlayer = await Player.findById(testPlayer._id);
      expect(freshPlayer.inventaire[0].quantite).toBe(initialQuantity - 2);
    });

    test('devrait gérer correctement les quantités à 1', async () => {
      // Créer un joueur avec un seul objet en inventaire
      const singleItemPlayer = new Player({
        nom: 'Joueur Single Item',
        email: `single${Date.now()}@test.com`,
        motDePasse: 'password123',
        inventaire: [
          {
            item: testItemId,
            quantite: 1
          }
        ]
      });
      await singleItemPlayer.save();

      await singleItemPlayer.removeFromInventory(testItemId, 1);
      
      const updatedPlayer = await Player.findById(singleItemPlayer._id);
      expect(updatedPlayer.inventaire.length).toBe(0);

      // Nettoyage
      await Player.deleteOne({ _id: singleItemPlayer._id });
    });
  });
});
