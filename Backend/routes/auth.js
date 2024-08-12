const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const config = require('../config');
const Role=require('../models/role')
const router = express.Router();

mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const userRole = user.role || 'dashboard';
      const accessToken = jwt.sign({ _id: user._id, username: user.username, role: userRole }, config.JWT_SECRET);
      res.json({ accessToken, role: userRole });
    } else {
      res.status(401).send('Login failed');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});
router.get('/roles', async (req, res) => {
  try {
      const roles = await Role.find({});
      //console.log(roles)
      res.json(roles);
  } catch (err) {
      res.status(500).send({ error: "Fehler beim Abrufen von Rollen" });
  }
});
router.post('/generateToken', async (req, res) => {
  const email = req.body.email;
  const token = crypto.randomBytes(20).toString('hex');
  const updatedUser = await User.findOneAndUpdate({ email: email }, { loginToken: token, tokenExpiration: Date.now() + 3600000 }, { new: true });

  if (!updatedUser) {
    return res.status(400).send('Kein Benutzer mit dieser E-Mail gefunden');
  }

  const transporter = nodemailer.createTransport({
    host:  process.env.nodemailer_IP,
    port: process.env.nodemailer_PORT,
    secure: false,
    auth: null
  });

  const mailOptions = {
    from:  process.env.MAIL_LOGIN_TOKIN,
    to: email,
    subject: 'Ihr Login-Link',
    text: `Bitte klicken Sie auf den folgenden Link, um sich anzumelden: ${process.env.PRO_URL}/login/${token}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      res.status(500).send('Error sending email');
    } else {
      res.send('Login link sent');
    }
  });
});

router.get('/login/:token', async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    loginToken: token,
    tokenExpiration: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Ungültiger oder abgelaufener Token'
    });
  }

  user.loginToken = undefined;
  user.tokenExpiration = undefined;
  await user.save();

  if (user) {
    const accessToken = jwt.sign({ _id: user._id, username: user.username, role: user.role }, config.JWT_SECRET);
    res.json({ accessToken, role: user.role });
    res.status(200);
  } else {
    res.status(401).send('Login failed');
  }
});

module.exports = router;
