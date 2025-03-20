const express = require('express');
const { createUser } = require('../users/userControler');
const { checkUser } = require('../users/userControler');
const { resetPassword } = require('../users/userControler');
const { forgotPassword } = require('../users/userControler');
const { getResetPage } = require('../users/userControler');

const router = express.Router();

router.post('/login', createUser);
router.post('/sign-in', checkUser);
router.post('/forget', forgotPassword);
router.patch('/reset/:token', resetPassword);
router.get('/reset/:token', getResetPage);

module.exports = router;
