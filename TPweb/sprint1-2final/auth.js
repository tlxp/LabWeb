const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const router = express.Router();

module.exports = function(User, SolarPanel, Certificate, Credit, gridFSBucket, upload) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const authorize = (roles = []) => {
    return (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Acesso não autorizado.' });
        }
        next();
      } catch (err) {
        console.error('Erro ao verificar token:', err);
        return res.status(401).json({ message: 'Token inválido.' });
      }
    };
  };

  router.get('/profile', authorize(['Cliente']), async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('username email role');
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      res.json({ username: user.username, email: user.email, role: user.role });
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      res.status(500).json({ message: 'Erro interno do servidor.', error: err.message });
    }
  });

  router.post('/register', async (req, res) => {
    const { username, email, password, role = 'Cliente' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Nome de utilizador, e-mail e palavra-passe são obrigatórios.' });
    }
    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.username === username ? 'Nome de utilizador já existe.' : 'E-mail já está em uso.'
        });
      }
      const user = new User({ username, email, password, role });
      await user.save();
      console.log(`Usuário ${username} (${email}) registado com sucesso.`);
      return res.status(201).json({ message: 'Usuário registado com sucesso.' });
    } catch (err) {
      console.error('Erro ao registar usuário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.', error: err.message });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Nome de utilizador ou e-mail e palavra-passe são obrigatórios.' });
    }
    console.log(`Buscando usuário: ${username}`);
    try {
      const user = await User.findOne({ $or: [{ username }, { email: username }] });
      console.log(`Usuário encontrado: ${user ? user._id : 'não encontrado'}`);
      if (!user) {
        return res.status(401).json({ message: 'Nome de utilizador ou e-mail não encontrado.' });
      }
      if (user.password !== password) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log(`Login bem-sucedido para ${user.username}, token gerado.`);
      return res.json({
        message: `Login bem-sucedido. Bem-vindo, ${user.username}!`,
        token,
        role: user.role
      });
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  router.post('/register-panel', authorize(['Cliente']), async (req, res) => {
    const { panelId, location, technicalSpecs } = req.body;
    console.log('Recebendo registo de painel:', { panelId, location, technicalSpecs, clientId: req.user.id });

    if (!panelId || !location || !technicalSpecs) {
      console.warn('Campos obrigatórios ausentes:', { panelId, location, technicalSpecs });
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (!/^[A-Za-zÀ-ÿ\s]+,\s*[A-Za-zÀ-ÿ\s]+$/.test(location)) {
      console.warn('Formato inválido para localização:', location);
      return res.status(400).json({ message: 'Localização deve estar no formato "Distrito, Freguesia".' });
    }

    if (!/^PANEL\d{3}$/.test(panelId)) {
      console.warn('Formato inválido para panelId:', panelId);
      return res.status(400).json({ message: 'O ID do painel deve seguir o formato PANELXXX (ex: PANEL123).' });
    }

    try {
      const existingPanel = await SolarPanel.findOne({ panelId });
      if (existingPanel) {
        console.warn(`Conflito: panelId ${panelId} já existe.`);
        return res.status(400).json({ message: `O ID do painel ${panelId} já está em uso. Escolha outro.` });
      }

      const panel = new SolarPanel({
        panelId,
        location,
        technicalSpecs,
        clientId: req.user.id,
        status: 'Pendente'
      });
      await panel.save();
      console.log(`Painel ${panelId} registado com sucesso para o cliente ${req.user.id}`);
      return res.status(201).json({ message: `Painel ${panelId} registrado com sucesso. Aguardando validação.` });
    } catch (err) {
      console.error('Erro ao registar painel:', JSON.stringify(err, null, 2));
      if (err.code === 11000) {
        return res.status(400).json({ message: `O ID do painel ${panelId} já está em uso. Escolha outro.` });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.', error: err.message });
    }
  });

  router.get('/search-panel', authorize(['Técnico']), async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query de pesquisa é obrigatória.' });
    }
    try {
      const panels = await SolarPanel.find({
        $or: [
          { panelId: new RegExp(query, 'i') },
          { clientId: { $in: await User.find({ 
            $or: [{ username: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }] 
          }).select('_id') } }
        ]
      }).populate('clientId', 'username');
      return res.json(panels);
    } catch (err) {
      console.error('Erro ao pesquisar painel:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  router.post('/upload-certificate', authorize(['Técnico']), upload.single('certificate'), async (req, res) => {
    console.log('Recebendo upload de certificado:', { panelId: req.body.panelId, file: req.file ? req.file.originalname : 'nenhum arquivo recebido' });

    const { panelId } = req.body;
    const file = req.file;

    if (!file) {
      console.warn('Arquivo PDF ausente no upload de certificado.');
      return res.status(400).json({ message: 'O arquivo PDF do certificado é obrigatório.' });
    }

    if (!panelId) {
      console.warn('Panel ID ausente no upload de certificado.');
      return res.status(400).json({ message: 'O ID do painel é obrigatório.' });
    }

    if (!/^PANEL\d{3}$/.test(panelId)) {
      console.warn('Formato inválido para panelId:', panelId);
      return res.status(400).json({ message: 'O ID do painel deve seguir o formato PANELXXX (ex: PANEL123).' });
    }

    if (file.mimetype !== 'application/pdf') {
      console.warn(`Formato de arquivo inválido: ${file.mimetype}`);
      return res.status(400).json({ message: 'Apenas arquivos PDF são permitidos.' });
    }

    if (file.size > 5 * 1024 * 1024) {
      console.warn(`Arquivo excede o tamanho máximo: ${file.size} bytes`);
      return res.status(400).json({ message: 'O arquivo deve ter no máximo 5MB.' });
    }

    try {
      const panel = await SolarPanel.findOne({ panelId });
      if (!panel) {
        console.warn(`Painel não encontrado para panelId: ${panelId}`);
        return res.status(404).json({ message: `Painel com ID ${panelId} não encontrado.` });
      }

      // Upload file to GridFS
      const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
        contentType: file.mimetype
      });
      uploadStream.write(file.buffer);
      uploadStream.end();

      const fileId = await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', reject);
      });

      // Save certificate with GridFS file ID
      const certificate = new Certificate({
        panelId: panel._id,
        technicianId: req.user.id,
        certificateFileId: fileId
      });
      await certificate.save();
      await SolarPanel.findByIdAndUpdate(panel._id, { status: 'Aprovado' });
      console.log(`Certificado para painel ${panelId} registado com sucesso pelo técnico ${req.user.id}`);
      res.status(201).json({ message: 'Certificado registrado com sucesso.' });
      console.log('Resposta enviada para upload de certificado:', { panelId });
    } catch (err) {
      console.error('Erro ao registrar certificado:', JSON.stringify(err, null, 2));
      return res.status(500).json({ message: 'Erro interno do servidor.', error: err.message });
    }
  });

  router.post('/send-report', authorize(['Cliente']), async (req, res) => {
    const credits = await Credit.find({ clientId: req.user.id }).sort({ date: -1 }).limit(1);
    if (!credits.length) {
      return res.status(404).json({ message: 'Nenhum crédito registrado.' });
    }
    const user = await User.findById(req.user.id);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
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

  router.get('/protected', authorize(['admin']), (req, res) => {
    res.json({ message: `Acesso permitido para ${req.user.role} com ID ${req.user.id}` });
  });

  module.exports.authorize = authorize;
  return router;
};