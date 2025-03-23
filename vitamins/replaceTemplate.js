'use strict';

const fs = require('fs');
const path = require('path');

export function replaceTemplate(template, vitamin) {
  let output = template.replace(/{%VITAMIN_NAME%}/g, vitamin.name);
  output = output.replace(/{%VITAMIN_DESCRIPTION%}/g, vitamin.description);
  output = output.replace(/{%VITAMIN_ID%}/g, vitamin.id);

  return output;
}

export function tempCard() {
  fs.readFileSync(path.join(__dirname, '/template-card.html'), 'utf-8');
}
export function tempOverview() {
  fs.readFileSync(path.join(__dirname, '/catalogue.html'), 'utf-8');
}
