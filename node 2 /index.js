async function buscarDados() {
    const clienteId = document.getElementById('clienteId').value;
    const resultadoDiv = document.getElementById('resultado');

    if (!clienteId) {
        resultadoDiv.innerHTML = "<p>Por favor, insira um ID de cliente.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/consumo/${clienteId}`);
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
        resultadoDiv.innerHTML = "<p>Erro ao obter dados. Verifique o servidor.</p>";
        console.error('Erro:', error);
    }
}
