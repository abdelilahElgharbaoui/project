# Système de Gestion Hospitalière

Une plateforme complète de gestion hospitalière avec authentification JWT, base de données PostgreSQL et interface moderne.

## 🚀 Fonctionnalités

- **Authentification JWT** avec rôles admin et utilisateur
- **Gestion des salles** médicales avec réservations
- **Gestion des stocks** et inventaire
- **Planification de maintenance** des équipements
- **Interface moderne** et responsive
- **Base de données PostgreSQL** sécurisée
- **API REST** complète

## 🛠️ Technologies Utilisées

### Backend
- Node.js avec Express
- PostgreSQL (Neon Database)
- JWT pour l'authentification
- bcryptjs pour le hachage des mots de passe
- express-validator pour la validation

### Frontend
- Next.js 14 avec TypeScript
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- Context API pour la gestion d'état

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Compte Neon Database (PostgreSQL)

## 🔧 Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Installer les dépendances du frontend**
   ```bash
   npm install
   ```

3. **Installer les dépendances du backend**
   ```bash
   cd backend
   npm install
   ```

4. **Configurer la base de données**
   - Créez un compte sur [Neon Database](https://neon.tech)
   - Créez une nouvelle base de données
   - Copiez l'URL de connexion

5. **Initialiser la base de données**
   ```bash
   cd backend
   npm run init-db
   ```

## 🚀 Démarrage

1. **Démarrer le serveur backend**
   ```bash
   cd backend
   npm run dev
   ```
   Le serveur sera accessible sur `http://localhost:5000`

2. **Démarrer le frontend**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`

## 🌐 Déploiement

### Déploiement Rapide avec Docker

1. **Prérequis**
   - Docker et Docker Compose installés

2. **Configuration**
   ```bash
   cp env.example .env
   # Éditer .env avec vos valeurs de production
   ```

3. **Déploiement**
   ```bash
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh
   
   # Windows PowerShell
   .\deploy.ps1
   ```

### Déploiement Manuel

1. **Backend**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

2. **Frontend**
   ```bash
   npm install
   npm run build
   npm start
   ```

### Plateformes Cloud

- **Heroku**: Utilisez les buildpacks Node.js
- **Railway**: Connectez votre repository GitHub
- **Render**: Créez un nouveau Web Service
- **Vercel**: Déployez le frontend Next.js

Pour plus de détails, consultez le [Guide de Déploiement](DEPLOYMENT.md).

## 👤 Comptes de Démonstration

### Administrateur
- **Email:** admin@hospital.com
- **Mot de passe:** admin123
- **Rôle:** Administrateur complet

### Utilisateur Standard
- **Email:** user@hospital.com
- **Mot de passe:** user123
- **Rôle:** Utilisateur limité

## 🔐 Authentification

Le système utilise JWT (JSON Web Tokens) pour l'authentification :

- Les tokens expirent après 24 heures
- Les mots de passe sont hachés avec bcrypt
- Protection des routes par rôle (admin/user)
- Stockage sécurisé des tokens côté client

## 📊 Structure de la Base de Données

### Tables Principales
- **users** - Utilisateurs et authentification
- **rooms** - Salles médicales et équipements
- **reservations** - Réservations de salles
- **stock** - Gestion des stocks
- **maintenance** - Planification de maintenance

## 🔒 Sécurité

- Validation des données côté serveur
- Protection CSRF
- Rate limiting
- Headers de sécurité avec Helmet
- Validation des tokens JWT
- Hachage sécurisé des mots de passe

## 📱 Interface Utilisateur

### Pages Principales
- **Connexion** - Page d'authentification stylée
- **Tableau de bord** - Vue d'ensemble avec statistiques
- **Gestion des salles** - CRUD complet des salles
- **Gestion des stocks** - Inventaire et alertes
- **Maintenance** - Planification et suivi

### Fonctionnalités par Rôle

#### Administrateur
- Gestion complète des utilisateurs
- Création/modification/suppression de salles
- Gestion des stocks
- Planification de maintenance
- Accès à toutes les fonctionnalités

#### Utilisateur Standard
- Consultation des salles
- Réservation de salles
- Consultation des stocks
- Accès limité aux fonctionnalités

## 🛠️ API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Création d'utilisateur (admin)
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour du profil
- `PUT /api/auth/change-password` - Changement de mot de passe

### Salles
- `GET /api/rooms` - Liste des salles
- `GET /api/rooms/:id` - Détails d'une salle
- `POST /api/rooms` - Créer une salle (admin)
- `PUT /api/rooms/:id` - Modifier une salle (admin)
- `DELETE /api/rooms/:id` - Supprimer une salle (admin)
- `PATCH /api/rooms/:id/status` - Changer le statut

## 🐛 Dépannage

### Problèmes de Connexion à la Base de Données
1. Vérifiez l'URL de connexion PostgreSQL
2. Assurez-vous que la base de données est accessible
3. Vérifiez les paramètres SSL

### Problèmes d'Authentification
1. Vérifiez que les tokens JWT sont valides
2. Assurez-vous que les mots de passe sont corrects
3. Vérifiez les permissions des utilisateurs

### Problèmes de CORS
1. Vérifiez la configuration CORS dans le backend
2. Assurez-vous que les origines sont autorisées

## 📝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour la gestion hospitalière moderne**
