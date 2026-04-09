const { MongoClient } = require("mongodb");

// COLE A SUA STRING DO MONGODB AQUI
const uri = "mongodb://127.0.0.1:27017";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const db = client.db("biblioteca"); // troca aqui
    const collection = db.collection("livros");

    const livros = await collection.find().toArray();
    console.log(livros);

  } catch (erro) {
    console.log("Erro:", erro);
  } finally {
    await client.close();
  }
}

run();