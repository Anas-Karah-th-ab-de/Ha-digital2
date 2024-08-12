const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Zugriff verweigert. Kein Token bereitgestellt.' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (exception) {
    res.status(400).json({ error: 'Ungültiger Token.' });
  }
}

module.exports = { authenticateJWT };
