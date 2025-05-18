document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || !userRole) {
        alert('Por favor, inicie sessão.');
        window.location.href = 'index.html';
        return;
    }

    if (userRole !== 'Cliente') {
        alert('Acesso não autorizado: apenas clientes podem aceder a esta página.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Resposta inesperada do servidor: HTML recebido em vez de JSON.');
            }
            const error = await response.json();
            throw new Error(error.message || 'Erro ao carregar perfil.');
        }
        const user = await response.json();
        document.querySelector('.user-button').textContent = `${user.username} - Cliente`;
    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        alert(`Erro: ${err.message}. Verifique se o servidor está ativo.`);
        window.location.href = 'index.html';
        return;
    }

    const panelSection = document.getElementById('panel-section');
    console.log('Seção panel-section encontrada:', panelSection ? 'Sim' : 'Não');

    const freguesiasPorDistrito = {
        'Aveiro': ['Águeda', 'Albergaria-a-Velha', 'Anadia', 'Arouca'],
        'Beja': ['Aljustrel', 'Almodôvar', 'Alvito', 'Barrancos'],
        'Braga': ['Amares', 'Barcelos', 'Braga', 'Cabeceiras de Basto'],
        'Bragança': ['Alfândega da Fé', 'Bragança', 'Carrazeda de Ansiães'],
        'Castelo Branco': ['Belmonte', 'Castelo Branco', 'Covilhã'],
        'Coimbra': ['Arganil', 'Cantanhede', 'Coimbra', 'Condeixa-a-Nova'],
        'Évora': ['Alandroal', 'Arraiolos', 'Borba', 'Estremoz'],
        'Faro': ['Albufeira', 'Alcoutim', 'Aljezur', 'Castro Marim'],
        'Guarda': ['Aguiar da Beira', 'Almeida', 'Celorico da Beira'],
        'Leiria': ['Alcobaça', 'Alvaiázere', 'Ansião', 'Batalha'],
        'Lisboa': ['Alcântara', 'Alvalade', 'Areeiro', 'Arroios'],
        'Portalegre': ['Avis', 'Campo Maior', 'Castelo de Vide'],
        'Porto': ['Amarante', 'Baião', 'Felgueiras', 'Gondomar'],
        'Santarém': ['Abrantes', 'Alcanena', 'Almeirim', 'Alpiarça'],
        'Setúbal': ['Alcácer do Sal', 'Alcochete', 'Almada', 'Barreiro'],
        'Viana do Castelo': ['Arcos de Valdevez', 'Caminha', 'Melgaço'],
        'Vila Real': ['Alijó', 'Boticas', 'Chaves', 'Mesão Frio'],
        'Viseu': ['Armamar', 'Carregal do Sal', 'Castro Daire'],
        'Açores': ['Angra do Heroísmo', 'Calheta', 'Horta'],
        'Madeira': ['Calheta', 'Câmara de Lobos', 'Funchal']
    };

    const distritoSelect = document.getElementById('distrito');
    const freguesiaSelect = document.getElementById('freguesia');
    const powerValueSelect = document.getElementById('power-value');
    const powerValueError = document.getElementById('power-value-error');
    const panelIdInput = document.getElementById('panel-id');
    const panelIdError = document.getElementById('panel-id-error');

    distritoSelect.addEventListener('change', () => {
        const distrito = distritoSelect.value;
        freguesiaSelect.innerHTML = '<option value="">Selecione uma freguesia</option>';
        if (distrito && freguesiasPorDistrito[distrito]) {
            freguesiasPorDistrito[distrito].forEach(freguesia => {
                const option = document.createElement('option');
                option.value = freguesia;
                option.textContent = freguesia;
                freguesiaSelect.appendChild(option);
            });
        }
    });

    powerValueSelect.addEventListener('change', () => {
        powerValueError.textContent = powerValueSelect.value ? '' : 'Por favor, selecione uma potência válida.';
    });

    panelIdInput.addEventListener('input', () => {
        const panelId = panelIdInput.value.trim();
        if (!/^PANEL\d{3}$/.test(panelId)) {
            panelIdError.textContent = 'O ID do painel deve seguir o formato PANELXXX (ex: PANEL123).';
        } else {
            panelIdError.textContent = '';
        }
    });

    window.showSection = (sectionId) => {
        console.log(`Exibindo seção: ${sectionId}`);
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
        const sidebar = document.querySelector('.sidebar');
        const burger = document.querySelector('.burger');
        sidebar.classList.remove('sidebar-active');
        burger.classList.remove('toggle');
    };

    showSection('monitor-section');

    const panelForm = document.getElementById('panel-form');
    const reportButton = document.getElementById('send-report');
    const editProfileButton = document.getElementById('edit-profile-button');

    panelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = panelForm.querySelector('button');
        submitButton.disabled = true;
        try {
            const formData = new FormData(panelForm);
            const panelId = formData.get('panel-id').trim();
            const distrito = formData.get('distrito').trim();
            const freguesia = formData.get('freguesia').trim();
            const powerValue = formData.get('power-value').trim();
            const panelType = formData.get('panel-type').trim();
            const location = `${distrito}, ${freguesia}`;
            const technicalSpecs = `${powerValue}W, ${panelType}`;

            if (!panelId || !distrito || !freguesia || !powerValue || !panelType) {
                alert('Preencha todos os campos obrigatórios.');
                return;
            }

            if (!/^PANEL\d{3}$/.test(panelId)) {
                panelIdError.textContent = 'O ID do painel deve seguir o formato PANELXXX (ex: PANEL123).';
                return;
            }

            const data = { panelId, location, technicalSpecs };
            console.log('Enviando registo de painel:', data);

            const response = await fetch('http://localhost:3000/auth/register-panel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log('Resposta do servidor:', result);
            if (!response.ok) {
                throw new Error(result.message || 'Erro interno do servidor.');
            }
            alert(result.message);
            panelForm.reset();
            freguesiaSelect.innerHTML = '<option value="">Selecione um distrito primeiro</option>';
            powerValueError.textContent = '';
            panelIdError.textContent = '';
        } catch (err) {
            console.error('Erro ao registar painel:', err);
            alert(`Erro: ${err.message}`);
        } finally {
            submitButton.disabled = false;
        }
    });

    reportButton.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:3000/auth/send-report', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Erro ao enviar relatório.');
            }
            alert(result.message);
        } catch (err) {
            console.error('Erro ao enviar relatório:', err);
            alert(`Erro: ${err.message}`);
        }
    });

    editProfileButton.addEventListener('click', () => {
        window.location.href = 'edit_profile.html';
    });

    window.toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const burger = document.querySelector('.burger');
        sidebar.classList.toggle('sidebar-active');
        burger.classList.toggle('toggle');
    };

    window.logout = () => {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
    };
});