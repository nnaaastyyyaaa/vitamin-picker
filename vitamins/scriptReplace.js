import { replaceTemplate } from './replaceTemplate.js';
import { tempCard } from './replaceTemplate.js';
import { tempOverview } from './replaceTemplate.js';

const API = 'http://localhost:3000/catalogue/vitamins';

async function getAllVitamins() {
  try {
    const response = await fetch(API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  } catch (err) {
    console.error('Помилка запиту:', err.message);
  }
}

(async () => {
  const vitamins = await getAllVitamins();
  const cardsHtml = vitamins
    .map((el) => replaceTemplate(tempCard, el))
    .join('');
  const output = tempOverview.replace('{%VITAMIN_CARDS%}', cardsHtml);

  document.getElementById('cards-container').innerHTML = output;
})();
