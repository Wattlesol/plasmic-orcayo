const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: process.env.WAB_DBHOST || '142.44.136.233',
    port: parseInt(process.env.WAB_DBPORT || '5432', 10),
    user: process.env.WAB_DBUSER || 'wab',
    password: process.env.WAB_DBPASSWORD || 'SEKRET',
    database: process.env.WAB_DBNAME || 'plasmic-db',
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Connected successfully to database!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  } finally {
    await client.end();
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('Database connectivity test passed!');
    process.exit(0);
  } else {
    console.log('Database connectivity test failed!');
    process.exit(1);
  }
});