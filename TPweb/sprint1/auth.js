const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const router = express.Router();

module.exports = function(User, SolarPanel, Certificate, Credit, upload) {
  // Configuração do nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  // Middleware de autorização
  const authorize = (roles = []) => {
    return (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1]; // Espera "Bearer <token>"

      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona id e role ao req

        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Acesso não autorizado.' });
        }

        next();
      } catch (err) {
        return res.status(401).json({ message: 'Token inválido.' });
      }
    };
  };

  // Rota de registo
  router.post('/register', async (req, res) => {
    const { username, password, role = 'Cliente' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe.' });
      }

      const user = new User({
        username,
        password,
        role
      });
      await user.save();

      return res.status(201).json({ message: 'Usuário registado com sucesso.' });
    } catch (err) {
      console.error('Erro ao registar usuário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

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
        process.env.JWT_SECRET,
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

  // Rota para registar painel solar (Cliente)
  router.post('/register-panel', authorize(['Cliente']), async (req, res) => {
    const { panelId, location, technicalSpecs } = req.body;

    if (!panelId || !location || !technicalSpecs) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
      // Verificar se panelId é único
      const existingPanel = await SolarPanel.findOne({ panelId });
      if (existingPanel) {
        return res.status(400).json({ message: 'ID do painel já existe.' });
      }

      const panel = new SolarPanel({
        panelId,
        location,
        technicalSpecs,
        clientId: req.user.id,
        status: 'Pendente'
      });
      await panel.save();
      return res.status(201).json({ message: 'Painel registado com sucesso. Aguardando validação.' });
    } catch (err) {
      console.error('Erro ao registar painel:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  // Rota para pesquisar painéis (Técnico)
  router.get('/search-panel', authorize(['Técnico']), async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query de pesquisa é obrigatória.' });
    }
    try {
      const panels = await SolarPanel.find({
        $or: [
          { panelId: new RegExp(query, 'i') },
          { clientId: { $in: await User.find({ username: new RegExp(query, 'i') }).select('_id') } }
        ]
      }).populate('clientId', 'username');
      return res.json(panels);
    } catch (err) {
      console.error('Erro ao pesquisar painel:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  // Rota para upload de certificado (Técnico)
  router.post('/upload-certificate', authorize(['Técnico']), upload.single('certificate'), async (req, res) => {
    const { panelId } = req.body;
    if (!req.file || !panelId) {
      return res.status(400).json({ message: 'Painel ID e arquivo PDF são obrigatórios.' });
    }

    // Validação do tipo de arquivo (PDF)
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Apenas ficheiros PDF são permitidos.' });
    }

    try {
      // Verificar se o painel existe
      const panel = await SolarPanel.findById(panelId);
      if (!panel) {
        return res.status(404).json({ message: 'Painel não encontrado.' });
      }

      const certificate = new Certificate({
        panelId,
        technicianId: req.user.id,
        certificateFile: req.file.path
      });
      await certificate.save();
      await SolarPanel.findByIdAndUpdate(panelId, { status: 'Aprovado' });
      return res.status(201).json({ message: 'Certificado registado com sucesso.' });
    } catch (err) {
      console.error('Erro ao registar certificado:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  // Rota para enviar relatório por e-mail (Cliente)
  router.post('/send-report', authorize(['Cliente']), async (req, res) => {
    const credits = await Credit.find({ clientId: req.user.id }).sort({ date: -1 }).limit(1);
    if (!credits.length) {
      return res.status(404).json({ message: 'Nenhum crédito registrado.' });
    }
    const user = await User.findById(req.user.id);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.username,
      subject: 'Relatório Mensal de Créditos de Energia',
      text: `Olá, sua última leitura registrou ${credits[0].kWh} kWh em ${credits[0].date.toLocaleDateString()}.`
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Erro ao enviar e-mail:', err);
        return res.status(500).json({ message: 'Erro ao enviar e-mail.' });
      }
      res.json({ message: 'Relatório enviado com sucesso.' });
    });
  });

  // Exemplo de rota protegida
  router.get('/protected', authorize(['admin']), (req, res) => {
    res.json({ message: `Acesso permitido para ${req.user.role} com ID ${req.user.id}` });
  });

  // Exportar o middleware authorize para uso em server.js
  module.exports.authorize = authorize;

  return router;
};