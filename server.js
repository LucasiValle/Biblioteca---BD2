// Rota principal (teste)
// Quando acessar http://localhost:3000

// Importa o framework Express (usado para criar o servidor web)
const express = require("express");

// Importa o cliente do MongoDB para conectar ao banco de dados
const { MongoClient } = require("mongodb");

// Cria a aplicação Express (nosso servidor)
const app = express();

// Permite que o servidor receba dados em formato JSON
app.use(express.json());

// String de conexão com o MongoDB local
const uri = "mongodb://localhost:27017";

// Cria o cliente MongoDB
const client = new MongoClient(uri);

// Variável que vai armazenar a coleção "livros"
let collection;
let usuarios;

// Função assíncrona para conectar ao banco de dados
async function conectar() {
  // Abre a conexão com o MongoDB
  await client.connect();

  // Seleciona o banco de dados "biblioteca"
  const db = client.db("biblioteca");

  // Seleciona a coleção "livros"
  collection = db.collection("livros");

  // Seleciona a coleção "usuarios"
  usuarios = db.collection("usuarios");

  console.log("MongoDB conectado");
}

// Executa a conexão com o banco
conectar();

//Permitir o navegador acessar os arquivos dessa pasta 
app.use(express.static("interface"));

app.get("/livros", async (req, res) => {
  try {
    const livros = await collection.find().toArray();
    res.json(livros);
  } catch (erro) {
    console.log("Erro ao buscar livros:", erro);
    res.status(500).send("Erro ao buscar livros");
  }
});

// Busca de livros por termo (titulo, autor ou genero)
app.get("/livros/busca", async (req, res) => {
  try {
    const { termo } = req.query;

    const filtro = {};

    if (termo) {
      filtro.$or = [
        { titulo: { $regex: termo, $options: "i" } },
        { autor: { $regex: termo, $options: "i" } },
        { genero: { $regex: termo, $options: "i" } }
      ];
    }

    const livros = await collection.find(filtro).toArray();

    res.json(livros);
  } catch (erro) {
    console.log("Erro no find:", erro);
    res.status(500).send("Erro no find");
  }
});

// Inserir novo livro no banco de dados (insert)
app.post ("/livros", async (req, res) => {
  try {
    //Insere os dados recebidos no corpo da requisição
    await collection.insertOne(req.body);

    res.send("Livro inserido com sucesso!");

  }
  catch (erro) {
    console.log ("Erro ao inserir livro:", erro);
    res.status(500).send("Erro ao inserir livro");
  }
});


// Atualizar um livro (update)
app.put("/livros/:id", async (req, res) => {
  try {
    await collection.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );

    res.send("Livro atualizado com sucesso!");
  } catch (erro) {
    console.log("Erro ao atualizar:", erro);
    res.status(500).send("Erro ao atualizar");
  }
});

// Deletar livro
app.delete("/livros/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await collection.deleteOne({
      _id: id
    });

    res.send("Livro removido!");
  } catch (erro) {
    console.log("Erro ao deletar:", erro);
    res.status(500).send("Erro ao deletar");
  }
});

// Substituir livro inteiro (replace)
app.put("/livros/replace/:id", async (req, res) => {
  try {
    await collection.replaceOne(
      { _id: req.params.id },
      req.body
    );

    res.send("Livro substituído!");
  } catch (erro) {
    console.log("Erro no replace:", erro);
    res.status(500).send("Erro no replace");
  }
});

//Contar Livros por categoria
app.get("/livros/relatorio", async (req, res) => {
  try {
    const resultado = await collection.aggregate([
      {
        $group: {
          _id: "$genero",
          totalExemplares: { $sum: "$exemplares" }
        }
      }
    ]).toArray();

    res.json(resultado);
  } catch (erro) {
    console.log("Erro no aggregate:", erro);
    res.status(500).send("Erro no aggregate");
  }
});

// Buscar usuários
app.get("/usuarios", async (req, res) => {
  try {
    const listaUsuarios = await usuarios.find().toArray();
    res.json(listaUsuarios);
  } catch (erro) {
    console.log("Erro ao buscar usuários:", erro);
    res.status(500).send("Erro ao buscar usuários");
  }
});

// Inserir novo usuário no banco de dados (insert)
app.post("/usuarios", async (req, res) => {
  try {
    await usuarios.insertOne(req.body);

    res.send("Usuário inserido com sucesso!");
  } catch (erro) {
    console.log("Erro ao inserir usuário:", erro);
    res.status(500).send("Erro ao inserir usuário");
  }
});

// Substituir usuário inteiro (replace)
app.put("/usuarios/replace/:id", async (req, res) => {
  try {
    await usuarios.replaceOne(
      { _id: req.params.id },
      req.body
    );

    res.send("Usuário substituído!");
  } catch (erro) {
    console.log("Erro no replace do usuário:", erro);
    res.status(500).send("Erro no replace do usuário");
  }
});

// Deletar usuário
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await usuarios.deleteOne({
      _id: id
    });

    res.send("Usuário removido!");
  } catch (erro) {
    console.log("Erro ao deletar usuário:", erro);
    res.status(500).send("Erro ao deletar usuário");
  }
});


// Realizar empréstimo de livro
app.post("/emprestimos", async (req, res) => {
  try {
    const { livroId, usuarioId } = req.body;

    const livro = await collection.findOne({ _id: livroId });
    const usuario = await usuarios.findOne({ _id: usuarioId });

    if (!livro) {
      return res.status(404).send("Livro não encontrado");
    }

    if (!usuario) {
      return res.status(404).send("Usuário não encontrado");
    }

    const emprestimos = livro.emprestimos || [];

    if (emprestimos.includes(usuarioId)) {
      return res.status(400).send("Este usuário já pegou este livro emprestado");
    }

    if (emprestimos.length >= livro.exemplares) {
      return res.status(400).send("Não há exemplares disponíveis");
    }

    await collection.updateOne(
      { _id: livroId },
      { $push: { emprestimos: usuarioId } }
    );

    res.send("Empréstimo realizado com sucesso!");
  } catch (erro) {
    console.log("Erro ao realizar empréstimo:", erro);
    res.status(500).send("Erro ao realizar empréstimo");
  }
});

// Devolver livro
app.post("/devolucoes", async (req, res) => {
  try {
    const { livroId, usuarioId } = req.body;

    const livro = await collection.findOne({ _id: livroId });

    if (!livro) {
      return res.status(404).send("Livro não encontrado");
    }

    await collection.updateOne(
      { _id: livroId },
      { $pull: { emprestimos: usuarioId } }
    );

    res.send("Livro devolvido com sucesso!");
  } catch (erro) {
    console.log("Erro ao devolver livro:", erro);
    res.status(500).send("Erro ao devolver livro");
  }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});