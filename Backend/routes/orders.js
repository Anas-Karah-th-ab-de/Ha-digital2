const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cache = require('memory-cache');
const logger = require('../utils/logger');
const Projekt = require('../models/Projekt');
const Order = require('../models/Order1');
const CollectedData = require('../models/CollectedData');
const Platz = require('../models/Platz'); 
const CACHE_DURATION_MS = 300000; // 5 minutes
const Schritt=require('../models/Schritt')
const Waage =require('../models/Waage')
const Raum=require('../models/Raum')
const Druckmethode=require('../models/Drucktype')
const ReferenceWeight=require('../models/referenceWeight')
// Create a separate connection for digitalHa database
const digitalHaConnection = mongoose.createConnection(process.env.digitalHaConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema for collected data in digitalHa
const digitalHaSchema = new mongoose.Schema({}, { strict: false });
const DigitalHaData = digitalHaConnection.model('DigitalHaData', digitalHaSchema, 'digitalHa'); // Use collection name 'digitalHa'

router.get('/orders/:orderNumber', async (req, res) => {
  const { orderNumber } = req.params;

  try {
    // Check cache first
    const cachedData = cache.get(orderNumber);
    if (cachedData) {
      return res.json(cachedData);
    }

    const [projects, orders, collectedData, digitalHaData] = await Promise.all([
      fetchProjects(orderNumber),
      fetchOrders(orderNumber),
      fetchCollectedData(orderNumber),
      fetchDigitalHaData(orderNumber)
    ]);

    let collectedDataArray = Array.isArray(collectedData) ? collectedData : [];
    let finalDigitalHaData = digitalHaData;

    if (!digitalHaData) {
      // If digitalHaData is not found, copy collectedData to DigitalHaData
      if (collectedDataArray.length > 0) {
        await copyToDigitalHaData(orderNumber, collectedDataArray[0]);
        finalDigitalHaData = await fetchDigitalHaData(orderNumber);
      }
    }

    // Ensure all variables are arrays
    const projectsArray = Array.isArray(projects) ? projects : [];
    const ordersArray = Array.isArray(orders) ? orders : [];
    const finalCollectedDataArray = finalDigitalHaData ? [finalDigitalHaData] : collectedDataArray;

    // Combine data from the collections
    const combinedData = combineAllData(projectsArray, ordersArray, finalCollectedDataArray);

    // Store combined data in cache
    cache.put(orderNumber, combinedData, CACHE_DURATION_MS);

    // Respond with combined data
    res.json(combinedData);
  } catch (error) {
    logger.error(`Error fetching data for order number ${orderNumber}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function fetchProjects(orderNumber) {
  try {
    return await Projekt.find({ Auftrag: `Pr.${orderNumber}`, aktiv: false });
  } catch (error) {
    logger.error(`Error fetching projects for order number ${orderNumber}:`, error);
    return [];
  }
}

async function fetchOrders(orderNumber) {
  try {
    return await Order.find({ auftragsnr: orderNumber });
  } catch (error) {
    logger.error(`Error fetching orders for order number ${orderNumber}:`, error);
    return [];
  }
}

async function fetchCollectedData(orderNumber) {
  try {
    return await CollectedData.find({ orderNumber });
  } catch (error) {
    logger.error(`Error fetching collected data for order number ${orderNumber}:`, error);
    return [];
  }
}

async function fetchDigitalHaData(orderNumber) {
  try {
    return await DigitalHaData.findOne({ orderNumber });
  } catch (error) {
    logger.error(`Error fetching digitalHa data for order number ${orderNumber}:`, error);
    return null;
  }
}

async function copyToDigitalHaData(orderNumber, collectedData) {
    try {
      // Convert Mongoose document to plain JavaScript object
      const collectedDataObj = collectedData.toObject();
  
      // Remove _id to avoid duplicate key error
      if (collectedDataObj._id) {
        delete collectedDataObj._id;
      }
  
      const digitalHaData = new DigitalHaData({ ...collectedDataObj, orderNumber });
      await digitalHaData.save();
    } catch (error) {
      logger.error(`Error copying collected data to digitalHa for order number ${orderNumber}:`, error);
    }
  }
  router.get('/schritte', (req, res) => {
    Schritt.find().then(schritte => res.json(schritte));
  });
  router.get('/referenceWeight', (req, res) => {
    ReferenceWeight.find()
      .then(referenceWeights => {
        console.log('Fetched data:', referenceWeights); // Log the fetched data to check if it's being retrieved
        res.json(referenceWeights);
      })
      .catch(err => {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ error: err.message });
      });
  });
  router.get('/waage', (req, res) => {
    Waage.find().then(waage => res.json(waage));
  });
  router.get('/raum', (req, res) => {
    Raum.find().then(raum => res.json(raum));
  });
  router.get('/druckmethode', (req, res) => {
    Druckmethode.find().then(druckmethode => res.json(druckmethode));
  });
  // Hinzufügen eines neuen Schrittes
  router.get('/plaetze', (req, res) => {
    Platz.find().then(plaetze => res.json(plaetze));
  });

// Helper function to combine data from projects, orders, and collected data
function combineAllData(projects, orders, collectedData) {
  return {
    projects,
    orders,
    collectedData,
    warnings: {
      projects: projects.length === 0 ? 'No projects found or error fetching projects' : null,
      orders: orders.length === 0 ? 'No orders found or error fetching orders' : null,
      collectedData: collectedData.length === 0 ? 'No collected data found or error fetching collected data' : null,
    }
  };
}

module.exports = router;
