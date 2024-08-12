const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Create a separate connection for digitalHa database
const digitalHaConnection = mongoose.createConnection(process.env.digitalHaConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema for collected data
const collectedDataSchema = new mongoose.Schema({}, { strict: false });
const CollectedData = digitalHaConnection.model('CollectedData', collectedDataSchema, 'digitalHa'); // Use collection name 'digitalHa'

// GET collected data by orderNumber
router.get('/collectedData/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const data = await CollectedData.findOne({ orderNumber: orderNumber });

    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: 'Data not found' });
    }
  } catch (error) {
    console.error(`Error fetching data for order number ${orderNumber}:`, error);
    res.status(500).json({ message: error.message });
  }
});

// POST collected data for a specific orderNumber
router.post('/collectedData/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const newData = req.body;

    // Fetch and delete the existing data for the orderNumber
    const existingData = await CollectedData.findOne({ orderNumber });
    if (existingData) {
      await CollectedData.deleteOne({ orderNumber });
    }

    // Remove _id to avoid duplicate key error
    if (newData._id) {
      delete newData._id;
    }

    // Save the new data
    const collectedData = new CollectedData({ ...newData, orderNumber });
    await collectedData.save();

    // Respond with the newly saved data
    res.status(201).json(collectedData);
  } catch (error) {
    console.error(`Error processing order number ${orderNumber}:`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
