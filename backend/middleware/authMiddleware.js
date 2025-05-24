const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'secret123';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '⛔ Το token λείπει.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // Ανάκτηση του χρήστη από το email
    const [rows] = await db.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [decoded.email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: '⛔ Ο χρήστης δεν βρέθηκε.' });
    }

    // Αποθήκευση στοιχείων χρήστη στο request για μεταγενέστερη χρήση
    req.user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email
    };

    next();
  } catch (err) {
    console.error('⛔ Σφάλμα token:', err);
    return res.status(401).json({ message: '⛔ Μη έγκυρο ή ληγμένο token.' });
  }
}

module.exports = authMiddleware;
