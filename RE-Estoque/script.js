document.addEventListener("DOMContentLoaded", () => {

    const url = "https://script.google.com/macros/s/AKfycbybbZFYKjHM1PP5uR6UNgqQR2kSV2-H0ZHphwWVs51k26X6TrXPXkpRHN_Oy6eqRBOZ/exec";
    const webAppUrl = url; // mesma URL para buscar e salvar
    const path = window.location.pathname;
  
    // --- LOGIN ---
    if (path.includes("index.html") || path === "/") {
      const loginForm = document.querySelector("form");
      if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const usuario = document.getElementById("usuario").value.trim();
          const senha = document.getElementById("senha").value.trim();
          const usuarios = { "maquina1": "321", "maquina2": "654", "admin": "987" };
  
          if (usuarios[usuario] && usuarios[usuario] === senha) {
            sessionStorage.setItem("usuario", usuario);
            window.location.href = (usuario === "admin") ? "admin.html" : "lotes.html";
          } else {
            alert("Usuário ou senha inválidos!");
          }
        });
      }
    }
  
    // --- BOTÕES VOLTAR ---
    const back = (id, href) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => window.location.href = href);
    };
    back("voltar-admin", "index.html");
    back("voltar-lotes", "index.html");
    back("voltar-produtos", "lotes.html");
  
    // --- LOTE ---
    const loteForm = document.getElementById("LoteForm");
    if (loteForm) {
      loteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const loteData = {
          nome: document.getElementById("idlote").value.trim(),
          tipoProduto: document.getElementById("infoprodutos").value,
          categoria: document.getElementById("categorialote").value,
          voltagem: document.getElementById("voltagem").value,
          numero: document.getElementById("nmrlote").value,
          obsLote: document.getElementById("obslote").value
        };
  
        if (!loteData.nome) {
          alert("Informe o nome do lote.");
          return;
        }
  
        sessionStorage.setItem("loteData", JSON.stringify(loteData));
        sessionStorage.setItem("qtdProdutos", "1");
  
        const params = new URLSearchParams();
        params.append("action", "salvarLote");
        params.append("nome", loteData.nome);
        params.append("tipoProduto", loteData.tipoProduto);
        params.append("categoria", loteData.categoria);
        params.append("voltagem", loteData.voltagem);
        params.append("numero", loteData.numero);
        params.append("obsLote", loteData.obsLote);
        params.append("usuario", sessionStorage.getItem("usuario") || "");
  
        try {
          await fetch(url, { method: "POST", body: params, mode: "no-cors" });
        } catch (err) {
          console.warn("fetch(lote) (no-cors) warn:", err);
        } finally {
          window.location.href = "produtos.html";
        }
      });
    }
  
    // --- PRODUTO ---
    const produtosForm = document.getElementById("ProdutosForm");
    if (produtosForm) {
      const qtdElement = document.querySelector("h3 b");
      let quantidade = parseInt(sessionStorage.getItem("qtdProdutos") || "1");
      if (qtdElement) qtdElement.textContent = quantidade.toString().padStart(2, "0");
  
      // carregar autocomplete ao abrir a página de produtos
      carregarListas();
  
      produtosForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const loteData = JSON.parse(sessionStorage.getItem("loteData") || "{}");
        const usuario = sessionStorage.getItem("usuario") || "";
  
        const produtoData = {
          produto: document.getElementById("descproduto").value.trim(),
          defeito: document.getElementById("defeitoproduto").value.trim(),
          obsProduto: document.getElementById("obsproduto").value.trim()
        };
  
        if (!loteData.nome) { alert("Lote não definido. Volte e inicie um lote."); return; }
        if (!produtoData.produto) { alert("Preencha a descrição do produto."); return; }
  
        const params = new URLSearchParams();
        params.append("action", "salvarProduto");
        params.append("nome", loteData.nome);
        params.append("produto", produtoData.produto);
        params.append("defeito", produtoData.defeito);
        params.append("obsProduto", produtoData.obsProduto);
        params.append("usuario", usuario);
  
        try {
          await fetch(url, { method: "POST", body: params, mode: "no-cors" });
  
          alert("Produto nº " + quantidade + " salvo com sucesso!");
          produtosForm.reset();
          quantidade++;
          sessionStorage.setItem("qtdProdutos", String(quantidade));
          if (qtdElement) qtdElement.textContent = quantidade.toString().padStart(2, "0");
        } catch (err) {
          console.warn("fetch(produto) (no-cors) warn:", err);
  
          alert("Produto salvo (não foi possível confirmar resposta).");
          produtosForm.reset();
          quantidade++;
          sessionStorage.setItem("qtdProdutos", String(quantidade));
          if (qtdElement) qtdElement.textContent = quantidade.toString().padStart(2, "0");
        }
      });
  
      // Botões Anterior/Próximo só como exemplo de navegação entre itens
      const btnAnterior = document.getElementById("anterior");
      const btnProximo = document.getElementById("proximo");
      if (btnAnterior) btnAnterior.addEventListener("click", () => window.history.back());
      if (btnProximo) btnProximo.addEventListener("click", () => {
        // coloque aqui a ação desejada ao clicar "Próximo"
        document.getElementById("descproduto").focus();
      });
    }
  
    // --- LISTAS AUTOCOMPLETE ---
    async function carregarListas() {
      // só tenta preencher se os datalists existirem
      const temLists = document.getElementById("listaProdutos") && document.getElementById("listaDefeitos");
      if (!temLists) return;
  
      try {
        const res = await fetch(`${webAppUrl}?action=getWords`);
        const data = await res.json();
  
        if (data.status === "success") {
          preencherDatalist("listaProdutos", data.produtos || []);
          preencherDatalist("listaDefeitos", data.defeitos || []);
        } else {
          console.warn("getWords não retornou success:", data);
        }
      } catch (err) {
        console.warn("Erro ao carregar listas:", err);
      }
    }
  
    function preencherDatalist(id, arr) {
      const datalist = document.getElementById(id);
      if (!datalist) return;
      datalist.innerHTML = "";
      arr.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        datalist.appendChild(option);
      });
    }
  
  });
  