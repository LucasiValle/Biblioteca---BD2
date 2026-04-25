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

  document.getElementById("relatorio").innerHTML = "";
  document.getElementById("listaUsuarios").innerHTML = "";

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  livros.forEach(livro => {
    const li = document.createElement("li");

    const emprestados = livro.emprestimos ? livro.emprestimos.length : 0;
    const disponiveis = livro.exemplares - emprestados;

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
      <p>Total: ${livro.exemplares} exemplares</p>
      <p>Emprestados: ${emprestados}</p>
      <p>Disponíveis: ${disponiveis}</p>

      <button onclick="deletarLivro('${livro._id}')">🗑️ Excluir</button>
      <button onclick='abrirModalEditar(${JSON.stringify(livro)})'>✏️ Editar</button>
      <button onclick="abrirModalEmprestimo('${livro._id}')">📚 Emprestar</button>
    `;

    lista.appendChild(li);
  });
}

function abrirModalAdicionar() {
  document.getElementById("modalTitulo").textContent = "Adicionar Livro";

  document.getElementById("modalId").value = "";
  document.getElementById("modalIdManual").value = "";
  document.getElementById("modalIdManual").disabled = false;

  document.getElementById("modalTituloLivro").value = "";
  document.getElementById("modalAutor").value = "";
  document.getElementById("modalGenero").value = "";
  document.getElementById("modalExemplares").value = "";
  document.getElementById("modalImagem").value = "";

  document.getElementById("modalLivro").style.display = "flex";
}

function abrirModalEditar(livro) {
  document.getElementById("modalTitulo").textContent = "Editar Livro";

  document.getElementById("modalId").value = livro._id;
  document.getElementById("modalIdManual").value = livro._id;
  document.getElementById("modalIdManual").disabled = true;

  document.getElementById("modalTituloLivro").value = livro.titulo;
  document.getElementById("modalAutor").value = livro.autor;
  document.getElementById("modalGenero").value = livro.genero;
  document.getElementById("modalExemplares").value = livro.exemplares;
  document.getElementById("modalImagem").value = livro.imagem || "";

  document.getElementById("modalLivro").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modalLivro").style.display = "none";
}

async function salvarLivro() {
  const id = document.getElementById("modalId").value;
  const idManual = document.getElementById("modalIdManual").value;

  const livro = {
    titulo: document.getElementById("modalTituloLivro").value,
    autor: document.getElementById("modalAutor").value,
    genero: document.getElementById("modalGenero").value,
    exemplares: parseInt(document.getElementById("modalExemplares").value) || 0,
    imagem: document.getElementById("modalImagem").value || "padrao.jpg",
    emprestimos: []
  };

  if (id) {
    await fetch(`/livros/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(livro)
    });

    alert("Livro atualizado!");
  } else {
    livro._id = idManual;

    await fetch("/livros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(livro)
    });

    alert("Livro adicionado!");
  }

  fecharModal();
  carregarLivros();
}

