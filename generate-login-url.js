const jwt = require('jsonwebtoken');

// The encryption key used by Plasmic (default is "fake" for development)
const encryptionKey = process.env.PLASMIC_ENCRYPTION_KEY || "fake";

// Function to prompt for user input
function getUserInput() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('Enter user details to generate login URL:');
    rl.question('User ID (e.g., 29f3f127-fba3-4785-b625-9d6b7755c5e0): ', (userId) => {
      rl.question('Email (e.g., admin@admin.example.com): ', (email) => {
        rl.question('First name (e.g., Plasmic): ', (firstName) => {
          rl.question('Last name (e.g., Admin): ', (lastName) => {
            rl.close();
            resolve({ userId: userId.trim(), email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim() });
          });
        });
      });
    });
  });
}

// Main function
async function main() {
  try {
    console.log('This script generates a login URL with a JWT token for Plasmic.');
    console.log('Make sure your Plasmic dev server is running on http://localhost:3003\n');
    
    const { userId, email, firstName, lastName } = await getUserInput();

    if (!userId || !email) {
      console.error('Error: User ID and email are required');
      process.exit(1);
    }

    // Create the JWT payload
    const payload = {
      userId: userId,
      email: email,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + (1 * 24 * 60 * 60) // Expires in 7 days
    };

    // Generate the JWT token
    const token = jwt.sign(payload, encryptionKey, {
      algorithm: 'HS256'
    });

    // Create the login URL
    const loginUrl = `http://localhost:3003?token=${token}`;
    
    console.log('\n' + '='.repeat(60));
    console.log('Login URL Generated Successfully!');
    console.log('='.repeat(60));
    console.log(`User: ${firstName || ''} ${lastName || ''} (${email})`);
    console.log(`Login URL: ${loginUrl}`);
    console.log(`Token: ${token}`);
    console.log(`Expires: In 7 days`);
    console.log('='.repeat(60));
    console.log('\nTo use this URL:');
    console.log('1. Make sure your Plasmic dev server is running on ports 3003-3005');
    console.log('2. Open the login URL in your browser');
    console.log('3. The user will be automatically logged in');
  } catch (error) {
    console.error('Error generating token:', error);
    process.exit(1);
  }
}

// Run the script
main();