'use strict';

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const usersRouts = require('./routs/usersRouts');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD);
mongoose.connect(DB).then(() => {
  console.log('DB connection succesful');
});

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', usersRouts);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Listening requests...');
});
