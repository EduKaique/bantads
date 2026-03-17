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

const getData = (file) => JSON.parse(fs.readFileSync(PATHS[file], "utf-8"));
const saveData = (file, data) =>
  fs.writeFileSync(PATHS[file], JSON.stringify(data, null, 2));

//Login ------------------------------
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  const auths = getData("auth");

  const user = auths.find(
    (u) => u.email === email && u.senha === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Email ou senha inválidos"
    });
  }

  res.json({
    access_token: "fake-jwt-token",
    token_type: "bearer",
    tipo: user.tipo.toUpperCase(),
    usuario: {
      nome: user.nome || "Usuário",
      email: user.email,
      cpf: user.cpf
    }
  });

  console.log(`Login realizado: ${email}`);
});

//Autocadastro --------------------------
app.post("/auth/register", (req, res) => {
  const {
    cpf,
    nome,
    email,
    salario,
    celular,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    uf
  } = req.body;

  const solicitacoes = getData("solicitacoes");
  const clientes = getData("clientes");
  const auths = getData("auth");

  const jaCadastrado =
    clientes.some((c) => c.cpf === cpf) ||
    auths.some((a) => a.cpf === cpf);

  const jaEmAprovacao =
    solicitacoes.some((s) => s.cpf === cpf);

  if (jaCadastrado || jaEmAprovacao) {
    return res.status(400).json({
      message:
        "Erro: Cliente já cadastrado ou aguardando aprovação."
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

  console.log(`Novo pedido de cadastro: ${cpf} - ${nome}`);

  res.status(202).json({
    message:
      "Solicitação de autocadastro enviada com sucesso!"
  });
});

//Listar pedidos ---------------------------------------
app.get("/manager/pedidos-autocadastro", (_req, res) => {

  const pedidos = getData("solicitacoes")
    .map(({ cpf, nome, salario, dataSolicitacao, endereco }) => ({
      cpf,
      nome,
      salario,
      dataSolicitacao,
      endereco
    }))
    .sort(
      (a, b) =>
        new Date(b.dataSolicitacao) -
        new Date(a.dataSolicitacao)
    );

  res.json(pedidos);
});


//Aprovação de clientes ---------------------------------
app.post("/manager/aprovar-cliente/:cpf", (req, res) => {

  const cpf = req.params.cpf;

  const solicitacoes = getData("solicitacoes");
  const clientes = getData("clientes");
  const contas = getData("contas");

  const pedido = solicitacoes.find((s) => s.cpf === cpf);

  if (!pedido) {
    return res
      .status(404)
      .json({ message: "Pedido não encontrado" });
  }

  const novoCliente = {
    ...pedido
  };

  clientes.push(novoCliente);
  saveData("clientes", clientes);

  const numeroConta = Math.floor(Math.random() * 9000 + 1000).toString();
  const senha = Math.random().toString(36).slice(-8);

  const limite =
    pedido.salario >= 2000
      ? pedido.salario / 2
      : 0;

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

  saveData("contas", contas);

  const novasSolicitacoes =
    solicitacoes.filter((s) => s.cpf !== cpf);

  saveData("solicitacoes", novasSolicitacoes);

  console.log(
    `E-mail enviado para ${pedido.email} com senha: ${senha}`
  );

  res.json({
    message: "Cliente aprovado com sucesso",
    cliente: novoCliente
  });
});

app.listen(PORT, () => {
  console.log(`Mock server rodando em http://localhost:${PORT}`);
});
