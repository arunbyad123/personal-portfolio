const mongoose = require('mongoose');

const contactFormSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

module.exports = mongoose.model('ContactForm', contactFormSchema);
