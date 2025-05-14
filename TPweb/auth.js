const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'segredo123'; // Valor padrão

module.exports = function(User) {
  // Rota de login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    console.log(`Buscando usuário: ${username}`);
    try {
      const user = await User.findOne({ username });
      console.log(`Usuário encontrado: ${JSON.stringify(user)}`);

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        message: `Login bem-sucedido. Bem-vindo, ${username}!`,
        token
      });
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  // Middleware de autorização (pode aceitar qualquer usuário ou só alguns roles)
  const authorize = (roles = []) => {
    return (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Acesso não autorizado.' });
        }

        next();
      } catch (err) {
        return res.status(401).json({ message: 'Token inválido.' });
      }
    };
  };

  // Rota protegida para qualquer usuário autenticado
  router.get('/protected', authorize(), (req, res) => {
    res.json({ message: `Acesso permitido. Bem-vindo(a), ${req.user.role}!` });
  });

  return router;
};
