const labelEmail = document.querySelector('.login');
const labelMessage = document.querySelector('.message1');
const btnGet = document.querySelector('.button-get');

const API = 'http://localhost:3000/api/forget';
btnGet.addEventListener('click', async (e) => {
  e.preventDefault();

  try {
    const eMail = labelEmail.value;
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eMail }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message);
    }
    labelMessage.textContent = responseJson.message;
  } catch (err) {
    labelMessage.textContent = err.message;
  }
});
