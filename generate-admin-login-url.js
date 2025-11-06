const jwt = require('jsonwebtoken');

// The encryption key used by Plasmic (default is "fake" for development)
const encryptionKey = process.env.PLASMIC_ENCRYPTION_KEY || "fake";

// Admin user details from the seeded database
const adminUser = {
  userId: '29f3f127-fba3-4785-b625-9d6b7755c5e0', // Current admin user ID from database
  email: 'admin@admin.example.com',
  firstName: 'Plasmic',
  lastName: 'Admin',
};

// Generate the JWT token
const payload = {
  ...adminUser,
  userId: adminUser.userId, // Map to the expected field name
  iat: Math.floor(Date.now() / 1000), // Issued at time
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // Expires in 7 days
};

// Remove the extra userId field to avoid duplication
delete payload.userId;

// Create the payload with the correct structure
const finalPayload = {
  userId: adminUser.userId,
  email: adminUser.email,
  firstName: adminUser.firstName,
  lastName: adminUser.lastName,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
};

const token = jwt.sign(finalPayload, encryptionKey, {
  algorithm: 'HS256'
});

// Create the login URL
const loginUrl = `http://localhost:3003?token=${token}`;

console.log('='.repeat(70));
console.log('ADMIN LOGIN URL FOR PLASMIC DEV ENVIRONMENT');
console.log('='.repeat(70));
console.log(`User: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})`);
console.log(`Login URL: ${loginUrl}`);
console.log(`Token: ${token}`);
console.log('');
console.log('To use this URL:');
console.log('1. Ensure your Plasmic dev server is running (ports 3003-3005)');
console.log('2. Open the login URL in your browser');
console.log('3. You will be automatically logged in as admin');
console.log('');
console.log('This token is valid for 7 days.');
console.log('='.repeat(70));