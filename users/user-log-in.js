const labeleMail = document.querySelector('.e-mail');
const labelUsername = document.querySelector('.username');
const labelPassword = document.querySelector('.password');
const labelMessage = document.querySelector('.message');
const btnCreate = document.querySelector('.button-create-profile');
const btnVisible = document.getElementById('togglePassword');

const API = 'http://localhost:3000/api/login';

btnCreate.addEventListener('click', async (e) => {
  e.preventDefault();
  const eMail = labeleMail.value;
  const username = labelUsername.value;
  const password = labelPassword.value;

  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eMail, username, password }),
    });

    if (response.ok) {
      labelMessage.textContent = 'Successfully registered!';
      labeleMail.value = '';
      labelUsername.value = '';
      labelPassword.value = '';
    }
  } catch (err) {
    console.log('Error!');
  }
});

btnVisible.addEventListener('click', () => {
  if (labelPassword.type === 'password') {
    labelPassword.type = 'text';
  } else if (labelPassword.type === 'text') {
    labelPassword.type = 'password';
  }
});
