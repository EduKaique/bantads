require('dotenv').config();
const express = require('express');
const httpProxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({
    origin: ['http://localhost:4200', 'https://curly-bassoon-9rqgpjjwrgrcpwj9-4200.app.github.dev'], // Libera especificamente o seu Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));
app.use(morgan('dev'));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CONFIGURAÇÃO DOS PROXIES
const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl;
    }
};

const authServiceProxy = httpProxy('http://ms-auth:8080', proxyOptions);
const clienteServiceProxy = httpProxy('http://ms-cliente:8080', proxyOptions);
const gerenteServiceProxy = httpProxy('http://ms-gerente:8080', proxyOptions);
const contaServiceProxy = httpProxy('http://conta:8080', proxyOptions);;


// MIDDLEWARE DE AUTENTICAÇÃO
function verifyJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            auth: false, 
            message: 'Token não fornecido ou formato inválido. Utilize o formato: Bearer <token>' 
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if (err) {
            return res.status(500).json({ auth: false, message: 'Falha ao autenticar o token.' });
        }

        req.userId = decoded.id;
        req.headers['x-usuario-cpf'] = decoded.cpf;
        req.headers['x-usuario-tipo'] = decoded.tipo;
        next();
    });
}

function requireAdmin(req, res, next) {
    const tipoUsuario = String(req.headers['x-usuario-tipo'] || '').toUpperCase();

    if (tipoUsuario !== 'ADMIN' && tipoUsuario !== 'ADMINISTRADOR') {
        return res.status(403).json({
            auth: false,
            message: 'Acesso restrito a administradores.'
        });
    }

    next();
}


// ROTAS PÚBLICAS
app.get('/reboot', async (req, res) => {
    try {
        await Promise.all([
            fetch('http://ms-auth:8080/reboot'),
            fetch('http://ms-cliente:8080/reboot'),
            fetch('http://ms-gerente:8080/reboot'),
            fetch('http://conta:8080/reboot')
        ]);
        res.status(200).json({ message: 'Banco de dados criado conforme especificação' });
    } catch (error) {
        console.error('Erro no Reboot:', error);
        res.status(500).json({ error: 'Erro ao reiniciar os microsserviços' });
    }
});

app.post('/login', (req, res, next) => {
    authServiceProxy(req, res, next);
});

app.post('/clientes', (req, res, next) => {
    clienteServiceProxy(req, res, next);
});


// ROTAS PROTEGIDAS
app.post('/logout', verifyJWT, (req, res, next) => {
    authServiceProxy(req, res, next);
});

app.use('/clientes', verifyJWT, (req, res, next) => {
    clienteServiceProxy(req, res, next);
});

app.get('/contas', verifyJWT, requireAdmin, (req, res, next) => {
    contaServiceProxy(req, res, next);
});

app.use('/contas', verifyJWT, (req, res, next) => {
    contaServiceProxy(req, res, next);
});

app.use('/gerentes', verifyJWT, (req, res, next) => {
    gerenteServiceProxy(req, res, next);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway rodando em JavaScript na porta ${PORT}`);
});
