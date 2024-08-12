require('dotenv').config();  // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const licenseRoutes = require('./routes/license');
const ordersRouter = require('./routes/orders');
const digitalHaRouter = require('./routes/digitalHa');
const uploadPhotoRouter = require('./routes/uploadPhoto');

const app = express();


app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.PRO_URL,
      process.env.DEV_URL,
      '*'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS policy'));
    }
  }
}));

// Configure body-parser with a larger limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Main app database connection
mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to main MongoDB'))
  .catch(err => console.error('Could not connect to main MongoDB', err));



// Routes
app.use('/api2', authRoutes);
app.use('/api2', userRoutes);
app.use('/api2', licenseRoutes);
app.use('/api2', ordersRouter);
app.use('/api2', digitalHaRouter);
app.use('/api2', uploadPhotoRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;