const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// Δημιουργία κράτησης
router.post('/', auth, async (req, res) => {
  const { restaurant_id, date, time, people_count } = req.body;
  const user_id = req.user?.id;

  if (!user_id) return res.status(401).json({ message: '⛔ Δεν είστε εξουσιοδοτημένος.' });
  if (!restaurant_id || !date || !time || !people_count) {
    return res.status(400).json({ message: '⛔ Όλα τα πεδία είναι υποχρεωτικά.' });
  }

  try {
    const reservationDate = new Date(`${date}T${time}`);
    const now = new Date();

    if (reservationDate < now) {
      return res.status(400).json({ message: '⛔ Δεν μπορείτε να κάνετε κράτηση στο παρελθόν.' });
    }

    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 12 || hours > 23 || (hours === 23 && minutes > 0)) {
      return res.status(400).json({ message: '⛔ Το ωράριο κρατήσεων είναι 12:00 - 23:00.' });
    }

    await db.query(
      'INSERT INTO reservations (user_id, restaurant_id, date, time, people_count) VALUES (?, ?, ?, ?, ?)',
      [user_id, restaurant_id, date, time, people_count]
    );

    res.status(201).json({ message: '✅ Η κράτηση δημιουργήθηκε επιτυχώς.' });
  } catch (err) {
    console.error('❌ Σφάλμα κράτησης:', err);
    res.status(500).json({ message: '❌ Σφάλμα διακομιστή.' });
  }
});

// Λήψη κρατήσεων χρήστη
router.get('/user', auth, async (req, res) => {
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ message: '⛔ Δεν είστε εξουσιοδοτημένος.' });
  }

  try {
    const [results] = await db.query(
      `SELECT 
         r.*, 
         rest.name AS restaurant_name 
       FROM reservations r
       JOIN restaurants rest ON r.restaurant_id = rest.id
       WHERE r.user_id = ?`,
      [user_id]
    );
    res.json(results);
  } catch (err) {
    console.error('❌ Σφάλμα λήψης κρατήσεων:', err);
    res.status(500).json({ message: '❌ Σφάλμα διακομιστή.' });
  }
});

// Ενημέρωση κράτησης
router.put('/:id', auth, async (req, res) => {
  const { date, time, people_count } = req.body;
  const reservation_id = req.params.id;
  const user_id = req.user?.id;

  if (!date || !time || !people_count) {
    return res.status(400).json({ message: '⛔ Όλα τα πεδία είναι υποχρεωτικά.' });
  }

  try {
    await db.query(
      'UPDATE reservations SET date = ?, time = ?, people_count = ? WHERE reservation_id = ? AND user_id = ?',
      [date, time, people_count, reservation_id, user_id]
    );
    res.json({ message: '✅ Η κράτηση ενημερώθηκε.' });
  } catch (err) {
    console.error('❌ Σφάλμα ενημέρωσης:', err);
    res.status(500).json({ message: '❌ Σφάλμα διακομιστή.' });
  }
});

// Διαγραφή κράτησης
router.delete('/:id', auth, async (req, res) => {
  const reservation_id = req.params.id;
  const user_id = req.user?.id;

  try {
    await db.query(
      'DELETE FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [reservation_id, user_id]
    );
    res.json({ message: '🗑️ Η κράτηση διαγράφηκε.' });
  } catch (err) {
    console.error('❌ Σφάλμα διαγραφής:', err);
    res.status(500).json({ message: '❌ Σφάλμα διακομιστή.' });
  }
});

module.exports = router;
