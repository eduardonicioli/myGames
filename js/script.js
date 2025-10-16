// --- Variáveis Globais (DOM e Dados) ---
const gameForm = document.getElementById('game-form');
const gamesListBody = document.getElementById('games-list-body');
const gamesModal = document.getElementById('gamesModal');

// Elementos de Filtro (NOVOS)
const filterNameInput = document.getElementById('filter-name');
const filterPlatformSelect = document.getElementById('filter-platform');

// Carrega os jogos do LocalStorage ou inicia uma array vazia
let games = loadGames(); 

// --- 1. Manipulação de Dados (LocalStorage) ---

function loadGames() {
    try {
        const storedGames = localStorage.getItem('gamesList');
        return storedGames ? JSON.parse(storedGames) : [];
    } catch (e) {
        console.error("Erro ao carregar jogos do LocalStorage:", e);
        return [];
    }
}

function saveGames() {
    localStorage.setItem('gamesList', JSON.stringify(games));
}

// --- 2. Lógica de Filtro (NOVO) ---

/**
 * Filtra a lista de jogos com base nos valores dos campos de busca.
 * @returns {Array} A lista de jogos filtrada.
 */
function getFilteredGames() {
    const nameQuery = filterNameInput.value.toLowerCase();
    const platformQuery = filterPlatformSelect.value;
    
    // Se não houver filtros, retorna a lista completa
    if (!nameQuery && !platformQuery) {
        return games;
    }

    return games.filter(game => {
        const matchesName = nameQuery ? game.name.toLowerCase().includes(nameQuery) : true;
        const matchesPlatform = platformQuery ? game.platform === platformQuery : true;

        return matchesName && matchesPlatform;
    });
}

// --- 3. Renderização da Lista e Ações ---

function createGameRowHTML(game, index) {
    const progressColor = game.progress == 100 ? 'bg-success' : 'bg-warning text-dark';
    const progressLabel = `Progresso ${game.progress}%`;

    return `
        <tr id="row-${index}">
            <th scope="row">${index + 1}</th>
            <td>${game.name}</td>
            <td class="text-center">${game.year}</td>
            <td class="text-center">${game.platform}</td>
            <td class="text-center">${game.genre}</td>
            <td class="text-center">
                <div class="progress" role="progressbar" aria-label="${progressLabel}" aria-valuenow="${game.progress}" aria-valuemin="0" aria-valuemax="100" style="height: 20px;">
                    <div class="progress-bar ${progressColor}" style="width: ${game.progress}%">${game.progress}%</div>
                </div>
            </td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-outline-info me-2" onclick="editGameProgress(${index})">
                    Editar %
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="removeGame(${index})">
                    Remover
                </button>
            </td>
        </tr>
    `;
}

/**
 * Renderiza a lista de jogos, usando a lista filtrada.
 */
function renderGamesList() {
    const listToRender = getFilteredGames(); // Usa a lista filtrada!
    gamesListBody.innerHTML = '';

    if (listToRender.length === 0) {
        gamesListBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Nenhum jogo encontrado com os filtros atuais.</td></tr>';
        return;
    }
    
    const rowsHTML = listToRender.map((game, index) => createGameRowHTML(game, games.indexOf(game))).join('');
    gamesListBody.innerHTML = rowsHTML;
}

// --- 4. Funções de Ação (Mantidas) ---

window.editGameProgress = function(index) {
    const game = games[index];
    const newProgress = prompt(`Atualizar progresso de "${game.name}":\nInsira a nova porcentagem (0 a 100):`, game.progress);

    if (newProgress !== null) {
        const progressValue = parseInt(newProgress);
        
        if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
            alert("Valor inválido. Insira um número entre 0 e 100.");
            return;
        }

        game.progress = progressValue;
        saveGames();
        renderGamesList(); // Renderiza com filtro aplicado
        
        const row = document.getElementById(`row-${index}`);
        if (row) {
             row.style.backgroundColor = '#d4edda';
             setTimeout(() => {
                 row.style.backgroundColor = ''; 
             }, 1000);
        }
    }
}

window.removeGame = function(index) {
    if (confirm(`Tem certeza que deseja remover o jogo "${games[index].name}"?`)) {
        games.splice(index, 1);
        saveGames();
        renderGamesList(); // Renderiza com filtro aplicado
    }
}

// --- 5. Event Listeners ---

// 1. Envio do Formulário (Registro)
gameForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(gameForm);
    
    const newGame = {
        name: formData.get('name'),
        year: formData.get('year'),
        platform: formData.get('platform'),
        genre: formData.get('genre'),
        progress: formData.get('progress')
    };
    
    games.push(newGame);
    saveGames();

    gameForm.reset();
    document.getElementById('progress-output').value = '100%'; 

    // Limpa os filtros ao registrar um novo jogo para evitar confusão
    filterNameInput.value = '';
    filterPlatformSelect.value = '';

    const modalInstance = bootstrap.Modal.getOrCreateInstance(gamesModal);
    modalInstance.show();
});

// 2. Abertura do Modal: Renderiza a lista completa (sem filtros)
gamesModal.addEventListener('show.bs.modal', renderGamesList);

// 3. Aplicação dos Filtros (NOVOS EVENTOS)
// Dispara a renderização sempre que o texto muda
filterNameInput.addEventListener('input', renderGamesList);
// Dispara a renderização sempre que a seleção muda
filterPlatformSelect.addEventListener('change', renderGamesList);