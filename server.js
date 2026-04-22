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

// Função assíncrona para conectar ao banco de dados
async function conectar() {
  // Abre a conexão com o MongoDB
  await client.connect();

  // Seleciona o banco de dados "biblioteca"
  const db = client.db("biblioteca");

  // Seleciona a coleção "livros"
  collection = db.collection("livros");

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

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});