async function verRelatorio() {
  const res = await fetch("/livros/relatorio");
  const dados = await res.json();

  document.getElementById("lista").innerHTML = "";
  document.getElementById("listaUsuarios").innerHTML = "";

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

  document.getElementById("relatorio").innerHTML = "";
  document.getElementById("listaUsuarios").innerHTML = "";

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  livros.forEach(livro => {
    const li = document.createElement("li");

    const emprestados = livro.emprestimos ? livro.emprestimos.length : 0;
    const disponiveis = livro.exemplares - emprestados;

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
      <p>Total: ${livro.exemplares} exemplares</p>
      <p>Emprestados: ${emprestados}</p>
      <p>Disponíveis: ${disponiveis}</p>

      <button onclick="deletarLivro('${livro._id}')">🗑️ Excluir</button>
     <button onclick='abrirModalEditar(${JSON.stringify(livro)})'>✏️ Editar</button>
     <button onclick="abrirModalEmprestimo('${livro._id}')">📚 Emprestar</button>
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

async function carregarUsuarios() {
  const res = await fetch("/usuarios");
  const usuarios = await res.json();

  const resLivros = await fetch("/livros");
  const livros = await resLivros.json();

  document.getElementById("lista").innerHTML = "";
  document.getElementById("relatorio").innerHTML = "";

  const lista = document.getElementById("listaUsuarios");
  lista.innerHTML = "";

  usuarios.forEach(usuario => {
    const li = document.createElement("li");

    const livrosDoUsuario = livros.filter(livro => {
      return livro.emprestimos && livro.emprestimos.includes(usuario._id);
    });

    let livrosEmprestados = "<p>Nenhum livro emprestado.</p>";

    if (livrosDoUsuario.length > 0) {
      livrosEmprestados = livrosDoUsuario.map(livro => {
        return `
          <p>
            📚 ${livro.titulo}
            <button onclick="devolverLivro('${livro._id}', '${usuario._id}')">Devolver</button>
          </p>
        `;
      }).join("");
    }

    li.innerHTML = `
      <h3>${usuario.nome}</h3>
      <p>ID: ${usuario._id}</p>
      <p>Email: ${usuario.email}</p>
      <p>Telefone: ${usuario.telefone}</p>

      <h4>Livros emprestados:</h4>
      ${livrosEmprestados}

      <button onclick='abrirModalEditarUsuario(${JSON.stringify(usuario)})'>✏️ Editar</button>
    `;

    lista.appendChild(li);
  });
}

function abrirModalAdicionarUsuario() {
  document.getElementById("modalTituloUsuario").textContent = "Adicionar Usuário";

  document.getElementById("usuarioId").value = "";
  document.getElementById("usuarioNome").value = "";
  document.getElementById("usuarioEmail").value = "";
  document.getElementById("usuarioTelefone").value = "";

  document.getElementById("usuarioId").disabled = false;

  document.getElementById("modalUsuario").style.display = "flex";
}

function abrirModalEditarUsuario(usuario) {
  document.getElementById("modalTituloUsuario").textContent = "Editar Usuário";

  document.getElementById("usuarioId").value = usuario._id;
  document.getElementById("usuarioNome").value = usuario.nome;
  document.getElementById("usuarioEmail").value = usuario.email;
  document.getElementById("usuarioTelefone").value = usuario.telefone;

  document.getElementById("usuarioId").disabled = true;

  document.getElementById("modalUsuario").style.display = "flex";
}

function fecharModalUsuario() {
  document.getElementById("modalUsuario").style.display = "none";
}

async function salvarUsuario() {
  const id = document.getElementById("usuarioId").value;

  const usuario = {
    _id: id,
    nome: document.getElementById("usuarioNome").value,
    email: document.getElementById("usuarioEmail").value,
    telefone: document.getElementById("usuarioTelefone").value
  };

  if (document.getElementById("usuarioId").disabled) {
    await fetch(`/usuarios/replace/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
    });

    alert("Usuário atualizado!");
  } else {
    await fetch("/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
    });

    alert("Usuário cadastrado!");
  }

  fecharModalUsuario();
  carregarUsuarios();
}


async function abrirModalEmprestimo(livroId) {
  document.getElementById("emprestimoLivroId").value = livroId;

  const res = await fetch("/usuarios");
  const usuarios = await res.json();

  const select = document.getElementById("selectUsuario");
  select.innerHTML = "";

  usuarios.forEach(u => {
    const option = document.createElement("option");
    option.value = u._id;
    option.textContent = u.nome;
    select.appendChild(option);
  });

  document.getElementById("modalEmprestimo").style.display = "flex";
}

function fecharModalEmprestimo() {
  document.getElementById("modalEmprestimo").style.display = "none";
}

async function confirmarEmprestimo() {
  const livroId = document.getElementById("emprestimoLivroId").value;
  const usuarioId = document.getElementById("selectUsuario").value;

  const res = await fetch("/emprestimos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      livroId,
      usuarioId
    })
  });

  const msg = await res.text();
  alert(msg);

  fecharModalEmprestimo();
  carregarLivros();
}

async function devolverLivro(livroId, usuarioId) {
  const res = await fetch("/devolucoes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      livroId,
      usuarioId
    })
  });

  const msg = await res.text();
  alert(msg);

  carregarUsuarios();
}