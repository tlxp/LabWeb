/*const fs = require('fs');
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
}*/

const { MongoClient, ObjectId } = require("mongodb");
const uri = "mongodb+srv://Tia:UH3yx6d1YGm6ujPc@node3.eoonlxq.mongodb.net/";
const db = "notasDB";
const collection = "notas";

async function ligarMongo() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(db).collection(collection);
}

module.exports = (app) => {
  // GET - listar todas as notas
  app.get("/", async (req, res) => {
    const collection = await ligarMongo();
    const notas = await collection.find().toArray();
    res.status(200).json(notas);
  });

  // POST - adicionar nota
  app.post("/", async (req, res) => {
    const novaNota = req.body;
    if (
      !novaNota.cod ||
      !novaNota.nome ||
      !novaNota.prof ||
      isNaN(novaNota.nota)
    ) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    const collection = await ligarMongo();
    await collection.insertOne(novaNota);
    res.status(200).json({ mensagem: "Nota inserida com sucesso" });
  });

  // PATCH - atualizar nota pelo código
  app.patch("/:cod", async (req, res) => {
    const { cod } = req.params;
    const dadosAtualizados = req.body;

    const collection = await ligarMongo();
    const resultado = await collection.updateOne(
      { cod },
      { $set: dadosAtualizados }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ erro: "Nota não encontrada" });
    }

    res.status(200).json({ mensagem: "Nota atualizada com sucesso" });
  });

  // DELETE - apagar nota pelo código
  app.delete("/:cod", async (req, res) => {
    const { cod } = req.params;
    const collection = await ligarMongo();
    const resultado = await collection.deleteOne({ cod });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ erro: "Nota não encontrada" });
    }

    res.status(200).json({ mensagem: "Nota removida com sucesso" });
  });

  // DELETE - apagar todas as notas
  app.delete("/", async (req, res) => {
    const collection = await ligarMongo();
    await collection.deleteMany({});
    res.status(200).json({ mensagem: "Todas as notas foram removidas" });
  });
};
