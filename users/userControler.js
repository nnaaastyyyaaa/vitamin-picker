const bcrypt = require('bcryptjs');
const User = require('./userSchema');
exports.createUser = async (req, res) => {
  try {
    const { username, eMail, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      eMail,
      password: hashedPassword,
    });
    res.status(201).json({ message: 'New user succesfully created' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error creating user', error: err.message });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({ eMail: login });
    if (!user) {
      return res.status(404).json({
        message: 'Any user found',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    res.status(200).json({ message: 'Successfuly!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
