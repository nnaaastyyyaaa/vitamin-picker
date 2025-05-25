const btnExit = document.querySelector('.exit--btn');
const btnUsers = document.querySelector('.users--btn');
const btnClose = document.querySelector('.close--btn');
const resultContainer = document.querySelector('.result-container');
const btnShow = document.querySelector('.show--btn')
const table = document.querySelector('.users--table');
const body = table.querySelector('tbody');
const labelMessage = document.querySelector('.message1');
const API1 = 'http://localhost:3000/api/profile';
const API2 = 'http://localhost:3000/api/exit';
const API3 = 'http://localhost:3000/api/getAllUsers';
const API4 = 'http://localhost:3000/api/get-results';

document.addEventListener('DOMContentLoaded', async () => {
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
      if (responseJson.role === 'admin') {
        btnUsers.style.display = 'inline-block';
      }
    } else {
      throw new Error(responseJson.message);
    }
  } catch (err) {
    document.querySelector('.title').textContent = err.message;
  }
});

btnUsers.addEventListener('click', async () => {
  try {
    const response = await fetch(API3, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    btnClose.style.display = 'inline-block';
    btnUsers.style.display = 'none';
    table.style.display = 'table';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        try {
          const user = JSON.parse(line);
          const row = document.createElement('tr');
          row.innerHTML = `<td style="border: 1px solid #000; padding: 5px;">${
            user.username
          }</td>
      <td style="border: 1px solid #000; padding: 5px;">${user.eMail}</td>
      <td style="border: 1px solid #000; padding: 5px;">${new Date(
        user.createdAt,
      ).toLocaleString()}</td>`;
          body.appendChild(row);
        } catch (err) {
          labelMessage.textContent = err.message;
        }
      }
    }
  } catch (err) {
    labelMessage.textContent = err.message;
  }
});

btnClose.addEventListener('click', () => {
  btnClose.style.display = 'none';
  btnUsers.style.display = 'inline-block';
  table.style.display = 'none';
  body.textContent = '';
});

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

btnShow.addEventListener('click', async () => {
  try{
    const res = await fetch(API4, {
      method:'GET',
      credentials:'include',
      headers:{
        'Content-Type':'application/json'
      }
    })
    const resJ = await res.json();
    const results = resJ.message.results

    if (!results || results.length === 0) {
      resultContainer.innerHTML = '<p>No results found.</p>';
      return;
    }

    results.forEach(result => {
      const vitamins = result.recomendedVitamins.join(', ');
      const created = new Date(result.date).toLocaleString();
      const resultHTML = `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
          <p><strong>Recommended Vitamins:</strong> ${vitamins}</p>
          <p><strong>Date:</strong> ${created}</p>
        </div>
      `;
      resultContainer.insertAdjacentHTML('beforeend', resultHTML);
    });
  }catch(err){
    labelMessage.textContent = err.message;
  }
})