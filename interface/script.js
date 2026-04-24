async function adicionarLivro() {
  const titulo = document.getElementById("titulo").value;
  const autor = document.getElementById("autor").value;
  const genero = document.getElementById("genero").value;
  const exemplares = parseInt(document.getElementById("exemplares").value) || 0;

  await fetch("/livros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      titulo,
      autor,
      genero,
      exemplares,
      emprestimos: []
    })
  });

  alert("Livro adicionado!");
}

async function carregarLivros() {
  const res = await fetch("/livros");
  const livros = await res.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  livros.forEach(livro => {
    const li = document.createElement("li");

    li.innerHTML = `
       <img 
        src="/img/${livro.imagem || 'padrao.jpg'}" 
        alt="${livro.titulo}" 
        onerror="this.onerror=null; this.src='/img/padrao.png';"
       >
      <h3>${livro.titulo}</h3>
      <p>ID: ${livro._id}</p>
      <p>${livro.autor}</p>
      <p>${livro.genero}</p>
      <p>${livro.exemplares} exemplares</p>

      <button onclick="deletarLivro('${livro._id}')">🗑️ Excluir</button>
      <button onclick="editarLivro('${livro._id}')">✏️ Editar</button>
    `;

    lista.appendChild(li);
  });
}

async function editarLivro(id) {
  const novoTitulo = prompt("Novo título:");
  if (!novoTitulo) return;

  await fetch(`/livros/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ titulo: novoTitulo })
  });

  alert("Livro atualizado!");
  carregarLivros();
}

async function verRelatorio() {
  const res = await fetch("/livros/relatorio");
  const dados = await res.json();

  const lista = document.getElementById("relatorio");
  lista.innerHTML = "";

  dados.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item._id}: ${item.totalExemplares} exemplares`;
    lista.appendChild(li);
  });
}

async function buscarTopo() {
  const termo = document.getElementById("buscaTopo").value;

  const res = await fetch(`/livros/busca?termo=${encodeURIComponent(termo)}`);
  const livros = await res.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  livros.forEach(livro => {
    const li = document.createElement("li");

    li.innerHTML = `
       <img 
        src="/img/${livro.imagem || 'padrao.jpg'}" 
        alt="${livro.titulo}" 
        onerror="this.onerror=null; this.src='/img/padrao.png';"
       >
      <h3>${livro.titulo}</h3>
      <p>ID: ${livro._id}</p>
      <p>${livro.autor}</p>
      <p>${livro.genero}</p>
      <p>${livro.exemplares} exemplares</p>

      <button onclick="deletarLivro('${livro._id}')">🗑️ Excluir</button>
      <button onclick="editarLivro('${livro._id}')">✏️ Editar</button>
    `;

    lista.appendChild(li);
  });
}

async function deletarLivro(id) {
  await fetch(`/livros/${id}`, {
    method: "DELETE"
  });

  alert("Livro removido!");
  carregarLivros();
}