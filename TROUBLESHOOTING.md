# Guide de Dépannage - Authentification

## 🔧 Problème : "Mot de passe oublié" lors de la connexion

### ✅ Solution Appliquée

Le problème a été résolu en corrigeant les mots de passe hachés dans la base de données.

**Étapes effectuées :**
1. ✅ Génération des vrais hashes bcrypt pour les mots de passe
2. ✅ Mise à jour des utilisateurs dans la base de données
3. ✅ Test de l'authentification avec succès
4. ✅ Configuration CORS mise à jour

### 🔑 Comptes de Test Fonctionnels

#### Administrateur
- **Email:** admin@hospital.com
- **Mot de passe:** admin123
- **Rôle:** Administrateur complet

#### Utilisateur Standard
- **Email:** user@hospital.com
- **Mot de passe:** user123
- **Rôle:** Utilisateur limité

## 🚀 Comment Tester

### 1. Vérifier que le Backend Fonctionne
```bash
cd backend
npm run dev
```
Le serveur doit démarrer sur `http://localhost:5000`

### 2. Vérifier que le Frontend Fonctionne
```bash
npm run dev
```
L'application doit être accessible sur `http://localhost:3000` ou `http://localhost:3001`

### 3. Tester l'Authentification
```bash
cd backend
npm run test-auth
```

## 🐛 Autres Problèmes Possibles

### Problème de CORS
Si vous voyez des erreurs CORS dans la console du navigateur :

1. **Vérifiez que le backend tourne sur le port 5000**
2. **Vérifiez que le frontend tourne sur le port 3000 ou 3001**
3. **Redémarrez le serveur backend** après modification de la config CORS

### Problème de Base de Données
Si la base de données n'est pas accessible :

1. **Vérifiez l'URL de connexion** dans `backend/config/database.js`
2. **Testez la connexion** avec `npm run init-db`
3. **Vérifiez les logs** du serveur backend

### Problème de Ports
Si les ports sont occupés :

1. **Arrêtez tous les processus Node.js** : `taskkill /F /IM node.exe`
2. **Redémarrez les serveurs** dans l'ordre : backend puis frontend
3. **Vérifiez les ports disponibles** avec `netstat -ano | findstr :5000`

## 🔍 Debugging

### Vérifier les Logs du Backend
Les logs du serveur backend affichent :
- Les tentatives de connexion
- Les erreurs d'authentification
- Les problèmes de base de données

### Vérifier la Console du Navigateur
Ouvrez les outils de développement (F12) et vérifiez :
- Les erreurs JavaScript
- Les requêtes réseau
- Les erreurs CORS

### Tester l'API Manuellement
```bash
# Test de santé
curl http://localhost:5000/health

# Test de connexion admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

## 📞 Support

Si le problème persiste :

1. **Vérifiez que tous les services sont démarrés**
2. **Vérifiez les logs d'erreur**
3. **Testez avec les comptes de démonstration**
4. **Redémarrez complètement l'application**

---

**✅ Le problème d'authentification a été résolu ! Les mots de passe sont maintenant corrects et l'authentification fonctionne parfaitement.** 