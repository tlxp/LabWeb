const express = require('express');
const router = express.Router();
const Nota = require('../models/nota'); // O caminho deve estar correto

// Listar todas as notas
router.get('/notas', async (req, res) => {
    try {
        const notas = await Nota.find();
        console.log('Notas encontradas:', notas); // Log de notas encontradas
        res.json(notas);
    } catch (err) {
        console.error('Erro ao buscar notas:', err);
        res.status(500).send('Erro ao buscar notas');
    }
});

// Rota para salvar nota
router.post('/notas', async (req, res) => {
    const { codigoDisciplina, nomeProfessor, nomeDisciplina, nota } = req.body;

    // Verificar se todos os campos necessários foram enviados
    if (!codigoDisciplina || !nomeProfessor || !nomeDisciplina || nota === undefined) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }

    // Verificar se a nota está dentro do intervalo válido
    if (nota < 0 || nota > 20) {
        return res.status(400).json({ erro: "A nota deve estar entre 0 e 20." });
    }

    try {
        const novaNota = new Nota({
            codigoDisciplina,
            nomeProfessor,
            nomeDisciplina,
            nota
        });

        // Salvar a nova nota no banco de dados
        const resultado = await novaNota.save();
        console.log("Nota salva com sucesso:", resultado);

        // Retornar a resposta com a nota salva (incluso o _id)
        return res.status(201).json(resultado);
    } catch (err) {
        console.error("Erro ao salvar a nota:", err);
        return res.status(500).json({ erro: "Erro ao salvar a nota." });
    }
});

// Deletar uma nota por ID
router.delete('/notas/:id', async (req, res) => {
    const { id } = req.params;
    console.log('ID recebido para deleção:', id);  // Este log vai ajudar a ver se o ID está correto

    try {
        const notaRemovida = await Nota.findByIdAndDelete(id);

        if (!notaRemovida) {
            return res.status(404).json({ erro: "Nota não encontrada." });
        }

        console.log("Nota removida com sucesso:", notaRemovida);
        return res.json({ mensagem: "Nota removida com sucesso." });
    } catch (err) {
        console.error("Erro ao remover a nota:", err);
        return res.status(500).json({ erro: "Erro ao remover a nota." });
    }
});

// Atualizar uma nota por ID
router.put('/notas/:id', async (req, res) => {
    const { id } = req.params;
    const { codigoDisciplina, nomeProfessor, nomeDisciplina, nota } = req.body;

    if (!codigoDisciplina || !nomeProfessor || !nomeDisciplina || nota === undefined) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }

    if (nota < 0 || nota > 20) {
        return res.status(400).json({ erro: "A nota deve estar entre 0 e 20." });
    }

    try {
        const notaAtualizada = await Nota.findByIdAndUpdate(
            id,
            { codigoDisciplina, nomeProfessor, nomeDisciplina, nota },
            { new: true } // Retorna o documento atualizado
        );

        if (!notaAtualizada) {
            return res.status(404).json({ erro: "Nota não encontrada." });
        }

        return res.status(200).json(notaAtualizada);
    } catch (err) {
        console.error("Erro ao atualizar a nota:", err);
        return res.status(500).json({ erro: "Erro ao atualizar a nota." });
    }
});


module.exports = router;
