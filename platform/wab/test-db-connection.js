const fs = require('fs');
const path = require('path');

console.log('Testing database connection and module availability...\n');

// 1. Check if TypeORM is available
let typeorm;
try {
  console.log('Checking for TypeORM installation...');
  typeorm = require('typeorm');
  console.log('✓ TypeORM module found:', typeof typeorm);
} catch (e) {
  console.error('✗ TypeORM module NOT found:', e.message);
  console.log('Attempting to install TypeORM...\n');
  
  const { execSync } = require('child_process');
  try {
    execSync('yarn add typeorm pg reflect-metadata', { stdio: 'inherit' });
    console.log('✓ TypeORM installed successfully');
    typeorm = require('typeorm');
  } catch (installErr) {
    console.error('✗ Failed to install TypeORM:', installErr.message);
    process.exit(1);
  }
}

// 2. Ensure data-source.ts exists with correct content
const dataSourcePath = path.join(__dirname, 'data-source.ts');
const dbConfig = {
  type: "postgres",
  host: process.env.WAB_DBHOST || process.env.DB_HOST || process.env.PLASMIC_DBHOST || "plasmic-db",
  port: parseInt(process.env.WAB_DBPORT || process.env.DB_PORT || process.env.PLASMIC_DBPORT || "5432"),
  username: process.env.WAB_DBUSER || process.env.DB_USER || process.env.PLASMIC_DBUSER || "wab",
  password: process.env.WAB_DBPASSWORD || process.env.DB_PASS || process.env.PLASMIC_DBPASSWORD || "SEKRET",
  database: process.env.WAB_DBNAME || process.env.DB_NAME || process.env.PLASMIC_DBNAME || "wab",
  synchronize: false,
  dropSchema: false,
  logging: false,
  entities: [
    "./src/wab/server/entities/**/*.ts",
    "./dist/src/wab/server/entities/**/*.js"
  ],
  migrations: [
    "./src/wab/server/migrations/**/*.ts", 
    "./dist/src/wab/server/migrations/**/*.js"
  ],
  subscribers: [
    "./src/wab/server/subscribers/**/*.ts",
    "./dist/src/wab/server/subscribers/**/*.js"
  ]
};

const dataSourceContent = `import { DataSource } from "typeorm";
import "reflect-metadata";

const AppDataSource = new DataSource(${JSON.stringify(dbConfig, null, 2)});

export default AppDataSource;
`;

// Write the data-source.ts file to ensure it exists
fs.writeFileSync(dataSourcePath, dataSourceContent);
console.log('✓ data-source.ts file created/verified');

// 3. Test database connection parameters
console.log('\nDatabase configuration:');
console.log('- Host:', process.env.WAB_DBHOST || process.env.DB_HOST || process.env.PLASMIC_DBHOST || "plasmic-db");
console.log('- Port:', process.env.WAB_DBPORT || process.env.DB_PORT || process.env.PLASMIC_DBPORT || 5432);
console.log('- Username:', process.env.WAB_DBUSER || process.env.DB_USER || process.env.PLASMIC_DBUSER || "wab");
console.log('- Database:', process.env.WAB_DBNAME || process.env.DB_NAME || process.env.PLASMIC_DBNAME || "wab");

// 4. Try to create a simple connection test
try {
  console.log('\nChecking for pg module...');
  const { Client } = require('pg');
  
  const client = new Client({
    host: process.env.WAB_DBHOST || process.env.DB_HOST || process.env.PLASMIC_DBHOST || "plasmic-db",
    port: parseInt(process.env.WAB_DBPORT || process.env.DB_PORT || process.env.PLASMIC_DBPORT || "5432"),
    user: process.env.WAB_DBUSER || process.env.DB_USER || process.env.PLASMIC_DBUSER || "wab",
    password: process.env.WAB_DBPASSWORD || process.env.DB_PASS || process.env.PLASMIC_DBPASSWORD || "SEKRET",
    database: process.env.WAB_DBNAME || process.env.DB_NAME || process.env.PLASMIC_DBNAME || "wab",
  });

  console.log('Attempting to connect to database...');
  client.connect()
    .then(() => {
      console.log('✓ Database connection successful!');
      client.end();
      process.exit(0);
    })
    .catch(err => {
      console.error('✗ Database connection failed:', err.message);
      console.log('\nMake sure the database service is running and accessible.');
      process.exit(1);
    });
    
} catch (e) {
  console.error('✗ pg module NOT found, installing...', e.message);
  const { execSync } = require('child_process');
  try {
    execSync('yarn add pg', { stdio: 'inherit' });
    console.log('✓ pg module installed successfully');
    
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.WAB_DBHOST || process.env.DB_HOST || process.env.PLASMIC_DBHOST || "plasmic-db",
      port: parseInt(process.env.WAB_DBPORT || process.env.DB_PORT || process.env.PLASMIC_DBPORT || "5432"),
      user: process.env.WAB_DBUSER || process.env.DB_USER || process.env.PLASMIC_DBUSER || "wab",
      password: process.env.WAB_DBPASSWORD || process.env.DB_PASS || process.env.PLASMIC_DBPASSWORD || "SEKRET",
      database: process.env.WAB_DBNAME || process.env.DB_NAME || process.env.PLASMIC_DBNAME || "wab",
    });

    console.log('Attempting to connect to database...');
    client.connect()
      .then(() => {
        console.log('✓ Database connection successful!');
        client.end();
        process.exit(0);
      })
      .catch(err => {
        console.error('✗ Database connection failed:', err.message);
        console.log('\nMake sure the database service is running and accessible.');
        process.exit(1);
      });
  } catch (installErr) {
    console.error('✗ Failed to install pg module:', installErr.message);
    process.exit(1);
  }
}