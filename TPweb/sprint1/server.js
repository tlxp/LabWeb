require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./auth');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

// Configuração do multer para upload de certificados
const upload = multer({
  dest: 'uploads/certificates/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas ficheiros PDF são permitidos.'), false);
    }
  }
});

// Middleware
app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Conectar ao MongoDB com Mongoose
mongoose.connect(DB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas com Mongoose');

    // Schema e modelo para usuários
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, required: true, enum: ['admin', 'user', 'Cliente', 'Técnico'] }
    });
    const User = mongoose.model('User', userSchema);

    // Schema e modelo para painéis solares
    const solarPanelSchema = new mongoose.Schema({
      panelId: { type: String, required: true, unique: true },
      location: { type: String, required: true },
      technicalSpecs: { type: String, required: true },
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, enum: ['Pendente', 'Aprovado', 'Rejeitado'], default: 'Pendente' },
      createdAt: { type: Date, default: Date.now }
    });
    // Índice apenas para clientId (panelId já tem índice via unique: true)
    solarPanelSchema.index({ clientId: 1 });
    const SolarPanel = mongoose.model('SolarPanel', solarPanelSchema);

    // Schema e modelo para certificados
    const certificateSchema = new mongoose.Schema({
      panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel', required: true },
      technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      certificateFile: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });
    // Índice composto para performance
    certificateSchema.index({ panelId: 1, technicianId: 1 });
    const Certificate = mongoose.model('Certificate', certificateSchema);

    // Schema e modelo para créditos de energia
    const creditSchema = new mongoose.Schema({
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      kWh: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    });
    const Credit = mongoose.model('Credit', creditSchema);

    // Usar rotas de auth.js, passando os modelos e upload
    app.use('/auth', authRoutes(User, SolarPanel, Certificate, Credit, upload));

    // Endpoint simulado para produção de energia
    app.get('/api/energy-production', (req, res) => {
      const production = (Math.random() * 10).toFixed(2); // kW entre 0 e 10
      res.json({ production });
    });

    // Endpoint para leitura mensal de créditos
    app.get('/api/monthly-reading', authRoutes.authorize(['Cliente']), async (req, res) => {
      const kWh = (Math.random() * 100).toFixed(2); // Simula kWh produzido
      const credit = new Credit({ clientId: req.user.id, kWh });
      await credit.save();

      // Enviar e-mail com nodemailer
      const user = await User.findById(req.user.id);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.username,
        subject: 'Leitura Mensal de Créditos de Energia',
        text: `Olá,\n\nA sua leitura mensal registou ${kWh} kWh produzidos.\nData: ${new Date().toLocaleDateString()}.\n\nObrigado,\nGestão de Energia Renovável`
      };
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error('Erro ao enviar e-mail:', err);
        }
      });

      res.json({ kWh, date: new Date() });
    });

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