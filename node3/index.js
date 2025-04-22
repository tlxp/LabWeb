const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const nomeApp = 'NotasApp';
const autor = 'seila';

// Aqui estás a "ativar" os endpoints
require('./Controllers/notas')(app);

app.listen(port, () => {
  console.log(`${nomeApp} iniciado por ${autor} na porta ${port}`);
});
