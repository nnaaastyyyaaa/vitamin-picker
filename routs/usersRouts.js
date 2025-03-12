const express = require('express');
const { createUser } = require('../users/userControler');
const { checkUser } = require('../users/userControler');
const { resetPassword } = require('../users/userControler');

const router = express.Router();

router.post('/login', createUser);
router.post('/sign-in', checkUser);
router.patch('/reset', resetPassword);

module.exports = router;
