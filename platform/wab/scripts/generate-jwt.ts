import jwt from 'jsonwebtoken';
import { getEncryptionKey } from '../src/wab/server/secrets';

// Generate a JWT token for the admin user
const adminUser = {
  userId: '29f3f127-fba3-4785-b625-9d6b7755c5e0', // From current seed output (admin@admin.example.com)
  email: 'admin@admin.example.com',
  firstName: 'Plasmic',
  lastName: 'Admin',
  // Add any other user properties you need
};

const token = jwt.sign(adminUser, getEncryptionKey(), {
  expiresIn: '7d', // Token expires in 7 days
});

console.log('Admin JWT Token:', token);
console.log('Login URL: http://localhost:3003?token=' + token);
console.log('Use this token by adding ?token=YOUR_TOKEN to URLs or as Authorization: Bearer YOUR_TOKEN header');