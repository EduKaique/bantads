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
  contas: path.join(__dirname, "mock/conta-banco.json"),
  transacoes: path.join(__dirname, "mock/transacoes.json")
};

const getData = (file) => {
  try {
    const rawData = fs.readFileSync(PATHS[file], "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${file}:`, error);
    return [];
  }
};
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
      nome: user.nome,
      email: user.email,
      cpf: user.cpf
    }
  });

  console.log(`Login realizado: ${email}`);
});

// Autocadastro --------------------------
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
  const gerentes = getData("gerentes"); 
  const auths = getData("auth");

  const jaCadastrado = clientes.some((c) => c.cpf === cpf) || auths.some((a) => a.cpf === cpf);
  const jaEmAprovacao = solicitacoes.some((s) => s.cpf === cpf);

  if (jaCadastrado || jaEmAprovacao) {
    return res.status(400).json({
      message: "Erro: Cliente já cadastrado ou aguardando aprovação."
    });
  }

  if (!gerentes || gerentes.length === 0) {
    return res.status(500).json({
      message: "Erro interno: Nenhum gerente disponível no sistema para assumir o cliente."
    });
  }

  const contagemCarga = gerentes.map(gerente => {
    const qtdClientesAtivos = clientes.filter(c => c.cpfGerente === gerente.cpf).length;
    const qtdSolicitacoesPendentes = solicitacoes.filter(s => s.cpfGerente === gerente.cpf).length;
    
    return {
      cpf: gerente.cpf,
      totalCarga: qtdClientesAtivos + qtdSolicitacoesPendentes
    };
  });

  contagemCarga.sort((a, b) => a.totalCarga - b.totalCarga);
  
  const gerenteDesignadoCpf = contagemCarga[0].cpf;

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
    cpfGerente: gerenteDesignadoCpf, 
    dataSolicitacao: new Date().toISOString()
  };

  solicitacoes.push(novaSolicitacao);
  saveData("solicitacoes", solicitacoes);

  console.log(`[Autocadastro] Novo pedido: ${cpf} - ${nome} | Atribuído ao gerente: ${gerenteDesignadoCpf}`);

  res.status(202).json({
    message: "Solicitação de autocadastro enviada com sucesso!"
  });
});

//Rejeição de Cliente ---------------------------------------
app.post("/manager/rejeitar-cliente/:cpf", (req, res) => {
  const cpf = req.params.cpf;
  const { motivo } = req.body; 

  const solicitacoes = getData("solicitacoes");
  const pedido = solicitacoes.find((s) => s.cpf === cpf);

  if (!pedido) {
    return res.status(404).json({ message: "Pedido não encontrado" });
  }

  const dataHoraRejeicao = new Date().toISOString(); 

  const novasSolicitacoes = solicitacoes.filter((s) => s.cpf !== cpf);
  saveData("solicitacoes", novasSolicitacoes);

  console.log(`Pedido de ${pedido.email} rejeitado. Motivo: ${motivo}`);
  
  console.log(`Data/Hora da Rejeição armazenada: ${dataHoraRejeicao}`);

  res.json({
    message: "Cliente rejeitado com sucesso",
    dataRejeicao: dataHoraRejeicao
  });
});


