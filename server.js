'use strict';

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const { createUser } = require('./users/userControler');
const { checkUser } = require('./users/userControler');
const { resetPassword } = require('./users/userControler');

dotenv.config({ path: './config.env' });

const router = express.Router();
router.post('/login', createUser);
router.post('/sign-in', checkUser);
router.patch('/reset', resetPassword);

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD);
mongoose.connect(DB).then(() => {
  console.log('DB connection succesful');
});

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Listening requests...');
});
