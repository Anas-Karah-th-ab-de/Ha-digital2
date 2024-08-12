const mongoose = require('mongoose');
const auftragDB = mongoose.createConnection(process.env.auftragDB);


const orderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  auftragsnr: String,
  darreichungsform: String,
  fpartnr: String,
  fpartnr_extern: String,
  fpbezeichnung: String,
  kunde: String,
  kundenbestellnummer: String,
  pos: Number,
  pp_blflfs: String,
  rohwareartnralternativ: String,
  rohwarepackmittel_artnr: String,
  rohwarepackmittel_bezeichnung: String,
  rohwarepackmittel_charge: String,
  sollmenge: String,
  status: String,
  wacharge: String,
  we_menge: String,
  gtin: String,
  land: String,
  temperatur: String,
});

const Order = auftragDB.model('Order', orderSchema, 'auftrags');

module.exports = Order;
