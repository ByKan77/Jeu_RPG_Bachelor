require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Item, Player, Quest } = require('../models');

async function testDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    
    // Connexion à la base de données
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI ou DATABASE_URL non défini dans .env');
    }
    
    console.log(`📡 URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`); // Masquer les credentials
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connecté avec succès!\n');
    
    // Nettoyage des données de test précédentes
    console.log('🧹 Nettoyage des données de test précédentes...');
    await Item.deleteMany({ nom: 'Potion de soin' });
    await Player.deleteMany({ email: 'test@example.com' });
    await Quest.deleteMany({ titre: 'Quête de test' });
    console.log('✅ Nettoyage terminé\n');
    
    // Test 1: Créer un item de test
    console.log('📦 Test 1: Création d\'un item de test...');
    const testItem = new Item({
      nom: 'Potion de soin',
      description: 'Restaure 50 points de vie',
      type: 'potion'
    });
    await testItem.save();
    console.log(`✅ Item créé: ${testItem.nom} (ID: ${testItem._id})\n`);
    
    // Test 2: Créer un joueur de test
    console.log('👤 Test 2: Création d\'un joueur de test...');
    const testPlayer = new Player({
      nom: 'Test Player',
      email: 'test@example.com',
      motDePasse: 'password123',
      niveau: 1,
      experience: 0
    });
    await testPlayer.save();
    console.log(`✅ Joueur créé: ${testPlayer.nom} (ID: ${testPlayer._id})\n`);
    
    // Test 3: Ajouter l'item à l'inventaire du joueur
    console.log('🎒 Test 3: Ajout de l\'item à l\'inventaire...');
    await testPlayer.addToInventory(testItem._id, 3);
    await testPlayer.populate('inventaire.item');
    console.log(`✅ Inventaire: ${testPlayer.inventaire.length} objet(s)`);
    console.log(`   - ${testPlayer.inventaire[0].quantite}x ${testPlayer.inventaire[0].item.nom}\n`);
    
    // Test 4: Créer une quête de test
    console.log('🗺️  Test 4: Création d\'une quête de test...');
    const testQuest = new Quest({
      titre: 'Quête de test',
      description: 'Une quête pour tester le système',
      statut: 'disponible',
      recompenses: {
        experience: 100,
        objets: [{
          item: testItem._id,
          quantite: 2
        }]
      }
    });
    await testQuest.save();
    console.log(`✅ Quête créée: ${testQuest.titre} (ID: ${testQuest._id})\n`);
    
    // Test 5: Assigner la quête au joueur
    console.log('📋 Test 5: Assignation de la quête au joueur...');
    await testQuest.assignToPlayer(testPlayer._id);
    console.log(`✅ Quête assignée au joueur ${testPlayer.nom}`);
    console.log(`   Statut de la quête: ${testQuest.statut}`);
    console.log(`   Quêtes en cours du joueur: ${testPlayer.quetes.enCours.length}\n`);
    
    // Test 6: Compléter la quête
    console.log('🏆 Test 6: Complétion de la quête...');
    const result = await testQuest.complete();
    console.log(`✅ Quête complétée!`);
    console.log(`   Récompenses reçues:`);
    console.log(`   - Expérience: ${result.rewards.experience}`);
    console.log(`   - Level Up: ${result.rewards.levelUp ? 'Oui' : 'Non'}`);
    console.log(`   - Objets: ${result.rewards.items.length} type(s)\n`);
    
    // Test 7: Vérifier les résultats
    console.log('🔍 Test 7: Vérification des résultats...');
    const playerUpdated = await Player.findById(testPlayer._id).populate('inventaire.item');
    console.log(`✅ État final du joueur:`);
    console.log(`   - Niveau: ${playerUpdated.niveau}`);
    console.log(`   - Expérience: ${playerUpdated.experience}`);
    console.log(`   - Objets dans l'inventaire: ${playerUpdated.inventaire.length}`);
    console.log(`   - Quêtes complétées: ${playerUpdated.quetes.completes.length}\n`);
    
    // Nettoyage (optionnel - commenté pour garder les données de test)
    // console.log('🧹 Nettoyage des données de test...');
    // await Item.deleteOne({ _id: testItem._id });
    // await Player.deleteOne({ _id: testPlayer._id });
    // await Quest.deleteOne({ _id: testQuest._id });
    // console.log('✅ Données de test supprimées\n');
    
    console.log('✅ Tous les tests sont passés avec succès! 🎉');
    
    // Afficher les statistiques de la base de données
    console.log('\n📊 Statistiques de la base de données:');
    const itemCount = await Item.countDocuments();
    const playerCount = await Player.countDocuments();
    const questCount = await Quest.countDocuments();
    console.log(`   - Items: ${itemCount}`);
    console.log(`   - Joueurs: ${playerCount}`);
    console.log(`   - Quêtes: ${questCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

testDatabase();

