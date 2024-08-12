// models/Platz.js
const mongoose = require('mongoose');
const Produktionplanen= mongoose.createConnection(process.env.ProduktionConnection);

  const referenceWeightSchema = new mongoose.Schema({
    weight: Number,
    // other fields if necessary
  });
  

  
  module.exports = Produktionplanen.model('ReferenceWeight', referenceWeightSchema);