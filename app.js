const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const parkingRoutes = require('./src/routes/parkingRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', parkingRoutes);

app.use(errorHandler);

module.exports = app;