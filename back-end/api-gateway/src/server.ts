import express, { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan('dev'));

const routes: Record<string, string> = {
    '/auth': 'http://auth:8080',
    '/clientes': 'http://cliente:8080',
    '/gerentes': 'http://gerente:8080',
    '/contas': 'http://conta:8080'
};

for (const [route, target] of Object.entries(routes)) {
    const proxyOptions: Options = {
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
    };
    app.use(route, createProxyMiddleware(proxyOptions));
}

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API Gateway TS Online!' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway rodando na porta ${PORT}`);
});