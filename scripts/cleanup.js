// Cleanup script for expired photo sessions
// This can be run as a cron job or scheduled task

const { Pool } = require('pg');

async function cleanupExpiredSessions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('Starting cleanup of expired photo sessions...');
    
    // Delete expired sessions and their associated temp photos
    const result = await client.query(`
      DELETE FROM photo_sessions 
      WHERE expires_at < CURRENT_TIMESTAMP
      RETURNING id, session_name, created_at
    `);
    
    console.log(`Cleaned up ${result.rows.length} expired sessions:`);
    result.rows.forEach(session => {
      console.log(`- ${session.session_name} (${session.id}) created at ${session.created_at}`);
    });
    
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupExpiredSessions().catch(console.error);
}

module.exports = { cleanupExpiredSessions };