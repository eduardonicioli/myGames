// --- Variáveis Globais (DOM e Dados) ---
const gameForm = document.getElementById('game-form');
const gamesListBody = document.getElementById('games-list-body');
const gamesModal = document.getElementById('gamesModal');

// Carrega os jogos do LocalStorage ou inicia uma array vazia
let games = loadGames(); 

// --- Funções de Manipulação de Dados (LocalStorage) ---

/**
 * Carrega a lista de jogos do LocalStorage.
 */
function loadGames() {
    try {
        const storedGames = localStorage.getItem('gamesList');
        return storedGames ? JSON.parse(storedGames) : [];
    } catch (e) {
        console.error("Erro ao carregar jogos do LocalStorage:", e);
        return [];
    }
}

/**
 * Salva a lista de jogos no LocalStorage.
 */
function saveGames() {
    localStorage.setItem('gamesList', JSON.stringify(games));
}

// --- Funções de Renderização (DOM) ---

/**
 * Gera o HTML para uma única linha da tabela, incluindo os botões de Ação.
 * @param {Object} game - O objeto do jogo.
 * @param {number} index - O índice do jogo na array.
 * @returns {string} O HTML da linha (<tr>).
 */
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
 * Renderiza a lista completa de jogos na tabela do modal.
 */
function renderGamesList() {
    gamesListBody.innerHTML = ''; // Limpa o corpo da tabela

    if (games.length === 0) {
        gamesListBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Ainda não há jogos registrados.</td></tr>';
        return;
    }

    const rowsHTML = games.map(createGameRowHTML).join('');
    gamesListBody.innerHTML = rowsHTML;
}

// --- Funções de Ação ---

/**
 * Permite ao usuário editar a porcentagem de progresso de um jogo.
 * Usamos um simples 'prompt' por enquanto para não introduzir outro modal.
 * @param {number} index - O índice do jogo a ser editado.
 */
window.editGameProgress = function(index) {
    const game = games[index];
    
    // Solicita o novo valor de porcentagem ao usuário
    const newProgress = prompt(`Atualizar progresso de "${game.name}":\nInsira a nova porcentagem (0 a 100):`, game.progress);

    // Validação da entrada
    if (newProgress !== null) {
        const progressValue = parseInt(newProgress);
        
        if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
            alert("Valor inválido. Insira um número entre 0 e 100.");
            return;
        }

        // Atualiza o objeto, salva e renderiza
        game.progress = progressValue;
        saveGames();
        renderGamesList();
        
        // Opcional: Efeito visual rápido para mostrar a linha atualizada
        const row = document.getElementById(`row-${index}`);
        if (row) {
             row.style.backgroundColor = '#d4edda'; // Verde claro para sucesso
             setTimeout(() => {
                 row.style.backgroundColor = ''; // Remove o destaque após um tempo
             }, 1000);
        }
    }
}

/**
 * Remove um jogo da lista e atualiza o estado.
 * @param {number} index - O índice do jogo a ser removido.
 */
window.removeGame = function(index) {
    if (confirm(`Tem certeza que deseja remover o jogo "${games[index].name}"?`)) {
        games.splice(index, 1);
        saveGames();
        renderGamesList();
    }
}

// --- Event Listeners ---

// 1. Envio do Formulário
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

    const modalInstance = bootstrap.Modal.getOrCreateInstance(gamesModal);
    modalInstance.show();
});

// 2. Abertura do Modal: Garante que a lista seja carregada sempre que o modal for exibido.
gamesModal.addEventListener('show.bs.modal', renderGamesList);