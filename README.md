# 🎮 RPG Quest System - Guide du Héro

> *"Dans un royaume lointain, où les quêtes épiques attendent les braves aventuriers, un système de jeu vous permet de créer votre légende. Bienvenue, noble joueur, dans le monde du RPG Quest System !"*

## 📜 Prologue

Ce projet est un système complet de gestion de quêtes RPG avec un serveur backend puissant et une interface frontend moderne. Prenez votre épée, préparez votre inventaire, et embarquez pour une aventure épique !

## ⚔️ Prérequis - Équipement du Héros

Avant de commencer votre aventure, assurez-vous d'avoir les outils nécessaires :

- **Node.js** (version 16 ou supérieure) - Votre grimoire magique
- **MongoDB** - La base de données des connaissances anciennes
- **npm** - Votre gestionnaire de paquets (inclus avec Node.js)

## 🏰 Architecture du Royaume

```
rpg-quest-system/
├── 🎯 backend/          # Le cœur du serveur - La citadelle
│   ├── config/         # Configurations magiques
│   ├── controllers/    # Les commandants de guerre
│   ├── models/         # Les modèles de données
│   ├── routes/         # Les chemins de l'empire
│   └── utils/          # Utilitaires magiques
├── ⚡ frontend/         # L'interface du joueur - Le portail
│   ├── src/
│   │   ├── components/ # Les composants visuels
│   │   ├── pages/      # Les différentes terres
│   │   └── context/    # Le contexte magique
└── 🗡️ server.js        # Le serveur principal
```

## 🚀 Démarrage de l'Aventure

### Étape 1 : Préparer votre Sanctuaire

Tout d'abord, clonez ce royaume ou téléchargez-le sur votre machine locale.

```bash
# Si vous avez cloné depuis un dépôt Git
cd rpg-quest-system
```

### Étape 2 : Installer les Artéfacts Magiques (Dépendances)

#### 🎯 Installation du Backend (La Citadelle)

Installez les dépendances du serveur :

```bash
npm install
```

#### ⚡ Installation du Frontend (Le Portail)

Installez les dépendances du client :

```bash
cd frontend
npm install
cd ..
```

### Étape 3 : Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les configurations suivantes :

```env
# Port du serveur (par défaut: 5000)
PORT=5000

# URL de MongoDB (votre base de données)
MONGODB_URI=mongodb://localhost:27017/rpg-quest-system

# URL du frontend (par défaut: http://localhost:5173)
FRONTEND_URL=http://localhost:5173

# Secret JWT pour l'authentification (changez-le en production !)
JWT_SECRET=votre_secret_super_securise_ici
```

> ⚠️ **Important** : En production, utilisez un secret JWT fort et unique !

### Étape 4 : Lancer le Serveur de Jeu (La Citadelle) 🏰

Le serveur backend est le cœur de votre royaume. C'est lui qui gère toutes les opérations, les quêtes, les inventaires et les joueurs.

**Depuis la racine du projet :**

```bash
npm start
```

Ou pour le mode développement :

```bash
npm run dev
```

> 🎉 **Succès !** Si tout se passe bien, vous devriez voir :
> ```
> Server running on port 5000
> ```
> 
> La citadelle est maintenant active et prête à recevoir les héros !

### Étape 5 : Lancer le Client de Jeu (Le Portail) ⚡

Le client frontend est votre interface graphique, votre portail vers le monde du jeu.

**Ouvrez un nouveau terminal** (laissez le serveur tourner) et exécutez :

```bash
cd frontend
npm run dev
```

> 🌟 **Excellent !** Votre portail devrait s'ouvrir automatiquement à l'adresse :
> ```
> http://localhost:5173
> ```
> 
> Sinon, ouvrez manuellement cette URL dans votre navigateur.

## 🎯 Utilisation - Votre Première Quête

1. **Créer votre Compte** : Cliquez sur "S'inscrire" et créez votre personnage de héros
2. **Explorer le Monde** : Une fois connecté, vous accéderez à votre profil
3. **Accepter des Quêtes** : Rendez-vous dans le "Journal de Quêtes" pour découvrir les missions disponibles
4. **Compléter des Quêtes** : Accomplissez vos missions pour gagner de l'expérience et des objets
5. **Gérer votre Inventaire** : Consultez vos objets dans votre profil

## 🔧 Commandes Utiles - Grimoire des Sortils

### Backend (Serveur)

```bash
# Démarrer le serveur
npm start

# Mode développement
npm run dev

# Tester la base de données
npm run test:db

# Exécuter les tests unitaires
cd backend
npm test
```

### Frontend (Client)

```bash
# Démarrer le serveur de développement
cd frontend
npm run dev

# Créer une version de production
npm run build

# Prévisualiser la version de production
npm run preview

# Vérifier le code (lint)
npm run lint
```

## 📚 Endpoints de l'API - Les Chemins du Royaume

Votre serveur expose les routes suivantes :

- **`/api/auth`** - Authentification (Inscription, Connexion)
- **`/api/player`** - Actions du joueur (Profil, Quêtes, Inventaire)
- **`/api/quests`** - Gestion des quêtes
- **`/api/items`** - Gestion des objets

## 🐛 Dépannage - Solutions aux Malédictions

### Le serveur ne démarre pas

- ✅ Vérifiez que MongoDB est installé et en cours d'exécution
- ✅ Vérifiez que le port 5000 n'est pas déjà utilisé
- ✅ Vérifiez que toutes les dépendances sont installées (`npm install`)

### Le client ne se connecte pas au serveur

- ✅ Assurez-vous que le serveur backend est bien lancé
- ✅ Vérifiez que l'URL dans `.env` correspond au port du serveur
- ✅ Vérifiez que le CORS est bien configuré

### Problèmes de base de données

- ✅ Vérifiez que MongoDB est bien démarré : `mongod`
- ✅ Vérifiez la chaîne de connexion dans `.env`
- ✅ Testez la connexion avec : `npm run test:db`

## 🎨 Fonctionnalités - Les Pouvoirs du Système

### ✨ Fonctionnalités Principales

- 🛡️ **Système d'authentification** : Créez votre compte et protégez-le
- 📜 **Gestion de quêtes** : Acceptez et complétez des quêtes épiques
- 🎒 **Inventaire dynamique** : Collectez et utilisez des objets
- 📊 **Système de progression** : Gagnez de l'expérience et montez de niveau
- ⚡ **Interface réactive** : Mise à jour automatique après chaque action

### 🎮 Système de Jeu

- **Niveaux et Expérience** : Progressez en complétant des quêtes
- **Récompenses** : Obtenez de l'expérience et des objets précieux
- **Statistiques** : Suivez votre progression et vos accomplissements

## 🤝 Contribution - Rejoignez la Guilde

Vous souhaitez améliorer ce royaume ? Les contributions sont les bienvenues !

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence ISC.

## 🎭 Remerciements

Merci à tous les héros qui ont contribué à faire de ce projet une aventure épique !

---

> *"Que l'aventure commence ! Puissent vos quêtes être nombreuses et vos récompenses généreuses. Bon jeu, noble héros !"* ⚔️✨

---

**Besoin d'aide ?** N'hésitez pas à ouvrir une issue ou à consulter la documentation dans les dossiers `backend/tests/README.md` pour les tests.

**Bon courage, aventurier !** 🏰🎮
