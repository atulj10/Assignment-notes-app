require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const miscRoutes = require('./routes/misc.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { detail: 'Too many requests, please try again later' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api', miscRoutes);

app.use(errorHandler);

module.exports = app;
