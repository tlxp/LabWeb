const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const notasRoutes = require('./routes/notas'); // Importar as rotas

const app = express();
const PORT = 3000;

// String de conexão com o MongoDB Atlas
const DB_URI = 'mongodb+srv://diogo:diogosara17@cluster0.ofm7cao.mongodb.net/notasDB?retryWrites=true&w=majority';

// Conectar ao MongoDB
mongoose.connect(DB_URI)
  .then(() => console.log("Conectado ao MongoDB Atlas com sucesso"))
  .catch((err) => console.log("Erro ao conectar ao MongoDB", err));

// Monitorar eventos de conexão
mongoose.connection.on('connected', () => {
  console.log("Conexão com MongoDB estabelecida com sucesso!");
});

mongoose.connection.on('error', (err) => {
  console.log("Erro ao conectar ao MongoDB:", err);
});

// Middlewares
app.use(cors());
app.use(bodyParser.json()); // Permite analisar o corpo das requisições JSON

// Usar as rotas
app.use('/api', notasRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
