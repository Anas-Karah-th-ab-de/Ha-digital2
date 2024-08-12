const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const mongoose = require('mongoose');

// Verbindung zur Datenbank herstellen
const digitalHaConnection = mongoose.createConnection(process.env.digitalHaConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema definieren
const digitalHaSchema = new mongoose.Schema({}, { strict: false });
const DigitalHaData = digitalHaConnection.model('DigitalHaData', digitalHaSchema, 'digitalHa'); // Use collection name 'digitalHa'

// POST route for uploading a photo
router.post('/uploadPhoto', (req, res) => {
  const { orderNumber, componentName, photo, row } = req.body;

  if (!orderNumber || !componentName || !photo) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  // Extract base64 data from the photo string
  const matches = photo.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return res.status(400).send({ message: 'Invalid image format' });
  }

  const imageBuffer = Buffer.from(matches[2], 'base64');
  const dir = path.join(__dirname, '..', 'uploads', orderNumber, componentName, row || 'general');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${Date.now()}.png`);
  fs.writeFile(filePath, imageBuffer, (err) => {
    if (err) {
      return res.status(500).send({ message: 'Error saving the image' });
    }
    res.send({ path: filePath });
  });
});

// GET route for fetching photos by orderNumber, componentName, and optional row
router.post('/photos', (req, res) => {
  const { photoPaths } = req.body;

  if (!Array.isArray(photoPaths) || photoPaths.length === 0) {
    return res.status(400).send({ message: 'Photo paths are required' });
  }

  const photos = photoPaths.map(photoPath => {
    if (fs.existsSync(photoPath)) {
      const imageBuffer = fs.readFileSync(photoPath);
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      return { path: photoPath, base64: base64Image };
    } else {
      return { path: photoPath, error: 'Photo not found' };
    }
  });

  res.send({ photos });
});


const removePhotoPathRecursively = (obj, photoPath) => {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].filter(item => item !== photoPath);
        obj[key].forEach(item => removePhotoPathRecursively(item, photoPath));
        if (obj[key].length === 0) {
          delete obj[key];
        }
      } else {
        removePhotoPathRecursively(obj[key], photoPath);
      }
    }
  }
};

// DELETE route for deleting a photo
router.delete('/photos', async (req, res) => {
  const { photoPath, orderNumber } = req.body;

  if (!photoPath || !orderNumber) {
    return res.status(400).send({ message: 'Photo path and order number are required' });
  }

  try {
    const updateOperations = [
      { path: 'posData.$[].photos', condition: { 'posData.photos': { $exists: true } } },
      { path: 'PruefungBilanzierung.abweichungen.photos', condition: { 'PruefungBilanzierung.abweichungen.photos': { $exists: true } } },
      { path: 'PruefungBilanzierung.bemerkung.photos', condition: { 'PruefungBilanzierung.bemerkung.photos': { $exists: true } } },
      { path: 'ProzessSchritteLinien.$[].Ausschuss.$[].deviationData.photos', condition: { 'ProzessSchritteLinien.Ausschuss.deviationData.photos': { $exists: true } } }
    ];

    let totalModified = 0;

    // Iterate through each update operation
    for (let op of updateOperations) {
      const result = await DigitalHaData.updateMany(
        { orderNumber, ...op.condition },
        { $pull: { [op.path]: photoPath } }
      );
      totalModified += result.nModified; // Sum up the modified counts
    }

    if (totalModified === 0) {
      return res.status(404).send({ message: 'Photo not found in database' });
    }

    // Remove the photo from the filesystem
    fs.unlink(photoPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).send({ message: 'Photo not found in filesystem' });
        }
        return res.status(500).send({ message: 'Error deleting photo' });
      }
      res.send({ message: 'Photo deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).send({ message: 'Error deleting photo' });
  }
});

module.exports = router;
