const mongoose = require('mongoose');
const auftragDB = mongoose.createConnection(process.env.auftragDB);

const posDataSchema = new mongoose.Schema({
  pos: Number,
  rohwarepackmittel_artnr: String,
  rohwarepackmittel_bezeichnung: String,
  rohwarepackmittel_charge: String,
  editorContent: String,
});

const destructionProtocolEntrySchema = new mongoose.Schema({
  articleNr: String,
  description: String,
  charge: String,
  printNo: String,
  mhd: String,
});

const collectedDataSchema = new mongoose.Schema({
  orderNumber: String,
  selectedId: { type: String, unique: true },
  selectedFpartnr: String,
  selectedPositions: [Number],
  posData: [posDataSchema],
  packagingInstructions: String,
  destructionProtocolEntries: [destructionProtocolEntrySchema],
  corrected: Boolean,
  Status: { type: String },
  Comment: String,
  CreatedAt: Date,
  Creator: String,
  ApprovedAt: Date,
  Approver: String,
});

const CollectedData =auftragDB.model('CollectedData', collectedDataSchema);

module.exports = CollectedData;
