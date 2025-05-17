document.addEventListener('DOMContentLoaded', () => {
  // Submissão do formulário de registo de painéis
  const panelForm = document.getElementById('panel-form');
  panelForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(panelForm);
    const panelData = {
      panelId: formData.get('panel-id').trim(),
      location: formData.get('location').trim(),
      technicalSpecs: formData.get('technical-specs').trim()
    };

    if (!panelData.panelId || !panelData.location || !panelData.technicalSpecs) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const submitButton = panelForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'A registar...';
    submitButton.disabled = true;

    try {
      const response = await fetch('http://localhost:3000/auth/register-panel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(panelData)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao registar painel.');
      }
      alert(result.message);
      panelForm.reset();
    } catch (err) {
      console.error('Erro ao registar painel:', err);
      alert(`Erro: ${err.message}`);
    } finally {
      submitButton.textContent = 'Submeter Registo';
      submitButton.disabled = false;
    }
  });

  // Atualização da produção em tempo real
  setInterval(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/energy-production');
      const { production } = await response.json();
      document.getElementById('real-time-production').textContent = `${production} kW`;
    } catch (err) {
      console.error('Erro ao atualizar produção:', err);
    }
  }, 5000); // Atualiza a cada 5 segundos

  // Envio de relatório por e-mail
  document.getElementById('send-report').addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/send-report', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      alert(result.message);
    } catch (err) {
      console.error('Erro ao enviar relatório:', err);
      alert('Erro ao enviar relatório.');
    }
  });

  // Funções de navegação
  window.toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const burger = document.querySelector('.burger');
    sidebar.classList.toggle('sidebar-active');
    burger.classList.toggle('toggle');
  };

  window.showSection = (sectionId) => {
    const sections = ['monitor-section', 'register-section', 'credits-section', 'profile-section'];
    sections.forEach(id => {
      const section = document.getElementById(id);
      if (section) section.style.display = id === sectionId ? 'block' : 'none';
    });
  };

  window.logout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  };

  // Exibir seção inicial com base no hash da URL
  const initialSection = window.location.hash.replace('#', '') || 'monitor-section';
  showSection(initialSection);
});