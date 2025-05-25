'use strict';

async function loadSymptoms() {
  const res = await fetch('http://localhost:3000/test/symptoms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const data = await res.json();

  if (data.status !== 'success') {
    document.getElementById('test-form').innerHTML =
      '<p>Failed to load symptoms</p>';
    return;
  }

  const symptoms = data.data.symptoms;

  const html = symptoms
    .map(
      (symptom) => `
        <label>
          <input type="checkbox" name="symptom" value="${symptom._id}" />
          ${symptom.description}
        </label><br />
      `,
    )
    .join('');

  document.getElementById('symptom-list').innerHTML = html;
}

window.addEventListener('DOMContentLoaded', loadSymptoms);
