'use strict';

const labeleMail = document.querySelector('.e-mail');
const labelUsername = document.querySelector('.username');
const labelPassword1 = document.querySelector('.password1');
const labelPassword2 = document.querySelector('.password2');
const labelMessage1 = document.querySelector('.message2');
const labelMessage2 = document.querySelector('.message1');
const btnCreate = document.querySelector('.button-create-profile');
const btnVisible = document.querySelectorAll('#togglePassword');

const API = 'http://localhost:3000/api/login';

btnCreate.addEventListener('click', async (e) => {
  e.preventDefault();
  const eMail = labeleMail.value;
  const username = labelUsername.value;
  const password = labelPassword1.value;
  const password1 = labelPassword2.value;
  if (password === password1) {
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eMail, username, password }),
      });

      if (response.ok) {
        labelMessage1.textContent = 'Successfully registered!';
        labeleMail.value = '';
        labelUsername.value = '';
        labelPassword1.value = '';
        labelPassword2.value = '';
        setTimeout(() => {
          labelMessage1.textContent = '';
        }, 4000);
      }
    } catch (err) {
      console.log('Error!');
    }
  } else {
    labelMessage2.textContent = 'Passwords should be identical!';
    setTimeout(() => {
      labelMessage2.textContent = '';
    }, 4000);
  }
});

btnVisible.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (index === 0) {
      labelPassword1.type === 'password'
        ? (labelPassword1.type = 'text')
        : (labelPassword1.type = 'password');
    } else {
      labelPassword2.type === 'password'
        ? (labelPassword2.type = 'text')
        : (labelPassword2.type = 'password');
    }
  });
});
