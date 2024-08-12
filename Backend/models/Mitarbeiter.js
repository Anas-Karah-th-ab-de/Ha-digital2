const mongoose = require('mongoose');
const Produktionplanen= mongoose.createConnection(process.env.ProduktionConnection);

const MitarbeiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quali: {
    type: String,
    
  },
  leasing:String,
  MitarbeiterNummer: {
    type: Number,
    required: true
  },
  ZV:String
});

module.exports = Produktionplanen.model('Mitarbeiter', MitarbeiterSchema);
