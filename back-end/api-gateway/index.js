require("dotenv").config();
const express = require("express");
const httpProxy = require("express-http-proxy");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:4200", "https://curly-bassoon-9rqgpjjwrgrcpwj9-4200.app.github.dev"], // Libera especificamente o seu Angular
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  }),
);
app.use(morgan("dev"));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CONFIGURAÇÃO DOS PROXIES
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl;
  },
};

const authServiceProxy = httpProxy("http://ms-auth:8080", proxyOptions);
const clienteServiceProxy = httpProxy("http://ms-cliente:8080", proxyOptions);
const gerenteServiceProxy = httpProxy("http://ms-gerente:8080", proxyOptions);
const contaServiceProxy = httpProxy("http://conta:8080", proxyOptions);

// MIDDLEWARE DE AUTENTICAÇÃO
async function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      auth: false,
      message: "Token não fornecido ou formato inválido. Utilize o formato: Bearer <token>",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET, async function (err, decoded) {
    if (err) {
      return res.status(401).json({ auth: false, message: "Falha ao autenticar o token." });
    }

    try {
      const authResponse = await fetch("http://ms-auth:8080/validate", {
        headers: { Authorization: authHeader },
      });

      if (authResponse.status === 401) {
        return res.status(401).json({ auth: false, message: "Token revogado (Logout)." });
      }
    } catch (error) {
      console.error("Erro ao validar token no ms-auth:", error);
      return res.status(500).json({ auth: false, message: "Erro na verificação de segurança." });
    }

    req.userId = decoded.id;
    req.headers["x-usuario-cpf"] = decoded.cpf;
    req.headers["x-usuario-tipo"] = decoded.tipo;
    next();
  });
}

function requireAdmin(req, res, next) {
  const tipoUsuario = String(req.headers["x-usuario-tipo"] || "").toUpperCase();

  if (tipoUsuario !== "ADMIN" && tipoUsuario !== "ADMINISTRADOR") {
    return res.status(403).json({
      auth: false,
      message: "Acesso restrito a administradores.",
    });
  }

  next();
}

// ROTAS PÚBLICAS
app.get("/reboot", async (req, res) => {
  try {
    await Promise.all([fetch("http://ms-auth:8080/reboot"), fetch("http://ms-cliente:8080/reboot"), fetch("http://ms-gerente:8080/reboot"), fetch("http://conta:8080/reboot")]);
    res.status(200).json({ message: "Banco de dados criado conforme especificação" });
  } catch (error) {
    console.error("Erro no Reboot:", error);
    res.status(500).json({ error: "Erro ao reiniciar os microsserviços" });
  }
});

app.post("/login", (req, res, next) => {
  authServiceProxy(req, res, next);
});

app.post("/clientes", (req, res, next) => {
  clienteServiceProxy(req, res, next);
});

// ROTAS PROTEGIDAS
app.post("/logout", verifyJWT, (req, res, next) => {
  authServiceProxy(req, res, next);
});

// API COMPOSITION
const getForwardHeaders = (req) => ({
    'Authorization': req.headers['authorization'],
    'x-usuario-cpf': req.headers['x-usuario-cpf'],
    'x-usuario-tipo': req.headers['x-usuario-tipo']
});

app.get('/clientes/:cpf', verifyJWT, async (req, res, next) => {
    try {
        const cpf = req.params.cpf;
        
        const clienteRes = await fetch(`http://ms-cliente:8080/clientes/${cpf}`, {
            headers: getForwardHeaders(req)
        });

        if (!clienteRes.ok) {
            const errorBody = await clienteRes.json().catch(() => ({}));
            return res.status(clienteRes.status).json(errorBody);
        }

        const cliente = await clienteRes.json();

        cliente.saldo = 0.0; 
        if (cliente.conta) {
            try {
                const saldoRes = await fetch(`http://conta:8080/contas/${cliente.conta}/saldo`, {
                    headers: getForwardHeaders(req)
                });
                if (saldoRes.ok) {
                    const saldoData = await saldoRes.json();
                    cliente.saldo = saldoData.saldo;
                }
            } catch (error) {
                console.error(`Erro ao buscar saldo da conta ${cliente.conta}:`, error.message);
            }
        }

        return res.json(cliente);
    } catch (error) {
        next(error);
    }
});

