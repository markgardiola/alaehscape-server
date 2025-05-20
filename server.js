const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resortRoutes = require('./routes/resortRoutes');
const bookingRoutes = require('./routes/bookingRoutes');


const port = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://alaehscape-booking.vercel.app' // your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', resortRoutes);
app.use('/api', bookingRoutes);


app.listen(port, () => console.log(`Server running on port ${port}`));
