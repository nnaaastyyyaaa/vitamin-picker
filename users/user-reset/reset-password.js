'use strict';

const labelNewPassword1 = document.querySelector('.password1');
const labelNewPassword2 = document.querySelector('.password2');
const labelMessage1 = document.querySelector('.message2');
const labelMessage2 = document.querySelector('.message1');
const btnReset = document.querySelector('.button-reset');
const btnVisible = document.querySelectorAll('#togglePassword');

const API = `http://localhost:3000/api/reset/${window.location.pathname
  .split('/')
  .pop()}`;

btnReset.addEventListener('click', async (e) => {
  e.preventDefault();

  const password = labelNewPassword1.value;
  const password1 = labelNewPassword2.value;

  if (password === password1) {
    try {
      const response = await fetch(API, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, password1 }),
      });
      if (response.ok) {
        labelMessage2.textContent = 'Successfully changed your password!';
        labelNewPassword1.value = '';
        labelNewPassword2.value = '';
        setTimeout(() => {
          labelMessage2.textContent = '';
        }, 10000);
      }
    } catch (err) {
      console.log('Error!');
    }
  } else {
    labelMessage1.textContent = 'Passwords should be identical!';
    setTimeout(() => {
      labelMessage1.textContent = '';
    }, 4000);
  }
});

btnVisible.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (index === 0) {
      labelNewPassword1.type === 'password'
        ? (labelNewPassword1.type = 'text')
        : (labelNewPassword1.type = 'password');
    } else {
      labelNewPassword2.type === 'password'
        ? (labelNewPassword2.type = 'text')
        : (labelNewPassword2.type = 'password');
    }
  });
});
