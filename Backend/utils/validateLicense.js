const jwt = require('jsonwebtoken');
const config = require('../config');

function validateLicenseKey(licenseKey) {
  try {
    const decodedData = jwt.verify(licenseKey, config.SECRET_KEY, { algorithms: ['HS256'] });
    const expiryDate = new Date(decodedData.exp * 1000);

    if (decodedData.exp < Date.now() / 1000) {
      return { isValid: false, message: 'Lizenzschlüssel ist abgelaufen', expiryDate };
    }

    return { isValid: true, expiryDate };
  } catch (e) {
    return { isValid: false, message: 'Ungültiger Lizenzschlüssel' };
  }
}

module.exports = { validateLicenseKey };
