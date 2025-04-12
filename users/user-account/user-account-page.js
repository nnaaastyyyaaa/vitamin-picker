const btnExit = document.querySelector('.exit--btn');
const labelMessage = document.querySelector('.message1');
const API1 = 'http://localhost:3000/api/profile';
const API2 = 'http://localhost:3000/api/exit';

async function loadProfile() {
  try {
    const response = await fetch(API1, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const responseJson = await response.json();
    if (response.ok) {
      document.querySelector(
        '.title',
      ).textContent = `${responseJson.name}'s account`;
    } else {
      throw new Error(responseJson.message);
    }
  } catch (err) {
    document.querySelector('.title').textContent = err.message;
  }
}
document.addEventListener('DOMContentLoaded', loadProfile);

btnExit.addEventListener('click', async () => {
  try {
    const response = await fetch(API2, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const responseJson = await response.json();
    if (response.ok) {
      setTimeout(
        () => (window.location.href = '../../vitamins/catalogue.html'),
        1000,
      );
    } else {
      throw new Error(responseJson.message);
    }
  } catch (err) {
    labelMessage.textContent = err.message;
  }
});
