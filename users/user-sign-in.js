'use strict';

const labelLogin = document.querySelector('.login');
const labelPassword = document.querySelector('.password');
const signIn = document.querySelector('.button-sign-in');

const API = 'http://localhost:3000/api/sign-in';

signIn.addEventListener('click', async (e) => {
  e.preventDefault();

  const login = labelLogin.value;
  const password = labelPassword.value;

  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password }),
    });

    if (response.ok) {
      setTimeout(
        () => (window.location.href = './user-account-page.html'),
        1000,
      );
    }
  } catch (err) {
    console.log('Error!');
  }
});
