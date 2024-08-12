const express = require('express');
const mongoose = require('mongoose');
const { authenticateJWT } = require('../utils/authenticate');
const { validateLicenseKey } = require('../utils/validateLicense');
const License = require('../models/License');
const config = require('../config');

const router = express.Router();

mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

router.post('/updateLicense', authenticateJWT, async (req, res) => {
  const newLicenseKey = req.body.licenseKey;
  const validation = validateLicenseKey(newLicenseKey);

  if (!validation.isValid) {
    return res.status(400).send({ message: validation.message });
  }

  const decodedData = jwt.decode(newLicenseKey, config.SECRET_KEY, algorithms=['HS256']);
  const newExpiryDate = new Date(decodedData.exp * 1000);

  await License.findOneAndUpdate({}, { licenseKey: newLicenseKey, licenseExpiryDate: newExpiryDate }, { upsert: true });
  res.json({ message: 'Lizenz erfolgreich aktualisiert' });
});

router.get('/checkLicense', authenticateJWT, async (req, res) => {
  try {
    const license = await License.findOne();

    if (!license) {
      return res.status(500).send({ isValid: false, message: 'Lizenzinformation nicht gefunden' });
    }

    const validation = validateLicenseKey(license.licenseKey);

    if (!validation.isValid) {
      return res.send({ isValid: false });
    } else {
      return res.send({ isValid: true, expiryDate: validation.expiryDate });
    }
  } catch (error) {
    return res.status(500).send({ message: 'Ein interner Fehler ist aufgetreten.' });
  }
});

module.exports = router;
