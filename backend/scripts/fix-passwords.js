const pool = require('../config/database');

async function fixPasswords() {
  try {
    console.log('🔧 Correction des mots de passe utilisateurs...');

    // Update admin password
    await pool.query(
      `UPDATE users 
       SET password = $1 
       WHERE email = 'admin@hospital.com'`,
      ['$2b$12$QOROO2D7eWeCKZy7nBVrPO6grbF3FVh6DgsjGIGK3ty8jYd4KZtxu']
    );

    // Update user password
    await pool.query(
      `UPDATE users 
       SET password = $1 
       WHERE email = 'user@hospital.com'`,
      ['$2b$12$Xa6nOCFz2RQ0iW.Dkz/9z.LUOFA.sLmOqxZqGqonTOUVx7kD4NFbW']
    );

    console.log('✅ Mots de passe corrigés avec succès !');

    // Verify the users exist
    const adminResult = await pool.query(
      'SELECT email, first_name, last_name, role FROM users WHERE email = $1',
      ['admin@hospital.com']
    );

    const userResult = await pool.query(
      'SELECT email, first_name, last_name, role FROM users WHERE email = $1',
      ['user@hospital.com']
    );

    console.log('\n📋 Utilisateurs disponibles :');
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log(`👑 Admin: ${admin.email} (${admin.first_name} ${admin.last_name})`);
    }
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`👤 User: ${user.email} (${user.first_name} ${user.last_name})`);
    }

    console.log('\n🔑 Mots de passe :');
    console.log('Admin: admin123');
    console.log('User: user123');

  } catch (error) {
    console.error('❌ Erreur lors de la correction des mots de passe:', error);
  } finally {
    await pool.end();
  }
}

// Run the password fix
fixPasswords(); 