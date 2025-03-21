'use strict';

// vitamins/replaceTemplate.js
const replaceTemplate = (template, vitamin) => {
  let output = template.replace(/{%VITAMIN_NAME%}/g, vitamin.name);
  output = output.replace(/{%VITAMIN_DESCRIPTION%}/g, vitamin.description);
  output = output.replace(/{%VITAMIN_IMAGE%}/g, vitamin.imageUrl);
  output = output.replace(/{%VITAMIN_ID%}/g, vitamin.id);

  return output;
};

module.exports = replaceTemplate;
