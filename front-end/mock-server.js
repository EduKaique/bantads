const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));
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

  const solicitacoes = getData("solicitacoes");
  const clientesAtuais = getData("clientes");
  const auths = getData("auth");

  const jaCadastrado = clientesAtuais.some((cliente) => cliente.cpf === cpf) || auths.some((auth) => auth.cpf === cpf);
  const jaEmAprovacao = solicitacoes.some((solicitacao) => solicitacao.cpf === cpf);

  if (jaCadastrado || jaEmAprovacao) {
    return res.status(400).json({
      message: "Erro: Cliente já cadastrado ou aguardando aprovação."
    });
  }

  const novaSolicitacao = {
    cpf,
    nome,
    email,
    celular,
    salario,
    endereco: {
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf
    },
    dataSolicitacao: new Date().toISOString()
  };

  solicitacoes.push(novaSolicitacao);
  saveData("solicitacoes", solicitacoes);

  res.status(202).json({
    message: "Solicitação de autocadastro enviada com sucesso! Aguarde a aprovação de um gerente."
  });
  console.log(`Nova solicitação de cadastro: ${cpf} - ${nome}`);
});

// Login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const auths = getData("auth");

  const authUser = auths.find((user) => user.email === email && user.senha === password);

  if (!authUser) {
    return res.status(401).json({ message: "Email ou senha inválidos" });
  }

  res.json({
    access_token: "fake-jwt-token",
    token_type: "bearer",
    tipo: authUser.tipo.toUpperCase(),
    usuario: {
      nome: authUser.nome || "Usuário",
      email: authUser.email,
      cpf: authUser.cpf
    }
  });
  console.log(`Login bem-sucedido: ${email}`);
});

app.get("/manager/pedidos-autocadastro", (_req, res) => {
  res.json(getPedidosAutocadastro());
});

app.get("/manager/pedidos-autocadastro", (_req, res) => {
  res.json(getPedidosAutocadastro());
});

app.listen(PORT, () => {
  console.log(`Mock login rodando em http://localhost:${PORT}`);
});
