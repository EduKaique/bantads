import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 8080;

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

app.use(cors());
app.use(morgan('dev'));

const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    const rotasPublicas = [
        { path: '/login', method: 'POST' },
        { path: '/clientes', method: 'POST' }, 
        { path: '/reboot', method: 'GET' },
        { path: '/health', method: 'GET' }
    ];

    const ehRotaPublica = rotasPublicas.some(
        (rota) => req.path === rota.path && req.method === rota.method
    );

    if (ehRotaPublica) {
        return next(); 
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        res.status(401).json({ error: 'ErroNaoLogado: Token não fornecido.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.headers['x-usuario-logado'] = JSON.stringify(decoded);
        next();
    } catch (err) {
        res.status(403).json({ error: 'ErroProibido: Token inválido ou expirado.' });
    }
};

app.use(verificarToken);

const proxyOptionsComum = (target: string): Options => ({
        target,
        changeOrigin: true,
        on: {
            // Se precisar do proxyReq no futuro, é só descomentar:
            // proxyReq: (proxyReq, req, res) => {
            //     // Injeção de headers extras
            // },
            error: (err, req, res) => {
                console.error(`Erro ao conectar com ${target}:`, err.message);
                const expressRes = res as Response;
                if (!expressRes.headersSent) {
                    expressRes.status(500).json({ error: 'Microsserviço indisponível' });
                }
            }
        }
    });


app.use('/login', createProxyMiddleware(proxyOptionsComum('http://auth:8080')));
app.use('/logout', createProxyMiddleware(proxyOptionsComum('http://auth:8080')));

app.use('/clientes', createProxyMiddleware(proxyOptionsComum('http://cliente:8080')));
app.use('/gerentes', createProxyMiddleware(proxyOptionsComum('http://gerente:8080')));
app.use('/contas', createProxyMiddleware(proxyOptionsComum('http://conta:8080')));



app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API Gateway Online!' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway rodando na porta ${PORT}`);
});