const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const PATHS = {
  auth: path.join(__dirname, "mock/auth.json"),
  clientes: path.join(__dirname, "mock/clientes.json"),
  solicitacoes: path.join(__dirname, "mock/solicitacoes.json"),
  contas: path.join(__dirname, "mock/conta-banco.json"),
  users: path.join(__dirname, "mock/users.json")
};

const getData = (file) => JSON.parse(fs.readFileSync(PATHS[file]));
const saveData = (file, data) => fs.writeFileSync(PATHS[file], JSON.stringify(data, null, 2));
const getUsers = () => JSON.parse(fs.readFileSync(PATHS.users, "utf-8"));
const getSolicitacoes = () => JSON.parse(fs.readFileSync(PATHS.solicitacoes, "utf-8"));

// Login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Email ou senha inválidos" });
  }

  res.json({
    token: "fake-jwt-token",
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get("/manager/pedidos-autocadastro", (_req, res) => {
  const pedidos = getSolicitacoes()
    .map(({ cpf, nome, salario, dataSolicitacao, endereco }) => ({
      cpf,
      nome,
      salario,
      dataSolicitacao,
      endereco
    }))
    .sort((a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao));

  res.json(pedidos);
});

//Aprovação do cliente
app.post("/manager/aprovar-cliente/:cpf", (req, res) => {
  const cpf = req.params.cpf;

  const solicitacoes = getData('solicitacoes');
  const pedido = solicitacoes.find(s => s.cpf === cpf);
  if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

  const clientes = getData('clientes');

  const novoCliente = { 
    ...pedido, 
    approved: true
  };

  clientes.push(novoCliente);
  saveData('clientes', clientes);

  const contas = getData('contas') || [];
  const numeroConta = Math.floor(Math.random() * 9000 + 1000).toString();
  const senha = Math.random().toString(36).slice(-8);
  const limite = pedido.salario >= 2000 ? pedido.salario / 2 : 0;
  contas.push({
    accountId: Math.random().toString(36).substring(2, 10),
    branch: "0001",
    accountNumber: numeroConta,
    holderName: pedido.nome,
    holderDocument: pedido.cpf,
    availableBalance: 0,
    limit: limite,
    transactions: []
  });
  saveData('contas', contas);

  const novasSolicitacoes = solicitacoes.filter(s => s.cpf !== cpf);
  saveData('solicitacoes', novasSolicitacoes);

  //Simulação de e-mail 
  console.log(`E-mail enviado para ${pedido.email} com a senha: ${senha}`);

  res.json(novoCliente);
});

app.listen(PORT, () => {
  console.log(`Mock server rodando em http://localhost:${PORT}`);
});
