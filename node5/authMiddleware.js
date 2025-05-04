// authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'minha_chave_secreta';

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, dadosUtilizador) => {
        if (err) {
            return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
        }

        req.utilizador = dadosUtilizador;
        next();
    });
}

module.exports = verificarToken;
