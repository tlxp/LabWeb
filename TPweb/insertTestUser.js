const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://diogo:tpweb@web.mv42hoe.mongodb.net/loginDB?retryWrites=true&w=majority')
  .then(async () => {
    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      role: String
    });
    const User = mongoose.model('User', userSchema);
    
    // Limpar e inserir usuários
    await User.deleteMany({});
    await User.insertMany([
      { username: 'maria', password: 'minhaSenhaSegura123', role: 'admin' },
      { username: 'ze', password: 'outraSenha123', role: 'user' }
    ]);
    
    console.log('Usuários inseridos com sucesso!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Erro:', err);
  });
