const API = 'http://localhost:3000/catalogue/vitamins/html';

async function getAllVitamins() {
  try {
    const response = await fetch(API, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html',
      },
    });

    const html = await response.text();
    document.querySelector('.cards-container').innerHTML = html;
    if (!response.ok) {
      throw new Error('Couldn`t load html');
    }
  } catch (err) {
    console.error('Помилка запиту:', err.message);
  }
}
document.addEventListener('DOMContentLoaded', getAllVitamins);
