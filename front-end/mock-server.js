const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "*"
}));

app.use(express.json());

const usersPath = path.join(__dirname, "mock/users.json");
const solicitacoesPath = path.join(__dirname, "mock/solicitacoes.json");

function getUsers() {
  const data = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  return data;
}

function getSolicitacoes() {
  const data = JSON.parse(fs.readFileSync(solicitacoesPath, "utf-8"));
  return data;
}

function getPedidosAutocadastro() {
  return getSolicitacoes()
    .map(({ cpf, nome, salario, dataSolicitacao }) => ({
      cpf,
      nome,
      salario,
      dataSolicitacao
    }))
    .sort((solicitacaoAtual, proximaSolicitacao) =>
      new Date(proximaSolicitacao.dataSolicitacao).getTime() -
      new Date(solicitacaoAtual.dataSolicitacao).getTime()
    );
}

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  const users = getUsers();

    const user = users.find(
    (u) => u.email === email && u.password === password
    );

  if (!user) {
    return res.status(401).json({
      message: "Email ou senha inválidos"
    });
  }

  res.json({
    token: "fake-jwt-token",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.get("/manager/pedidos-autocadastro", (_req, res) => {
  res.json(getPedidosAutocadastro());
});

app.listen(PORT, () => {
  console.log(`Mock login rodando em http://localhost:${PORT}`);
});
