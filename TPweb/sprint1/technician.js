document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-panel-form');
  const certificateForm = document.getElementById('certificate-form');
  const searchResults = document.getElementById('search-results');

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('search-query').value.trim();
    if (!query) {
      alert('Por favor, insira um ID do painel ou nome do cliente.');
      return;
    }

    searchResults.innerHTML = '<p>A carregar...</p>';
    try {
      const response = await fetch(`http://localhost:3000/auth/search-panel?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao pesquisar painéis.');
      }
      const panels = await response.json();
      searchResults.innerHTML = panels.length
        ? panels.map(panel => `
            <div>
              <p>ID: ${panel.panelId} | Cliente: ${panel.clientId.username} | Localização: ${panel.location}</p>
              <button onclick="selectPanel('${panel._id}')">Selecionar</button>
            </div>
          `).join('')
        : '<p>Nenhum painel encontrado.</p>';
    } catch (err) {
      console.error('Erro ao pesquisar:', err);
      alert(`Erro: ${err.message}`);
    }
  });

  certificateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = certificateForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'A submeter...';
    submitButton.disabled = true;

    try {
      const response = await fetch('http://localhost:3000/auth/upload-certificate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: new FormData(certificateForm)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao submeter certificado.');
      }
      alert(result.message);
      certificateForm.reset();
      certificateForm.classList.add('hidden');
      searchResults.innerHTML = '';
    } catch (err) {
      console.error('Erro ao submeter certificado:', err);
      alert(`Erro: ${err.message}`);
    } finally {
      submitButton.textContent = 'Submeter Certificado';
      submitButton.disabled = false;
    }
  });

  // Funções de navegação
  window.toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const burger = document.querySelector('.burger');
    sidebar.classList.toggle('sidebar-active');
    burger.classList.toggle('toggle');
  };

  window.logout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  };
});

window.selectPanel = (panelId) => {
  document.getElementById('panel-id').value = panelId;
  document.getElementById('certificate-form').classList.remove('hidden');
};