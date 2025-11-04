require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Quest, Item } = require('../models');

async function createTestQuests() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    
    // Connexion à la base de données
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI ou DATABASE_URL non défini dans .env');
    }
    
    console.log(`📡 Connexion à la base de données...`);
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connecté avec succès!\n');

    // Vérifier ou créer les items nécessaires pour les récompenses
    console.log('🎒 Vérification/Création des items de récompenses...');
    
    let potionItem, weaponItem, armorItem;
    
    // Potion de soin
    potionItem = await Item.findOne({ nom: 'Potion de soin' });
    if (!potionItem) {
      potionItem = new Item({
        nom: 'Potion de soin',
        description: 'Restaure 50 points de vie',
        type: 'potion'
      });
      await potionItem.save();
      console.log('   ✅ Potion de soin créée');
    } else {
      console.log('   ℹ️  Potion de soin existe déjà');
    }

    // Épée en bois
    weaponItem = await Item.findOne({ nom: 'Épée en bois' });
    if (!weaponItem) {
      weaponItem = new Item({
        nom: 'Épée en bois',
        description: 'Une simple épée pour débutant',
        type: 'arme'
      });
      await weaponItem.save();
      console.log('   ✅ Épée en bois créée');
    } else {
      console.log('   ℹ️  Épée en bois existe déjà');
    }

    // Bouclier en cuir
    armorItem = await Item.findOne({ nom: 'Bouclier en cuir' });
    if (!armorItem) {
      armorItem = new Item({
        nom: 'Bouclier en cuir',
        description: 'Un bouclier léger pour débuter',
        type: 'armure'
      });
      await armorItem.save();
      console.log('   ✅ Bouclier en cuir créé');
    } else {
      console.log('   ℹ️  Bouclier en cuir existe déjà');
    }

    // Créer des items supplémentaires
    let gemItem, scrollItem, keyItem;
    
    // Gemme magique
    gemItem = await Item.findOne({ nom: 'Gemme magique' });
    if (!gemItem) {
      gemItem = new Item({
        nom: 'Gemme magique',
        description: 'Une gemme scintillante aux pouvoirs mystérieux',
        type: 'autre'
      });
      await gemItem.save();
      console.log('   ✅ Gemme magique créée');
    }

    // Parchemin de sort
    scrollItem = await Item.findOne({ nom: 'Parchemin de sort' });
    if (!scrollItem) {
      scrollItem = new Item({
        nom: 'Parchemin de sort',
        description: 'Un parchemin ancien contenant un sort puissant',
        type: 'autre'
      });
      await scrollItem.save();
      console.log('   ✅ Parchemin de sort créé');
    }

    // Clé ancienne
    keyItem = await Item.findOne({ nom: 'Clé ancienne' });
    if (!keyItem) {
      keyItem = new Item({
        nom: 'Clé ancienne',
        description: 'Une clé rouillée qui pourrait ouvrir des portes secrètes',
        type: 'autre'
      });
      await keyItem.save();
      console.log('   ✅ Clé ancienne créée');
    }

    console.log('');

    // Supprimer toutes les quêtes de test si elles existent
    console.log('🧹 Nettoyage des anciennes quêtes de test...');
    await Quest.deleteMany({ statut: 'disponible' });
    console.log('   ✅ Nettoyage terminé\n');

    // Créer la première quête : Quête du Débutant
    console.log('🗺️  Création de la Quête 1: Quête du Débutant...');
    const quest1 = new Quest({
      titre: 'Quête du Débutant',
      description: 'Une quête simple pour apprendre les bases du jeu. Parfait pour les nouveaux joueurs !',
      statut: 'disponible',
      recompenses: {
        experience: 50,
        objets: [{
          item: potionItem._id,
          quantite: 2
        }]
      }
    });
    await quest1.save();
    console.log(`   ✅ Quête créée: ${quest1.titre} (ID: ${quest1._id})`);
    console.log(`      Récompenses: ${quest1.recompenses.experience} XP + ${quest1.recompenses.objets.length} type(s) d'objets\n`);

    // Créer la deuxième quête : Chasse aux Monstres
    console.log('🗺️  Création de la Quête 2: Chasse aux Monstres...');
    const quest2 = new Quest({
      titre: 'Chasse aux Monstres',
      description: 'Éliminez 10 gobelins dans la forêt sombre. Attention, ils peuvent être dangereux !',
      statut: 'disponible',
      recompenses: {
        experience: 150,
        objets: [{
          item: weaponItem._id,
          quantite: 1
        }, {
          item: potionItem._id,
          quantite: 3
        }]
      }
    });
    await quest2.save();
    console.log(`   ✅ Quête créée: ${quest2.titre} (ID: ${quest2._id})`);
    console.log(`      Récompenses: ${quest2.recompenses.experience} XP + ${quest2.recompenses.objets.length} type(s) d'objets\n`);

    // Créer la troisième quête : Exploration des Ruines
    console.log('🗺️  Création de la Quête 3: Exploration des Ruines...');
    const quest3 = new Quest({
      titre: 'Exploration des Ruines',
      description: 'Explorez les anciennes ruines mystérieuses et découvrez leurs secrets cachés. Méfiez-vous des pièges !',
      statut: 'disponible',
      recompenses: {
        experience: 300,
        objets: [{
          item: armorItem._id,
          quantite: 1
        }, {
          item: potionItem._id,
          quantite: 5
        }]
      }
    });
    await quest3.save();
    console.log(`   ✅ Quête créée: ${quest3.titre} (ID: ${quest3._id})`);
    console.log(`      Récompenses: ${quest3.recompenses.experience} XP + ${quest3.recompenses.objets.length} type(s) d'objets\n`);

    // Quête 4 : Sauvetage du Village
    console.log('🗺️  Création de la Quête 4: Sauvetage du Village...');
    const quest4 = new Quest({
      titre: 'Sauvetage du Village',
      description: 'Un village voisin est attaqué par des bandits. Aidez les habitants à se défendre !',
      statut: 'disponible',
      recompenses: {
        experience: 200,
        objets: [{
          item: potionItem._id,
          quantite: 4
        }, {
          item: weaponItem._id,
          quantite: 1
        }]
      }
    });
    await quest4.save();
    console.log(`   ✅ Quête créée: ${quest4.titre}\n`);

    // Quête 5 : Le Dragon Endormi
    console.log('🗺️  Création de la Quête 5: Le Dragon Endormi...');
    const quest5 = new Quest({
      titre: 'Le Dragon Endormi',
      description: 'Explorez la caverne du dragon légendaire. Attention, même endormi, il reste dangereux !',
      statut: 'disponible',
      recompenses: {
        experience: 500,
        objets: [{
          item: gemItem._id,
          quantite: 1
        }, {
          item: potionItem._id,
          quantite: 10
        }]
      }
    });
    await quest5.save();
    console.log(`   ✅ Quête créée: ${quest5.titre}\n`);

    // Quête 6 : Collectionneur de Plantes
    console.log('🗺️  Création de la Quête 6: Collectionneur de Plantes...');
    const quest6 = new Quest({
      titre: 'Collectionneur de Plantes',
      description: 'Un herboriste a besoin de plantes rares pour préparer des potions puissantes.',
      statut: 'disponible',
      recompenses: {
        experience: 100,
        objets: [{
          item: potionItem._id,
          quantite: 5
        }]
      }
    });
    await quest6.save();
    console.log(`   ✅ Quête créée: ${quest6.titre}\n`);

    // Quête 7 : Le Secret des Temples
    console.log('🗺️  Création de la Quête 7: Le Secret des Temples...');
    const quest7 = new Quest({
      titre: 'Le Secret des Temples',
      description: 'Explorez les temples anciens et découvrez les secrets cachés de la civilisation perdue.',
      statut: 'disponible',
      recompenses: {
        experience: 400,
        objets: [{
          item: scrollItem._id,
          quantite: 2
        }, {
          item: keyItem._id,
          quantite: 1
        }]
      }
    });
    await quest7.save();
    console.log(`   ✅ Quête créée: ${quest7.titre}\n`);

    // Quête 8 : Marchand Voyageur
    console.log('🗺️  Création de la Quête 8: Marchand Voyageur...');
    const quest8 = new Quest({
      titre: 'Marchand Voyageur',
      description: 'Escortez un marchand à travers la forêt dangereuse jusqu\'à la ville voisine.',
      statut: 'disponible',
      recompenses: {
        experience: 250,
        objets: [{
          item: armorItem._id,
          quantite: 1
        }, {
          item: potionItem._id,
          quantite: 3
        }]
      }
    });
    await quest8.save();
    console.log(`   ✅ Quête créée: ${quest8.titre}\n`);

    // Quête 9 : Le Grimoire Perdu
    console.log('🗺️  Création de la Quête 9: Le Grimoire Perdu...');
    const quest9 = new Quest({
      titre: 'Le Grimoire Perdu',
      description: 'Retrouvez le grimoire volé du grand magicien. Il contient des sorts puissants !',
      statut: 'disponible',
      recompenses: {
        experience: 350,
        objets: [{
          item: scrollItem._id,
          quantite: 3
        }, {
          item: gemItem._id,
          quantite: 2
        }]
      }
    });
    await quest9.save();
    console.log(`   ✅ Quête créée: ${quest9.titre}\n`);

    // Quête 10 : Festin du Roi
    console.log('🗺️  Création de la Quête 10: Festin du Roi...');
    const quest10 = new Quest({
      titre: 'Festin du Roi',
      description: 'Le roi organise un grand festin et a besoin des meilleurs ingrédients pour impressionner ses invités.',
      statut: 'disponible',
      recompenses: {
        experience: 180,
        objets: [{
          item: potionItem._id,
          quantite: 6
        }]
      }
    });
    await quest10.save();
    console.log(`   ✅ Quête créée: ${quest10.titre}\n`);

    // Quête 11 : Garde de la Tour
    console.log('🗺️  Création de la Quête 11: Garde de la Tour...');
    const quest11 = new Quest({
      titre: 'Garde de la Tour',
      description: 'Montez la garde pendant une nuit entière sur la tour de guet. Des ennemis rôdent dans les environs.',
      statut: 'disponible',
      recompenses: {
        experience: 220,
        objets: [{
          item: weaponItem._id,
          quantite: 1
        }, {
          item: armorItem._id,
          quantite: 1
        }]
      }
    });
    await quest11.save();
    console.log(`   ✅ Quête créée: ${quest11.titre}\n`);

    // Quête 12 : Les Mines Abandonnées
    console.log('🗺️  Création de la Quête 12: Les Mines Abandonnées...');
    const quest12 = new Quest({
      titre: 'Les Mines Abandonnées',
      description: 'Explorez les mines abandonnées infestées de créatures. Récupérez les minerais précieux !',
      statut: 'disponible',
      recompenses: {
        experience: 450,
        objets: [{
          item: gemItem._id,
          quantite: 3
        }, {
          item: potionItem._id,
          quantite: 8
        }]
      }
    });
    await quest12.save();
    console.log(`   ✅ Quête créée: ${quest12.titre}\n`);

    // Quête 13 : Champion des Arènes
    console.log('🗺️  Création de la Quête 13: Champion des Arènes...');
    const quest13 = new Quest({
      titre: 'Champion des Arènes',
      description: 'Participez au tournoi des arènes et remportez la victoire contre les meilleurs combattants !',
      statut: 'disponible',
      recompenses: {
        experience: 600,
        objets: [{
          item: weaponItem._id,
          quantite: 2
        }, {
          item: armorItem._id,
          quantite: 2
        }, {
          item: gemItem._id,
          quantite: 1
        }]
      }
    });
    await quest13.save();
    console.log(`   ✅ Quête créée: ${quest13.titre}\n`);

    // Résumé
    console.log('═══════════════════════════════════════');
    console.log('✅ Toutes les quêtes de test ont été créées !\n');
    console.log('📋 Résumé des quêtes créées:');
    console.log(`   1. ${quest1.titre} - ${quest1.recompenses.experience} XP`);
    console.log(`   2. ${quest2.titre} - ${quest2.recompenses.experience} XP`);
    console.log(`   3. ${quest3.titre} - ${quest3.recompenses.experience} XP`);
    console.log(`   4. ${quest4.titre} - ${quest4.recompenses.experience} XP`);
    console.log(`   5. ${quest5.titre} - ${quest5.recompenses.experience} XP`);
    console.log(`   6. ${quest6.titre} - ${quest6.recompenses.experience} XP`);
    console.log(`   7. ${quest7.titre} - ${quest7.recompenses.experience} XP`);
    console.log(`   8. ${quest8.titre} - ${quest8.recompenses.experience} XP`);
    console.log(`   9. ${quest9.titre} - ${quest9.recompenses.experience} XP`);
    console.log(`   10. ${quest10.titre} - ${quest10.recompenses.experience} XP`);
    console.log(`   11. ${quest11.titre} - ${quest11.recompenses.experience} XP`);
    console.log(`   12. ${quest12.titre} - ${quest12.recompenses.experience} XP`);
    console.log(`   13. ${quest13.titre} - ${quest13.recompenses.experience} XP\n`);
    console.log('🎮 Vous pouvez maintenant tester:');
    console.log('   - Voir les quêtes disponibles dans /quests');
    console.log('   - Accepter une quête');
    console.log('   - Compléter une quête et recevoir les récompenses');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des quêtes:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

createTestQuests();

