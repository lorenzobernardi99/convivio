const { OAuth2Client } = require('google-auth-library');
const googleClientId = '12439243694-e7sdb14hefrbgge7vc74g6cv4r59a3hd.apps.googleusercontent.com';
const client = new OAuth2Client(googleClientId);

async function validateToken(req, res, next) {
  const idToken = req.get('Authorization');

  if (!idToken) {
    return res.status(401).send('Unauthorized');
  }
  try {
    await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    next();
  } catch (error) {
    console.error('Error verifying ID token:', error.message);
    res.status(401).send('Invalid ID token');
  }
}

module.exports = validateToken;