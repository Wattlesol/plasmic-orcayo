const jwt = require('jsonwebtoken');

// The encryption key used by Plasmic (default is "fake" for development)
const encryptionKey = "fake"; // This matches the default in secrets.ts

// Admin user details from the seed output
const adminUser = {
  userId: 'd432c6b7-fe8f-4dcb-8d64-8caac08898a6', // From seed output
  email: 'admin@admin.example.com',
  firstName: 'Plasmic',
  lastName: 'Admin',
};

// Generate the JWT token
const token = jwt.sign(adminUser, encryptionKey, {
  expiresIn: '7d', // Token expires in 7 days
  issuer: 'plasmic-dev', // Optional issuer
  algorithm: 'HS256'
});

console.log('Admin JWT Token:', token);
console.log('');
console.log('Login URL: http://localhost:3003?token=' + token);
console.log('');
console.log('This token is valid for 7 days and should work with the seeded database.');