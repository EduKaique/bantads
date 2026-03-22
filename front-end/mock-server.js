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
  gerentes: path.join(__dirname, "mock/gerentes.json"),
  solicitacoes: path.join(__dirname, "mock/solicitacoes.json"),
  contas: path.join(__dirname, "mock/conta-banco.json")
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
    tipo: (user.tipo).toUpperCase(), 
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
app.get("/admin/gerentes", (_req, res) => {
  const gerentes = getData("gerentes");

  res.json(gerentes);
});

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

  const novoId =
  clientes.length > 0
    ? Math.max(...clientes.map(c => c.id)) + 1
    : 1;

  const novoCliente = {
    ...pedido,
    id: novoId
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

//Busca perfil clientes----------------------
app.get("/cliente/perfil/:cpf", (req, res) => {
  const cpf = req.params.cpf;
  const clientes = getData("clientes");

  const cliente = clientes.find(c => c.cpf === cpf);
  
  if (!cliente) {
    return res.status(404).json({
      message: "Cliente não encontrado"
    });
  }

  res.json({
    name: cliente.nome,
    cpf: cliente.cpf,
    email: cliente.email,
    phoneNumber: cliente.celular,
    salary: cliente.salario,
    address: cliente.endereco
  });
});

//Alteração de perfil clientes ----------------------
app.put("/cliente/atualizaPerfil/:cpf", (req, res) => {
  const cpf = req.params.cpf;
  const dadosAtualizados = req.body;

  const clientes = getData("clientes");
  const contas = getData("contas");

  const clienteIndex = clientes.findIndex(c => c.cpf === cpf);

  if (clienteIndex === -1) {
    return res.status(404).json({
      message: "Cliente não encontrado"
    });
  }

  const clienteAntigo = clientes[clienteIndex];

  const clienteAtualizado = {
    ...clienteAntigo,
    nome: dadosAtualizados.name || clienteAntigo.nome,
    email: dadosAtualizados.email || clienteAntigo.email,
    celular: dadosAtualizados.phoneNumber || clienteAntigo.celular,
    salario: Number(dadosAtualizados.salary || clienteAntigo.salario),
    endereco: {
      ...clienteAntigo.endereco,
      cep: dadosAtualizados.address?.cep || clienteAntigo.endereco.cep,
      logradouro: dadosAtualizados.address?.logradouro || clienteAntigo.endereco.logradouro,
      numero: dadosAtualizados.address?.numero || clienteAntigo.endereco.numero,
      complemento: dadosAtualizados.address?.complemento || clienteAntigo.endereco.complemento,
      bairro: dadosAtualizados.address?.bairro || clienteAntigo.endereco.bairro,
      cidade: dadosAtualizados.address?.cidade || clienteAntigo.endereco.cidade,
      uf: dadosAtualizados.address?.uf || clienteAntigo.endereco.uf
    }
  };

  clientes[clienteIndex] = clienteAtualizado;
  saveData("clientes", clientes);

  const contaIndex = contas.findIndex(c => c.holderDocument === cpf);
  if (contaIndex !== -1) {
    const conta = contas[contaIndex];
    const salario = clienteAtualizado.salario;
    let novoLimite = salario >= 2000 ? salario * 0.5 : 0;
    
    if (conta.availableBalance < 0) {
      const divida = Math.abs(conta.availableBalance);
      novoLimite = Math.max(novoLimite, divida);
    }
    
    conta.limit = novoLimite;
    contas[contaIndex] = conta;
    saveData("contas", contas);
  }

  res.json({
    balance: contas[contaIndex]?.availableBalance || 0,
    managerName: contas[contaIndex]?.manager,
    cliente: clienteAtualizado
  });
});

//Cadastro gerente
app.post("/admin/gerentes", (req, res) => {
  const novoGerente = { ...req.body, tipo: "GERENTE" };
  
  const gerentes = getData("gerentes");
  const contas = getData("contas");

  gerentes.push(novoGerente);
  saveData("gerentes", gerentes); 
  
  contas.sort((a, b) => a.availableBalance - b.availableBalance);
  const contaAlvo = contas.find(c => c.managerDocument && c.managerDocument !== novoGerente.cpf);

  if (contaAlvo) {
    contaAlvo.managerDocument = novoGerente.cpf;
    saveData("contas", contas);
    console.log(`[R17] Conta ${contaAlvo.accountNumber} transferida para o novo gerente!`);
  }

  res.status(201).json({ message: "Gerente cadastrado com sucesso!" });
});

//Alteração de perfil gerente ----------------------
app.put("/admin/atualizaPerfil/:cpf", (req, res) => {
  const cpf = req.params.cpf;
  const dadosAtualizados = req.body;

  const gerentes = getData("gerentes");
  const auths = getData("auth");

  const gerenteIndex = gerentes.findIndex(g => g.cpf === cpf);
  const authIndex = auths.findIndex(a => a.cpf === cpf);

  if (gerenteIndex === -1 || authIndex === -1) {
    return res.status(404).json({
      message: "Gerente não encontrado"
    });
  }

  const gerenteAntigo = gerentes[gerenteIndex];
  const authAntigo = auths[authIndex];

  const gerenteAtualizado = {
    ...gerenteAntigo,
    nome: dadosAtualizados.name || gerenteAntigo.nome,
    email: dadosAtualizados.email || gerenteAntigo.email
  };

  gerentes[gerenteIndex] = gerenteAtualizado;
  saveData("gerentes", gerentes);

  const authAtualizado = {
    ...authAntigo,
    nome: dadosAtualizados.name || authAntigo.nome,
    email: dadosAtualizados.email || authAntigo.email,
    senha: dadosAtualizados.password || authAntigo.senha
  };

  auths[authIndex] = authAtualizado;
  saveData("auth", auths);

  res.json({
    message: "Perfil atualizado com sucesso",
    gerente: gerenteAtualizado
  });
});

//Remoção de Gerente ----------------------
app.delete("/admin/gerentes/:cpf", (req, res) => {
  const cpfRemover = req.params.cpf;

  let gerentes = getData("gerentes");
  let auths = getData("auth");
  let contas = getData("contas");

  const gerenteIndex = gerentes.findIndex(g => g.cpf === cpfRemover);

  if (gerenteIndex === -1) {
    return res.status(404).json({ message: "Gerente não encontrado." });
  }

  if (gerenteIndex !== -1 && gerentes.length <= 1) {
    return res.status(400).json({ 
      message: "Operação negada. Não é possível remover o único gerente do banco." 
    });
  }

  const gerenteRemovido = gerentes[gerenteIndex];

  // Remove o gerente da lista de gerentes e de autenticação
  const gerentesRestantes = gerentes.filter(g => g.cpf !== cpfRemover);
  const authsRestantes = auths.filter(a => a.cpf !== cpfRemover);

  const contagemContas = gerentesRestantes.map(gerente => {
    return {
      cpf: gerente.cpf,
      nome: gerente.nome,
      qtdContas: contas.filter(c => c.managerDocument === gerente.cpf || c.manager === gerente.nome).length
    };
  });

  // Ordena do menor para o maior número de contas
  contagemContas.sort((a, b) => a.qtdContas - b.qtdContas);
  
  const gerenteAlvo = contagemContas[0];

  //Varre as contas e transfere as que eram do gerente excluído para o novo
  let contasTransferidas = 0;
  contas = contas.map(conta => {
    if (conta.managerDocument === cpfRemover || conta.manager === gerenteRemovido.nome) {
      contasTransferidas++;
      return { 
        ...conta, 
        managerDocument: gerenteAlvo.cpf,
        manager: gerenteAlvo.nome
      };
    }
    return conta;
  });

  saveData("gerentes", gerentesRestantes);
  saveData("auth", authsRestantes);
  saveData("contas", contas);

  console.log(`Gerente ${gerenteRemovido.nome} removido. ${contasTransferidas} contas transferidas para ${gerenteAlvo.nome}.`);
  
  res.json({ 
    message: "Gerente removido com sucesso e contas realocadas.",
    contasRealocadas: contasTransferidas
  });
});

app.listen(PORT, () => {
  console.log(`Mock server rodando em http://localhost:${PORT}`);
});
