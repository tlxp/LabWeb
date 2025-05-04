async function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Login com sucesso!');
        } else {
            alert(data.mensagem || 'Erro no login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
    }
}

async function buscarDados() {
    const clienteId = document.getElementById('clienteId').value;
    const resultadoDiv = document.getElementById('resultado');

    if (!clienteId) {
        resultadoDiv.innerHTML = "<p>Por favor, insira um ID de cliente.</p>";
        return;
    }

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:3000/api/consumo/${clienteId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Acesso negado');
        }

        const data = await response.json();

        resultadoDiv.innerHTML = `
            <h2>Cliente: ${data.nome}</h2>
            <p><strong>Endereço:</strong> ${data.endereco.rua}, ${data.endereco.numero}, ${data.endereco.cidade} (${data.endereco.codigoPostal})</p>
            <h3>Consumo:</h3>
            <ul>
                ${data.consumo.map(item => `
                    <li>
                        ${item.mes}/${item.ano} - ${item.kWhConsumido} kWh - €${item.custoTotal} (Leitura: ${item.dataLeitura})
                    </li>
                `).join('')}
            </ul>
            <h3>Informações Adicionais:</h3>
            <p>Tipo de Tarifa: ${data.informacoesAdicionais.tipoTarifa}</p>
            <p>Fornecedor: ${data.informacoesAdicionais.fornecedorEnergia}</p>
            <p>Contrato Ativo: ${data.informacoesAdicionais.contratoAtivo ? 'Sim' : 'Não'}</p>
        `;
    } catch (error) {
        resultadoDiv.innerHTML = "<p>Erro ao obter dados. Faça login ou verifique o servidor.</p>";
        console.error('Erro:', error);
    }
}
