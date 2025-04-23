const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/consumo/:clienteId', (req, res) => {
    const clienteId = req.params.clienteId;

    const dados = {
        clienteId: clienteId,
        nome: "João Silva",
        endereco: {
            rua: "Rua Exemplo",
            numero: "42",
            cidade: "Lisboa",
            codigoPostal: "1234-567"
        },
        consumo: [
            {
                mes: "Janeiro",
                ano: 2023,
                kWhConsumido: 250,
                custoTotal: 35.50,
                dataLeitura: "2023-01-31"
            }
        ],
        informacoesAdicionais: {
            tipoTarifa: "Residencial",
            fornecedorEnergia: "Empresa XYZ",
            contratoAtivo: true
        }
    };

    res.json(dados);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
