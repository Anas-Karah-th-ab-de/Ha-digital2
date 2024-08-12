// models/CollectedData.js
const mongoose = require('mongoose');

const collectedDataSchema = new mongoose.Schema({
    type: String,
    data: mongoose.Schema.Types.Mixed  // Für flexiblen Datentyp
});

const CollectedData = mongoose.model('CollectedData', collectedDataSchema);

module.exports = CollectedData;
