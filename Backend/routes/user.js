const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const Mitarbeiter = require('../models/Mitarbeiter');
const { authenticateJWT } = require('../utils/authenticate');
const config = require('../config');

const router = express.Router();

mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

router.get('/myData', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send('Benutzer nicht gefunden.');
    res.json(user);
  } catch (err) {
    res.status(500).send({ error: "Fehler beim Abrufen der Benutzerdaten" });
  }
});
router.get('/api/mitarbeiter/nummer/:mitarbeiternummer', async (req, res) => {
  try {
   console.log(req.params.mitarbeiternummer)
    
    const mitarbeiter = await Mitarbeiter.findOne({ MitarbeiterNummer: req.params.mitarbeiternummer })

       // Erweitert, um Qualifikationsdaten einzuschließen
    if (!mitarbeiter) {
      return res.status(404).send('Mitarbeiter nicht gefunden');
    }
    //console.log('mitarbeiter',mitarbeiter)
    res.json(mitarbeiter);
  } catch (error) {
    res.status(500).send('Server Fehler: ' + error.message);
  }
});

module.exports = router;
