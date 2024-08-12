// models/Platz.js
const mongoose = require('mongoose');
const Produktionplanen= mongoose.createConnection(process.env.ProduktionConnection);

const DruckmethodeSchema = new mongoose.Schema({
    name: String,
    id:Number
    // Weitere Eigenschaften
  });
  
  module.exports = Produktionplanen.model('Druckmethode', DruckmethodeSchema);