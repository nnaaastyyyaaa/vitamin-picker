document.addEventListener('DOMContentLoaded', function () {
  fetch('../main/nav.html')
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('nav-container').innerHTML = data;
    })
    .catch((error) => console.error('Помилка завантаження меню:', error));
});
