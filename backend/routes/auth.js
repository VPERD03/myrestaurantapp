const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'secret123';

// Εγγραφή χρήστη
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ο χρήστης υπάρχει ήδη.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Εγγραφή επιτυχής!' });
  } catch (err) {
    console.error('❌ Σφάλμα εγγραφής:', err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή.' });
  }
});

// Σύνδεση χρήστη
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Ο χρήστης δεν βρέθηκε.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Λανθασμένος κωδικός.' });
    }

    const payload = { id: user.user_id, email: user.email }; 
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('❌ Σφάλμα σύνδεσης:', err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή.' });
  }
});

module.exports = router;
