const fs = require('fs');
const path = require('path');

const ficheiro = path.join(__dirname, '../shared/ficheiro_notas.txt');

let minhas_notas = [];
try {
  const data = fs.readFileSync(ficheiro, 'utf8');
  minhas_notas = JSON.parse(data);
} catch (err) {
  console.log('Ficheiro não encontrado ou vazio, começamos com array vazio');
}

function gravarFicheiro() {
  fs.writeFileSync(ficheiro, JSON.stringify(minhas_notas, null, 2));
}

module.exports = (app) => {
  // GET - todas as notas
  app.get('/', (req, res) => {
    res.status(200).json(minhas_notas);
  });

  // GET - nota por código
  app.get('/:cod', (req, res) => {
    const nota = minhas_notas.find(n => n.cod === req.params.cod);
    if (!nota) return res.status(404).json({ erro: 'Nota não encontrada' });
    res.status(200).json(nota);
  });

  // POST - adicionar nova nota
  app.post('/', (req, res) => {
    const { cod, nome, prof, nota } = req.body;
    if (!cod || !nome || !prof || isNaN(nota)) {
      return res.status(400).json({ erro: 'Dados inválidos' });
    }
    const novaNota = { cod, nome, prof, nota: Number(nota) };
    minhas_notas.push(novaNota);
    gravarFicheiro();
    res.status(201).json({ mensagem: 'Nota adicionada', nota: novaNota });
  });

  // PATCH - atualizar nota por código
  app.patch('/:cod', (req, res) => {
    const { cod } = req.params;
    const { nome, prof, nota } = req.body;
    const index = minhas_notas.findIndex(n => n.cod === cod);
    if (index === -1) return res.status(404).json({ erro: 'Nota não encontrada' });

    if (nome) minhas_notas[index].nome = nome;
    if (prof) minhas_notas[index].prof = prof;
    if (!isNaN(nota)) minhas_notas[index].nota = Number(nota);

    gravarFicheiro();
    res.status(200).json({ mensagem: 'Nota atualizada', nota: minhas_notas[index] });
  });

  // DELETE - apagar nota por código
  app.delete('/:cod', (req, res) => {
    const index = minhas_notas.findIndex(n => n.cod === req.params.cod);
    if (index === -1) return res.status(404).json({ erro: 'Nota não encontrada' });

    const removida = minhas_notas.splice(index, 1);
    gravarFicheiro();
    res.status(200).json({ mensagem: 'Nota removida', nota: removida[0] });
  });

  // DELETE - apagar todas as notas
  app.delete('/', (req, res) => {
    minhas_notas = [];
    gravarFicheiro();
    res.status(200).json({ mensagem: 'Todas as notas foram apagadas' });
  });
};
