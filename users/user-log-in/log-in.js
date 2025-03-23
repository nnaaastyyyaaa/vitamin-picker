'use strict';

const labelLogin = document.querySelector('.login');
const labelPassword = document.querySelector('.password');
const labelMessage = document.querySelector('.message1');
const signIn = document.querySelector('.main--btn');

const API = 'http://localhost:3000/api/sign-in';

signIn.addEventListener('click', async (e) => {
  e.preventDefault();

  const login = labelLogin.value;
  const password = labelPassword.value;

  try {
    const response = await fetch(API, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password }),
    });

    const jsonResponse = await response.json();

    if (response.ok) {
      localStorage.setItem('token', jsonResponse.token);
      setTimeout(
        () => (window.location.href = '../user-account/user-account-page.html'),
        1000,
      );
    } else {
      throw new Error(jsonResponse.message);
    }
  } catch (err) {
    labelMessage.textContent = err.message;
    labelLogin.value = '';
    labelPassword.value = '';
    setTimeout(() => {
      labelMessage.textContent = '';
    }, 4000);
  }
});
