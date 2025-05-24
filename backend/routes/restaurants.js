const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Λήψη όλων των εστιατορίων
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM restaurants');
    res.json(results);
  } catch (err) {
    console.error('❌ Σφάλμα κατά τη λήψη εστιατορίων:', err);
    res.status(500).json({ message: '❌ Σφάλμα διακομιστή.' });
  }
});

module.exports = router;
