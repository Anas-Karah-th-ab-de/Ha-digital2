const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    required: true
  },
  licenseExpiryDate: {
    type: Date,
    required: true
  }
});

const License = mongoose.model('License', licenseSchema);

module.exports = License;
