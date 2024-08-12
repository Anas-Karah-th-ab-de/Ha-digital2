const mongoose = require('mongoose');
const Produktionplanen= mongoose.createConnection(process.env.ProduktionConnection);

// Definiere das Schema für die Schritte
const schrittSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  },
  hasDropdown: {
    type: Boolean,
    default: false
  },
  dropdownOptions: {
    type: [String],
    default: []
  },
  hasInput: {
    type: Boolean,
    default: false
  }
});

// Erstelle das Modell
const Schritt = Produktionplanen.model('Schritt', schrittSchema);

// Exportiere das Modell
module.exports = Schritt;
