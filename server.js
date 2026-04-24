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

//TONINHO:
//Permitir o navegador acessar os arquivos dessa pasta 
app.use(express.static("interface"));

// Rota principal (teste)
// Quando acessar http://localhost:3000
/* TONINHO:
app.get("/", (req, res) => {
  res.send("Servidor funcionando com MongoDB!");
});
*/

app.get("/livros", async (req, res) => {
  try {
    const livros = await collection.find().toArray();
    res.json(livros);
  } catch (erro) {
    console.log("Erro ao buscar livros:", erro);
    res.status(500).send("Erro ao buscar livros");
  }
});


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
/*
//busca de livros por filtro
app.get("/livros/busca", async (req, res) => {
  try {
    const { titulo, autor, genero } = req.query;

    const filtro = {};

    if (titulo) filtro.titulo = { $regex: titulo, $options: "i" };
    if (autor) filtro.autor = autor;
    if (genero) filtro.genero = genero;

    const livros = await collection.find(filtro).toArray();

    res.json(livros);
  } catch (erro) {
    console.log("Erro no find:", erro);
    res.status(500).send("Erro no find");
  }
});*/

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

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});