// Constantes para elementos do DOM
const gameForm = document.getElementById('game-form');
const gamesListBody = document.getElementById('games-list-body');
const gamesModal = document.getElementById('gamesModal');

// Variável para armazenar a lista de jogos, recuperando do LocalStorage ou iniciando vazia
let games = JSON.parse(localStorage.getItem('gamesList')) || [];

/**
 * Função para salvar a lista de jogos no LocalStorage
 */
function saveGames() {
    localStorage.setItem('gamesList', JSON.stringify(games));
}

/**
 * Função para gerar e exibir a lista de jogos dentro do modal
 */
function renderGamesList() {
    // Limpa o corpo da tabela antes de renderizar
    gamesListBody.innerHTML = '';

    if (games.length === 0) {
        // Exibe mensagem se não houver jogos
        gamesListBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Ainda não há jogos registrados.</td></tr>';
        return;
    }

    // Itera sobre a lista de jogos para criar as linhas da tabela
    games.forEach((game, index) => {
        const row = gamesListBody.insertRow();
        
        // Coluna #
        row.insertCell().textContent = index + 1;
        
        // Coluna Game
        row.insertCell().textContent = game.name;

        // Coluna Ano
        const anoCell = row.insertCell();
        anoCell.classList.add('text-center');
        anoCell.textContent = game.year;

        // Coluna Progresso (Barra do Bootstrap)
        const progressCell = row.insertCell();
        progressCell.classList.add('text-center');
        progressCell.innerHTML = `
            <div class="progress" role="progressbar" aria-label="Progresso ${game.progress}%" 
                 aria-valuenow="${game.progress}" aria-valuemin="0" aria-valuemax="100" style="height: 20px;">
                <div class="progress-bar ${game.progress == 100 ? 'bg-success' : 'bg-warning text-dark'}" 
                     style="width: ${game.progress}%">${game.progress}%</div>
            </div>
        `;
        
        // Coluna Ações (Botão Remover)
        const actionCell = row.insertCell();
        actionCell.classList.add('text-center');
        actionCell.innerHTML = `
            <button class="btn btn-sm btn-outline-danger" onclick="removeGame(${index})">Remover</button>
        `;
    });
}

/**
 * Função para remover um jogo da lista
 */
function removeGame(index) {
    if (confirm(`Tem certeza que deseja remover o jogo "${games[index].name}"?`)) {
        games.splice(index, 1); // Remove 1 item no índice
        saveGames(); // Salva a nova lista
        renderGamesList(); // Atualiza a tabela no modal
    }
}

/**
 * Event Listener para o envio do formulário
 */
gameForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const formData = new FormData(gameForm);
    
    // Cria o objeto do novo jogo
    const newGame = {
        name: formData.get('nome_game'),
        year: formData.get('ano_jogado'),
        progress: formData.get('porcentagem_jogada')
    };
    
    // Adiciona o novo jogo à lista
    games.push(newGame);
    
    // Salva a lista no LocalStorage
    saveGames();

    // Limpa o formulário e reseta o output de porcentagem
    gameForm.reset();
    document.getElementById('output-percent').value = '100%'; 

    // Opcional: Abre o modal para ver a lista atualizada
    const modalInstance = new bootstrap.Modal(gamesModal);
    modalInstance.show();
});


/**
 * Event Listener para carregar a lista toda vez que o modal for aberto
 */
gamesModal.addEventListener('show.bs.modal', function () {
    renderGamesList();
});

// Tornar a função removeGame global para ser chamada pelo onclick no HTML gerado
window.removeGame = removeGame;