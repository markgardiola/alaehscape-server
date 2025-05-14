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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', resortRoutes);
app.use('/api', bookingRoutes);


app.listen(port, () => console.log(`Server running on port ${port}`));
