'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('vitamins/replaceTemplate.js');

const tempCatalogue = fs.readFileSync(`vitamins/catalogue.html`, 'utf-8');
const tempCard = fs.readFileSync(`vitamins/template-card.html`, 'utf-8');

const data = fs.readFileSync(`vitamins/vitamins-data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => ({
  ...el,
  slug: slugify(el.vitamin, { lower: true }),
}));
