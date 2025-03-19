'use strict';

const bcrypt = require('bcryptjs');
const User = require('./userSchema');
exports.createUser = async (req, res) => {
  try {
    const { username, eMail, password, passwordRepeat } = req.body;
    const strPassword = String(password);
    const strPasswordRepeat = String(passwordRepeat);
    const newUser = await User.create({
      username,
      eMail,
      password: strPassword,
      passwordRepeat: strPasswordRepeat,
    });
    res.status(201).json({ message: 'New user succesfully created' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      const key = Object.keys(err.keyValue);
      const value = Object.values(err.keyValue);
      return res.status(400).json({
        message: `Field "${key}" with value "${value}" already exists. Please use another value`,
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((el) => el.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res
      .status(500)
      .json({ message: 'Error creating user', error: err.message });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: 'Please fill both fields' });
    }

    const user = await User.findOne({ eMail: login });
    const strPassword = String(password);

    if (!user || !(await user.checkPassword(strPassword, user.password))) {
      return res.status(404).json({ message: 'Invalid login or password!' });
    }

    res.status(200).json({ message: 'Successfuly!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { eMail, username, password } = req.body;
    const strPassword = String(password);
    const hashedPassword = await bcrypt.hash(strPassword, 10);
    const user = await User.findOneAndUpdate(
      { eMail, username },
      { password: hashedPassword },
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(404).json({
        message: 'Any user found with this email and username',
      });
    }
    res.status(200).json({ message: 'Successfuly!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
