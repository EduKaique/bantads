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
app.use(cors());
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

const authServiceProxy = httpProxy('http://ms-auth:8081', proxyOptions);
const clienteServiceProxy = httpProxy('http://ms-cliente:8082', proxyOptions);
const gerenteServiceProxy = httpProxy('http://ms-gerente:8083', proxyOptions);
const contaServiceProxy = httpProxy('http://conta:8084', proxyOptions);;


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
        next();
    });
}


// ROTAS PÚBLICAS 
app.get('/reboot', (req, res, next) => {
    authServiceProxy(req, res, next);
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