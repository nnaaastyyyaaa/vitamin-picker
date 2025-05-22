async function submitTest() {
  const selectedSymptoms = Array.from(
    document.querySelectorAll('input[name="symptom"]:checked'),
  ).map((checkbox) => checkbox.value);

  const response = await fetch('http://localhost:3000/test/analyze', {
    method: 'POST',
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
    const vitaminNames = result.data.map((v) => v.name).join(', ');
    resultEl.innerHTML = `<h3> Recommended vitamins: </h3> <p> ${vitaminNames} </p>`;
  } else {
    resultEl.innerText = result.message || 'No recommendations found.';
  }
}
