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

function getUsers() {
  const data = JSON.parse(fs.readFileSync(usersPath));
  return data;
}

//POST - LOGIN
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


//GET - BUSCAR PERFIL
app.get("/client/perfil/:id", (req, res) => {

  const id = parseInt(req.params.id);
  const users = getUsers();

  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado"
    });
  }

  res.json(user);

});

//PUT - ALTERAÇÃO DE PERFIL
app.put("/client/atualizaPerfil/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const atualizaDados = req.body;

  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      message: "Usuário não encontrado"
    });
  }

  const user = users[userIndex];

  const atualizaCliente = {
    ...user,
    ...req.body,
    cpf: user.cpf
  };

  const salary = Number(atualizaCliente.salary);
  let novoLimite = salary * 0.5;

  const saldo = atualizaCliente.availableBalance || 0;

  if (saldo < 0) {
    const saldoNegativo = Math.abs(saldo);

    if (novoLimite < saldoNegativo) {
      novoLimite = saldoNegativo;
    }
  }

  atualizaCliente.limit = novoLimite;

  users[userIndex] = atualizaCliente;

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({
    user: atualizaCliente,
    balance: atualizaCliente.availableBalance,
    managerName: atualizaCliente.managerName
  })
})

app.listen(PORT, () => {
  console.log(`Mock rodando em http://localhost:${PORT}`);
});