document.addEventListener('DOMContentLoaded', function () {
  fetch('../main/nav.html')
    .then((response) => response.text()) // Отримуємо текст HTML-файлу
    .then((data) => {
      document.getElementById('nav-container').innerHTML = data; // Вставляємо в контейнер
    })
    .catch((error) => console.error('Помилка завантаження меню:', error));
});
