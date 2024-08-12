
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  firstname: String,  // Neu
  lastname: String,   // Neu
    username: String,
    Sollstunde: String,
    loginToken: String,
tokenExpiration: Date,
    password: {
        type: String,
        encrypt: true  // Dieses Feld wird verschlüsselt
      },
    email: String,
    role: String
});
module.exports = mongoose.model('User', UserSchema);
