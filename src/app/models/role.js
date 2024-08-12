const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    rights: {
        type: [String], // Array von Strings
        default: []     // Default-Wert ist ein leeres Array
    }
    // Weitere Felder können hier hinzugefügt werden
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
