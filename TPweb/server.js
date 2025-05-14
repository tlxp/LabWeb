require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar ao MongoDB com Mongoose
mongoose.connect(DB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas com Mongoose');

    // Definir schema e modelo para usuários
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true }
    });
    const User = mongoose.model('User', userSchema);

    // Usar rotas de auth.js, passando o modelo User
    app.use('/auth', authRoutes(User));

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor a correr em http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err);
  });

// Manipular encerramento da conexão
mongoose.connection.on('disconnected', () => {
  console.log('Conexão com MongoDB encerrada.');
});
