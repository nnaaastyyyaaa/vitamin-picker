'use strict';

const labelLogin = document.querySelector('.login');
const labelPassword = document.querySelector('.password');
const labelMessage = document.querySelector('.message1');
const deleteBtn = document.querySelector('.delete--btn');
const API = 'http://localhost:3000/api/delete';

deleteBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const eMail = labelLogin.value;
  const password = labelPassword.value;
  try {
    const response = await fetch(API, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eMail,
        password,
      }),
    });

    if (response.ok) {
      setTimeout(
        () => (window.location.href = '../../vitamins/catalogue.html'),
        1000,
      );
    } else {
      const responseJson = await response.json();
      throw new Error(responseJson.message);
    }
  } catch (err) {
    labelMessage.textContent = err.message;
  }
});
