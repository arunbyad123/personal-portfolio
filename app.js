const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const ContactForm = require('./models/ContactForm');

dotenv.config(); // Load email credentials from .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files like index.html

// Connect to MongoDB (replace URL with your own if using MongoDB Atlas)
mongoose.connect('mongodb://localhost:27017/contactDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle form submission
app.post('/submit-form', (req, res) => {
  const { name, email, message } = req.body;

  // Save to MongoDB
  const contact = new ContactForm({ name, email, message });
  contact.save()
    .then(() => {
      // Prepare the email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Contact Form Submission',
        text: `New message from ${name} (${email}):\n\n${message}`,
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email error:', error);
          return res.status(500).send('Failed to send email');
        }
        console.log('Email sent:', info.response);
        res.send('Form submitted successfully!');
      });
    })
    .catch(err => {
      console.error('DB save error:', err);
      res.status(500).send('Failed to save form data');
    });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
