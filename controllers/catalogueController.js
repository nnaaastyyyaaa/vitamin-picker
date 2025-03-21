const fs = require('fs');
const { validateHeaderName } = require('http');

const vitamins = JSON.parse(fs.readFileSync(`vitamins/vitamins-data.json`));

exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > vitamins.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid id',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({
      status: 'fail',
      message: 'missing name',
    });
  }
  next();
};

exports.getAllVitamins = (req, res) => {
  res.status(200).json({
    status: 'success',
    // to COMPlete
  });
};

exports.getVitamin = (req, res) => {
  const id = req.params.id * 1;

  const vitamin = vitamins.find((el) => el.id === id);

  res.status(201).json({
    status: 'success',
    data: {
      vitamin,
    },
  });
};

exports.createVitamin = (req, res) => {
  const newId = vitamin[vitamins.length - 1].id + 1;
  const newVitamin = Object.assign({ id: newId }, req.body);

  vitamins.push(newVitamin);

  fs.writeFile(
    `vitamins/vitamins-data.json`,
    JSON.stringify(vitamins),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newVitamin,
        },
      });
    },
  );
};

exports.updateVitamin = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      vitamin: '<Updated vitamin here...',
    },
  });
};

exports.deleteVitamin = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
