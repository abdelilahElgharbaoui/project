const pool = require('../config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Current database time:', result.rows[0].current_time);
    
    // Test basic queries
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Available tables:', tablesResult.rows.map(row => row.table_name));
    
    client.release();
    console.log('✅ Database test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection(); 