const testBox = document.querySelector('.test-box');
const saveButton =
  '<button type="button" onclick="saveResult()"> Save results</button>';
let vitaminNames;
async function submitTest() {
  const selectedSymptoms = Array.from(
    document.querySelectorAll('input[name="symptom"]:checked'),
  ).map((checkbox) => checkbox.value);

  const response = await fetch('http://localhost:3000/test/analyze', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: selectedSymptoms }),
  });

  const result = await response.json();
  console.log(result);

  const resultEl = document.getElementById('result');

  if (
    result.status === 'success' &&
    Array.isArray(result.data) &&
    result.data.length > 0
  ) {
    vitaminNames = result.data.map((v) => v.name);
    const listItems = vitaminNames.map((name) => `<li>${name}</li>`).join('');
    resultEl.innerHTML = `<h3>Recommended vitamins:</h3><ul>${listItems}</ul>`;
    resultEl.insertAdjacentHTML('beforeend', saveButton);
  } else {
    resultEl.innerText = result.message || 'No recommendations found.';
  }
}

async function saveResult() {
  const resultEl = document.getElementById('result');
  try {
    const res = await fetch('http://localhost:3000/api/save-result', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vitaminNames }),
    });
    console.log(res);
    const resJson = await res.json();
    console.log(resJson);
    if (res.ok) {
      resultEl.innerHTML = `<h3> ${resJson.message}</h3>`;
    } else {
      throw new Error(resJson.message);
    }
  } catch (err) {
    resultEl.innerHTML = `<h3>${err.message}</h3>`;
  }
}
