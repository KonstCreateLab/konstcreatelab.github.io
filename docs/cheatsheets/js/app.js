document.addEventListener('DOMContentLoaded', function() {
    const cheatsheetsContainer = document.getElementById('cheatsheetsContainer');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const totalCountEl = document.getElementById('totalCount');
    const filteredCountEl = document.getElementById('filteredCount');

    let allCheatsheets = [];
    let filteredCheatsheets = [];

    // Загружаем данные
    fetch('data/cheatsheets.json')
        .then(response => response.json())
        .then(data => {
            allCheatsheets = data;
            filteredCheatsheets = [...allCheatsheets];
            totalCountEl.textContent = allCheatsheets.length;
            renderCheatsheets();
        })
        .catch(error => {
            console.error('Ошибка загрузки шпаргалок:', error);
            cheatsheetsContainer.innerHTML = '<p class="error">Не удалось загрузить базу данных. Проверьте консоль.</p>';
        });

    // Рендер списка
    function renderCheatsheets() {
        cheatsheetsContainer.innerHTML = '';
        filteredCountEl.textContent = filteredCheatsheets.length;

        filteredCheatsheets.forEach(item => {
            const card = document.createElement('div');
            card.className = 'cheatsheet-card';
            card.setAttribute('data-id', item.id);

            card.innerHTML = `
                <h3>${item.title}</h3>
                <div class="meta">
                    <span class="category">${item.category}</span>
                    <span class="difficulty ${item.difficulty}">${item.difficulty}</span>
                </div>
                <p class="description">${item.description}</p>
                <div class="tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="locked">
                    <i class="fas fa-lock"></i> Содержимое заблокировано
                </div>
            `;

            card.addEventListener('click', () => {
                window.location.href = `view.html?id=${item.id}`;
            });

            cheatsheetsContainer.appendChild(card);
        });
    }

    // Функция фильтрации
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedDifficulty = difficultyFilter.value;

        filteredCheatsheets = allCheatsheets.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm) ||
                                 item.description.toLowerCase().includes(searchTerm) ||
                                 item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const matchesCategory = !selectedCategory || item.category === selectedCategory;
            const matchesDifficulty = !selectedDifficulty || item.difficulty === selectedDifficulty;

            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        renderCheatsheets();
    }

    // События
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    categoryFilter.addEventListener('change', applyFilters);
    difficultyFilter.addEventListener('change', applyFilters);

    // Инициализация
    applyFilters();
});
