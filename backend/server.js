const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Importer les routes
const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const reservationsRoutes = require('./routes/reservations');
const stockRoutes = require('./routes/stock');
const maintenanceRoutes = require('./routes/maintenance');
const scenariosRoutes = require('./routes/scenarios');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');

// Middleware de sécurité
app.use(helmet());

// Limitation de débit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limite chaque IP à 1000 requêtes par windowMs (augmenté pour le développement)
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Autoriser les ports 3000 et 3001
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de journalisation
app.use(morgan('combined'));

// Middleware de parsing du corps
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Point de terminaison de vérification de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'L\'API de Gestion Hospitalière fonctionne',
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Gestionnaire 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `Impossible de ${req.method} ${req.originalUrl}`
  });
});

// Gestionnaire d'erreur global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: 'Erreur Interne du Serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur s\'est produite'
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur API de Gestion Hospitalière en cours d'exécution sur le port ${PORT}`);
  console.log(`📊 Vérification de santé: http://localhost:${PORT}/health`);
  console.log(`🔗 URL de base de l'API: http://localhost:${PORT}/api`);
});

module.exports = app; 