//Listar pedidos ---------------------------------------
app.get("/manager/pedidos-autocadastro", (req, res) => {
  const cpfGerenteLogado = req.query.cpfGerente;

  if (!cpfGerenteLogado) {
    return res.status(400).json({ 
      message: "CPF do gerente não informado na consulta." 
    });
  }

  const pedidos = getData("solicitacoes")
    .filter((solicitacao) => solicitacao.cpfGerente === cpfGerenteLogado) 
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

//Listar contas (para R14 - Melhores Clientes e Dashboard) ---------
app.get("/contas", (_req, res) => {
  const contas = getData("contas");
  const contasComSaldo = contas.map((conta) => ({
    ...conta,
    cpf: conta.holderDocument,
    nome: conta.holderName,
    saldoPositivo: conta.availableBalance > 0 ? conta.availableBalance : 0,
    saldoNegativo: Math.abs(Math.min(0, -(conta.limit - conta.availableBalance))),
  }));
  res.json(contasComSaldo);
});

//Listar clientes (para R14 - Melhores Clientes e Dashboard) ------
app.get("/clientes", (_req, res) => {
  const clientes = getData("clientes");
  res.json(clientes);
});


//Aprovação de clientes ---------------------------------
//app.get("/admin/gerentes", (_req, res) => {
//  const gerentes = getData("gerentes");
//
//  res.json(gerentes);
//});

app.post("/manager/aprovar-cliente/:cpf", (req, res) => {

  const cpf = req.params.cpf;

  const solicitacoes = getData("solicitacoes");
  const clientes = getData("clientes");
  const contas = getData("contas");
  const auth = getData("auth");
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

  auth.push({
    nome: pedido.nome,
    cpf: pedido.cpf,
    email: pedido.email,
    senha: senha,
    tipo: "CLIENTE" 
  });

  saveData("contas", contas);
  saveData("auth", auth);

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
app.put("/cliente/alteracao-perfil/:cpf", (req, res) => {
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
    cliente: clienteAtualizado,
    limit: contas[contaIndex]?.limit
  });
});

app.get("/manager/clientes", (req, res) => {
  const clientes = getData("clientes");
  const contas = getData("contas");

  const clientesFormatados = clientes.map((cliente) => {
    const conta = contas.find((c) => c.holderDocument === cliente.cpf);

    return {
      cpf: cliente.cpf,
      nome: cliente.nome,
      cidade: cliente.endereco?.cidade || "N/A",
      estado: cliente.endereco?.uf || "N/A",
      saldo: conta ? conta.availableBalance : 0,
      limite: conta ? conta.limit : 0,
      numeroConta: conta ? conta.accountNumber : "N/A"
    };
  });

  res.json(clientesFormatados);
});

app.get("/contas/:numeroConta", (req, res) => {
  const { numeroConta } = req.params;
  const contas = getData("contas");
  const clientes = getData("clientes");

  const contaDestino = contas.find(c => c.accountNumber === numeroConta);

  if (!contaDestino) {
    return res.status(404).json({ message: "Conta não encontrada" });
  }

  const cliente = clientes.find(c => c.cpf === contaDestino.holderDocument);

  res.json({
    numeroConta: contaDestino.accountNumber,
    nome: cliente ? cliente.nome : contaDestino.holderName,
    cpf: contaDestino.holderDocument,
    saldoDisponivel: contaDestino.availableBalance
  });
});

app.post("/transacoes/transferir", (req, res) => {
  const { contaOrigem, contaDestino, valor } = req.body;
  const contas = getData("contas");
  let transacoes = getData("transacoes");

  const idxOrigem = contas.findIndex(c => c.accountNumber === contaOrigem);
  const idxDestino = contas.findIndex(c => c.accountNumber === contaDestino);

  if (idxDestino === -1) {
    return res.status(404).json({ message: "Conta de destino não encontrada." });
  }

  if (idxOrigem !== -1) { 
    if (contas[idxOrigem].availableBalance + contas[idxOrigem].limit < valor) {
        return res.status(400).json({ message: "Saldo insuficiente." });
    }
    contas[idxOrigem].availableBalance -= valor;
  }

  contas[idxDestino].availableBalance += valor;

  saveData("contas", contas);

  const novaTransacao = {
    id: Math.random().toString(36).substring(2, 10),
    dataHora: new Date().toISOString(),
    contaOrigem: contaOrigem,
    nomeOrigem: idxOrigem !== -1 ? contas[idxOrigem].holderName : "Sistema/Depósito",
    contaDestino: contaDestino,
    nomeDestino: contas[idxDestino].holderName,
    valor: valor
  };
  transacoes.push(novaTransacao);
  saveData("transacoes", transacoes);

  res.json({ 
    message: "Transferência realizada com sucesso!",
    novoSaldoOrigem: idxOrigem !== -1 ? contas[idxOrigem].availableBalance : null
  });
});

// Rota para buscar a conta e o saldo pelo CPF do usuário logado
app.get("/contas/cpf/:cpf", (req, res) => {
  const { cpf } = req.params;
  const contas = getData("contas");
  
  const contaOrigem = contas.find(c => c.holderDocument === cpf);

  if (!contaOrigem) {
    return res.status(404).json({ message: "Conta não encontrada para este CPF." });
  }

  res.json({
    numeroConta: contaOrigem.accountNumber,
    saldoDisponivel: contaOrigem.availableBalance
  });
});

//Cadastro gerente
app.post("/admin/gerentes", (req, res) => {
  const novoGerente = { ...req.body, tipo: "GERENTE" };
  
  const auths = getData("auth");
  const gerentes = getData("gerentes");
  const contas = getData("contas");

  gerentes.push(novoGerente);
  auths.push(novoGerente);
  
  contas.sort((a, b) => a.availableBalance - b.availableBalance);
  const contaAlvo = contas.find(c => c.managerDocument && c.managerDocument !== novoGerente.cpf);

  if (contaAlvo) {
    contaAlvo.managerDocument = novoGerente.cpf;
    contaAlvo.manager = novoGerente.nome;
    console.log(`[R17] Conta ${contaAlvo.accountNumber} transferida para o novo gerente!`);
  }

  saveData("gerentes", gerentes);
  saveData("auth", auths);
  saveData("contas", contas);

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
  app.delete('/admin/gerentes/:cpf', (req, res) => {
  const cpfExcluido = req.params.cpf.replace(/\D/g, ''); // Garante que pegamos só os números
  
  // Lê os arquivos atualizados
  let gerentes = JSON.parse(fs.readFileSync('./mock/gerentes.json', 'utf8'));
  let contas = JSON.parse(fs.readFileSync('./mock/conta-banco.json', 'utf8'));

  const gerenteIndex = gerentes.findIndex(g => (g.cpf ? g.cpf.replace(/\D/g, '') : '') === cpfExcluido);

  if (gerenteIndex === -1) {
    return res.status(404).json({ message: 'Gerente não encontrado.' });
  }

  // Separa apenas os gerentes que VÃO SOBRAR na empresa
  const gerentesRestantes = gerentes.filter((g, index) => index !== gerenteIndex);

  if (gerentesRestantes.length === 0) {
    return res.status(400).json({ message: 'Não é possível excluir o único gerente do sistema.' });
  }

  let gerenteDestino = gerentesRestantes[0];
  let menorQtd = contas.filter(c => (c.managerDocument ? c.managerDocument.replace(/\D/g, '') : '') === gerenteDestino.cpf.replace(/\D/g, '')).length;

  for (let i = 1; i < gerentesRestantes.length; i++) {
    const atual = gerentesRestantes[i];
    const qtdAtual = contas.filter(c => (c.managerDocument ? c.managerDocument.replace(/\D/g, '') : '') === atual.cpf.replace(/\D/g, '')).length;
    
    if (qtdAtual < menorQtd) {
      gerenteDestino = atual;
      menorQtd = qtdAtual;
    }
  }

  let contasAlteradas = false;
  contas = contas.map(conta => {
    const managerDocNorm = conta.managerDocument ? conta.managerDocument.replace(/\D/g, '') : '';
    
    if (managerDocNorm === cpfExcluido) {
      conta.managerDocument = gerenteDestino.cpf;
      conta.manager = gerenteDestino.nome;
      contasAlteradas = true;
    }
    return conta;
  });

  gerentes.splice(gerenteIndex, 1);
  fs.writeFileSync('./mock/gerentes.json', JSON.stringify(gerentes, null, 2), 'utf8');

  if (contasAlteradas) {
    fs.writeFileSync('./mock/conta-banco.json', JSON.stringify(contas, null, 2), 'utf8');
  }

  res.status(200).json({ 
    message: `Gerente removido! Contas transferidas para ${gerenteDestino.nome}.` 
  });
});

//Listar gerentes ---------
app.get("/gerentes", (_req, res) => {
  const gerentes = getData("gerentes");
  res.json(gerentes);
});

//Saque -----------------------------------
app.post("/transacoes/saque", (req, res) => {
  const { contaOrigem, valor } = req.body;
  const contas = getData("contas");
  let transacoes = getData("transacoes");

  const idxOrigem = contas.findIndex(c => c.accountNumber === contaOrigem);

  if (idxOrigem === -1) {
    return res.status(404).json({ message: "Conta não encontrada." });
  }
  if (contas[idxOrigem].availableBalance + contas[idxOrigem].limit < valor) {
      return res.status(400).json({ message: "Saldo insuficiente." });
  }
  contas[idxOrigem].availableBalance -= valor;
  saveData("contas", contas);

  const novaTransacao = {
    id: Math.random().toString(36).substring(2, 10),
    dataHora: new Date().toISOString(),
    contaOrigem: contaOrigem,
    tipo: "SAQUE",
    valor: valor
  };
  transacoes.push(novaTransacao);
  saveData("transacoes", transacoes);

  res.json({ 
    message: "Saque realizado com sucesso!",
    novoSaldoOrigem: contas[idxOrigem].availableBalance
  });
});

app.listen(PORT, () => {
  console.log(`Mock server rodando em http://localhost:${PORT}`);
});