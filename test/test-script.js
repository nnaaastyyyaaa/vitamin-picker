async function submitTest() {
  const selectedSymptoms = Array.from(
    document.querySelectorAll('input[name="symptom"]:checked'),
  ).map((checkbox) => checkbox.value);

  const response = await fetch('http://localhost:3000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: selectedSymptoms }),
  });

  const result = await response.json();
  document.getElementById('result').innerText = result.recommendation;
}
