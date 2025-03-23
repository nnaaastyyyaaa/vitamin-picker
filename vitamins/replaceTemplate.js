'use strict';

const fs = require('fs');
const path = require('path');

function replaceTemplate(template, vitamin) {
  let output = template.replace(/{%VITAMIN_NAME%}/g, vitamin.name);
  output = output.replace(/{%VITAMIN_DESCRIPTION%}/g, vitamin.description);
  return output;
}

const tempCard = fs.readFileSync(
  path.join(__dirname, '/template-card.html'),
  'utf-8',
);

const tempOverview = fs.readFileSync(
  path.join(__dirname, '/catalogue.html'),
  'utf-8',
);

module.exports = { replaceTemplate, tempCard, tempOverview };
