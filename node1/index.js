const express = require('express');
const app = express();
const port = 3000;

// Middleware para permitir receber JSON no body
app.use(express.json());

// Nome da app e do programador
const nomeApp = 'NotasApp';
const autor = 'ZÉÉÉ';

// Array de notas
let minhas_notas = [20, 10, 15, 17];

// Iniciar servidor
app.listen(port, () => {
  console.log(`${nomeApp} iniciado por ${autor} na porta ${port}`);
});

// a. GET na raiz - lista todas as notas
app.get('/', (req, res) => {
  res.status(200).json(minhas_notas);
});

// b. GET com parâmetro - nota numa posição
app.get('/:pos', (req, res) => {
  const pos = parseInt(req.params.pos);
  if (pos >= 0 && pos < minhas_notas.length) {
    res.status(200).json(minhas_notas[pos]);
  } else {
    res.status(400).json({ erro: 'Posição inválida' });
  }
});

// c. POST na raiz - adiciona nota (body)
app.post('/', (req, res) => {
  const novaNota = parseInt(req.body.nota);
  if (isNaN(novaNota)) {
    return res.status(400).json({ erro: 'Nota inválida' });
  }
  minhas_notas.push(novaNota);
  res.status(200).json({ mensagem: 'Nota adicionada', notas: minhas_notas });
});

// d. POST com parâmetro - adiciona nota (parâmetro)
app.post('/:nota', (req, res) => {
  const nota = parseInt(req.params.nota);
  if (isNaN(nota)) {
    return res.status(400).json({ erro: 'Nota inválida' });
  }
  minhas_notas.push(nota);
  res.status(200).json({ mensagem: 'Nota adicionada', notas: minhas_notas });
});

// e. PATCH com parâmetro - atualiza nota
app.patch('/:pos', (req, res) => {
  const pos = parseInt(req.params.pos);
  const novaNota = parseInt(req.body.nota);

  if (isNaN(novaNota) || pos < 0 || pos >= minhas_notas.length) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  minhas_notas[pos] = novaNota;
  res.status(200).json({ mensagem: 'Nota atualizada', notas: minhas_notas });
});

// f. DELETE com parâmetro - apaga nota
app.delete('/:pos', (req, res) => {
  const pos = parseInt(req.params.pos);
  if (pos < 0 || pos >= minhas_notas.length) {
    return res.status(400).json({ erro: 'Posição inválida' });
  }

  minhas_notas.splice(pos, 1);
  res.status(200).json({ mensagem: 'Nota removida', notas: minhas_notas });
});

// g. DELETE na raiz - apaga todas as notas
app.delete('/', (req, res) => {
  minhas_notas = [];
  res.status(200).json({ mensagem: 'Todas as notas foram apagadas' });
});