app.get('/clientes', verifyJWT, async (req, res, next) => {
    try {
        const filtro = req.query.filtro;
        
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        const clientesRes = await fetch(`http://ms-cliente:8080/clientes${queryString}`, { 
            headers: getForwardHeaders(req) 
        });

        if (!clientesRes.ok) {
            const errorBody = await clientesRes.json().catch(() => ({}));
            return res.status(clientesRes.status).json(errorBody);
        }

        let clientes = await clientesRes.json();

        const promessasSaldos = clientes.map(async (cliente) => {
            cliente.saldo = 0.0;
            if (cliente.conta) {
                try {
                    const saldoRes = await fetch(`http://conta:8080/contas/${cliente.conta}/saldo`, {
                        headers: getForwardHeaders(req)
                    });
                    if (saldoRes.ok) {
                        const saldoData = await saldoRes.json();
                        cliente.saldo = saldoData.saldo;
                    }
                } catch (e) {
                }
            }
            return cliente;
        });

        clientes = await Promise.all(promessasSaldos);

        if (filtro === 'melhores_clientes') {
            clientes.sort((a, b) => b.saldo - a.saldo);
            clientes = clientes.slice(0, 3);
        }

        return res.json(clientes);
    } catch (error) {
        next(error);
    }
});

app.use('/clientes', verifyJWT, (req, res, next) => {
    clienteServiceProxy(req, res, next);
});

app.get("/contas", verifyJWT, requireAdmin, (req, res, next) => {
  contaServiceProxy(req, res, next);
});

app.use("/contas", verifyJWT, (req, res, next) => {
  contaServiceProxy(req, res, next);
});

app.get('/gerentes', verifyJWT, async (req, res, next) => {
    try {
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        
        const gerentesRes = await fetch(`http://ms-gerente:8080/gerentes${queryString}`, {
            headers: getForwardHeaders(req)
        });

        if (!gerentesRes.ok) {
            return res.status(gerentesRes.status).json(await gerentesRes.json().catch(() => ({})));
        }

        let respostaGerentes = await gerentesRes.json();

        if (respostaGerentes.length > 0 && respostaGerentes[0].gerente) {
            
            const clientesRes = await fetch(`http://ms-cliente:8080/clientes`, {
                headers: getForwardHeaders(req)
            });

            if (clientesRes.ok) {
                let todosClientes = await clientesRes.json();

                const promessasSaldos = todosClientes.map(async (c) => {
                    c.saldo = 0.0;
                    if (c.conta) {
                        try {
                            const sRes = await fetch(`http://conta:8080/contas/${c.conta}/saldo`, { 
                                headers: getForwardHeaders(req) 
                            });
                            if (sRes.ok) c.saldo = (await sRes.json()).saldo;
                        } catch (e) {} 
                    }
                    return c;
                });
                todosClientes = await Promise.all(promessasSaldos);

                respostaGerentes = respostaGerentes.map(item => {
                    const cpfDoGerente = item.gerente.cpf;
                    
                    item.clientes = todosClientes.filter(c => c.gerente === cpfDoGerente);

                    item.saldo_positivo = item.clientes
                      .map(c => parseFloat(c.saldo) || 0) 
                      .filter(saldo => saldo > 0)
                      .reduce((soma, saldo) => soma + saldo, 0);

                    item.saldo_negativo = item.clientes
                      .map(c => parseFloat(c.saldo) || 0) 
                      .filter(saldo => saldo < 0) 
                      .reduce((soma, saldo) => soma + saldo, 0);

                    return item;
                });

                respostaGerentes.sort((a, b) => b.saldo_positivo - a.saldo_positivo);
            }
        }

        return res.json(respostaGerentes);
    } catch (error) {
        next(error);
    }
});

app.use("/gerentes", verifyJWT, (req, res, next) => {
  gerenteServiceProxy(req, res, next);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway rodando em JavaScript na porta ${PORT}`);
});
