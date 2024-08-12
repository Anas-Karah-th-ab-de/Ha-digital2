// models/Platz.js
const mongoose = require('mongoose');
const Produktionplanen= mongoose.createConnection(process.env.ProduktionConnection);

const raumSchema = new mongoose.Schema({
    name: String,
    id:Number
    // Weitere Eigenschaften
  });
  
  module.exports = Produktionplanen.model('Raum', raumSchema);