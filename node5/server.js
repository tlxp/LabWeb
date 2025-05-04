// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const verificarToken = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'minha_chave_secreta';

// Endpoint de login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // Simulação de utilizador
    const utilizadorExemplo = {
        id: 1,
        nome: "João Silva",
        email: "joao@example.com",
        senha: "1234" // NÃO USAR em produção
    };

    if (email === utilizadorExemplo.email && senha === utilizadorExemplo.senha) {
        const token = jwt.sign({
            id: utilizadorExemplo.id,
            nome: utilizadorExemplo.nome,
            email: utilizadorExemplo.email
        }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });
    } else {
        res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
});

// Rota protegida
app.get('/api/consumo/:clienteId', verificarToken, (req, res) => {
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
