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
  solicitacoes: path.join(__dirname, "mock/solicitacoes.json")
};

const getData = (file) => JSON.parse(fs.readFileSync(PATHS[file]));
const saveData = (file, data) => fs.writeFileSync(PATHS[file], JSON.stringify(data, null, 2));

// Autocadastro
app.post("/auth/register", (req, res) => {
  const { cpf, nome, email, salario, celular, cep, logradouro, numero, complemento, bairro, cidade, uf } = req.body;
  
  const solicitacoes = getData('solicitacoes');
  const clientesAtuais = getData('clientes');
  const auths = getData('auth');

  const jaCadastrado = clientesAtuais.some(c => c.cpf === cpf) || auths.some(a => a.cpf === cpf);
  const jaEmAprovacao = solicitacoes.some(s => s.cpf === cpf);

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
  saveData('solicitacoes', solicitacoes);

  res.status(202).json({ 
    message: "Solicitação de autocadastro enviada com sucesso! Aguarde a aprovação de um gerente." 
  });
  console.log(`Nova solicitação de cadastro: ${cpf} - ${nome}`);
});

// Login 
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const auths = getData('auth');

  const authUser = auths.find(u => u.email === email && u.senha === password);

  if (!authUser) {
    return res.status(401).json({ message: "Email ou senha inválidos" });
  }

  res.json({
    "access_token": "fake-jwt-token",
    "token_type": "bearer",
    "tipo": authUser.tipo.toUpperCase(), 
    "usuario": {
      "nome": authUser.nome || "Usuário",
      "email": authUser.email,
      "cpf": authUser.cpf 
    }
  });
  console.log(`Login bem-sucedido: ${email}`);
});

app.listen(PORT, () => {
  console.log(`BANTADS Mock Server rodando em http://localhost:${PORT}`);
});