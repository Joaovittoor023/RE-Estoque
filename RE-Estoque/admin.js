document.addEventListener("DOMContentLoaded", () => {
    const url = "https://script.google.com/macros/s/AKfycbybbZFYKjHM1PP5uR6UNgqQR2kSV2-H0ZHphwWVs51k26X6TrXPXkpRHN_Oy6eqRBOZ/exec"; // coloque a URL publicada do Apps Script
    const msgBox = document.getElementById("mensagem");

    function mostrarMensagem(texto, sucesso = true) {
        msgBox.textContent = texto;
        msgBox.style.color = sucesso ? "green" : "red";
    }
    const back = (id, href) => { 
        const el = document.getElementById(id); 
        if (el) el.addEventListener("click", () => window.location.href = href); 
      };
      back("voltar-admin", "index.html");

    async function enviarPalavra(tipo, valor) {
        if (!confirm(`Tem certeza que deseja adicionar este ${tipo}: "${valor}" ?`)) {
            return;
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                body: new URLSearchParams({
                    action: "saveWord",
                    tipo: tipo,
                    word: valor
                })
            });

            const data = await res.json();

            if (data.status === "duplicado") {
                mostrarMensagem(`O ${tipo} "${valor}" já existe no auto-complete!`, false);
            } else if (data.status === "word_saved") {
                mostrarMensagem(`${tipo} "${valor}" adicionado com sucesso!`, true);
            } else {
                mostrarMensagem("Erro ao salvar, tente novamente.", false);
            }

        } catch (err) {
            mostrarMensagem("Erro de conexão: " + err.message, false);
        }
    }

    // Produto
    document.getElementById("AdminFormProduto").addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = document.getElementById("addProduto").value.trim();
        if (valor) enviarPalavra("produto", valor);
    });

    // Defeito
    document.getElementById("AdminFormDefeito").addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = document.getElementById("addDefeito").value.trim();
        if (valor) enviarPalavra("defeito", valor);
    });
});
