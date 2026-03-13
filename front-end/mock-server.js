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

app.listen(PORT, () => {
  console.log(`Mock login rodando em http://localhost:${PORT}`);
});