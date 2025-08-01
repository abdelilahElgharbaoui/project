const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');

    // Read the SQL initialization file
    const sqlPath = path.join(__dirname, '../database/init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ Exécution de la requête ${i + 1}/${statements.length}`);
        } catch (error) {
          if (error.code === '23505') { // Unique constraint violation
            console.log(`⚠️  Requête ${i + 1} ignorée (contrainte unique)`);
          } else {
            console.error(`❌ Erreur lors de l'exécution de la requête ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('✅ Base de données initialisée avec succès !');
    
    // Test the connection and show some stats
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const roomCount = await pool.query('SELECT COUNT(*) FROM rooms');
    const stockCount = await pool.query('SELECT COUNT(*) FROM stock');

    console.log('\n📊 Statistiques de la base de données :');
    console.log(`👥 Utilisateurs: ${userCount.rows[0].count}`);
    console.log(`🏥 Salles: ${roomCount.rows[0].count}`);
    console.log(`📦 Articles en stock: ${stockCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase(); 