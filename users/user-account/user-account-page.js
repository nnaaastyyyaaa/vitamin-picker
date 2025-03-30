const API = 'http://localhost:3000/api/profile';
async function loadProfile() {
  try {
    const response = await fetch(API, {
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
    } else {
      throw new Error(responseJson.message);
    }
  } catch (err) {
    document.querySelector('.title').textContent = err.message;
  }
}
document.addEventListener('DOMContentLoaded', loadProfile);
