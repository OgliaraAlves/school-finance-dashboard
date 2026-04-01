const mensagemSucesso = document.querySelector("#mensagem-sucesso")
const form = document.querySelector("#form-transacao")
const botaoAdicionar = document.querySelector(".botao-adicionar")
const descricaoInput = document.querySelector("#descricao")
const valorInput = document.querySelector("#valor")
const tipoInput = document.querySelector("#tipo")
const origemInput = document.querySelector("#origem")
const dataInput = document.querySelector("#data")

const saldoElemento = document.querySelector("#saldo")
const entradasElemento = document.querySelector("#entradas")
const saidasElemento = document.querySelector("#saidas")
const listaTransacoes = document.querySelector("#lista-transacoes")
const botaoLimparTudo = document.querySelector("#limpar-tudo")

let transacoes = JSON.parse(localStorage.getItem("transacoes-escolares")) || []

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
}

function formatarValorInput(valor) {
  valor = valor.replace(/\D/g, "")
  valor = (Number(valor) / 100).toFixed(2) + ""
  valor = valor.replace(".", ",")
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return valor
}

function converterValorParaNumero(valorFormatado) {
  return Number(
    valorFormatado
      .replace(/\./g, "")
      .replace(",", ".")
  )
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-")
  return `${dia}/${mes}/${ano}`
}

function salvarNoLocalStorage() {
  localStorage.setItem("transacoes-escolares", JSON.stringify(transacoes))
}

function atualizarResumo() {
  const entradas = transacoes
    .filter((transacao) => transacao.tipo === "entrada")
    .reduce((acumulador, transacao) => acumulador + transacao.valor, 0)

  const saidas = transacoes
    .filter((transacao) => transacao.tipo === "saida")
    .reduce((acumulador, transacao) => acumulador + transacao.valor, 0)

  const saldo = entradas - saidas

  saldoElemento.textContent = formatarMoeda(saldo)
  entradasElemento.textContent = formatarMoeda(entradas)
  saidasElemento.textContent = formatarMoeda(saidas)

  if (saldo < 0) {
    saldoElemento.style.color = "#f87171"
  } else if (saldo > 0) {
    saldoElemento.style.color = "#4ade80"
  } else {
    saldoElemento.style.color = "#f8fafc"
  }
}

function criarTransacaoHTML(transacao) {
  return `
    <div class="transacao animar">
      <span>${transacao.descricao}</span>
      <span class="valor ${transacao.tipo}">
        ${transacao.tipo === "entrada" ? "+" : "-"} ${formatarMoeda(transacao.valor)}
      </span>
      <span>${transacao.tipo === "entrada" ? "Entrada" : "Saída"}</span>
      <span>${transacao.origem}</span>
      <span>${formatarData(transacao.data)}</span>
      <button class="botao-excluir" onclick="excluirTransacao(${transacao.id})">Excluir</button>
    </div>
  `
}

function renderizarTransacoes() {
  if (transacoes.length === 0) {
    listaTransacoes.innerHTML = `<p class="mensagem-vazia">Nenhuma movimentação ainda. Adicione sua primeira entrada ou saída.</p>`
    return
  }

  transacoes.sort((a, b) => new Date(b.data) - new Date(a.data))

  listaTransacoes.innerHTML = transacoes
    .map((transacao) => criarTransacaoHTML(transacao))
    .join("")
}

function limparCampos() {
  descricaoInput.value = ""
  valorInput.value = ""
  tipoInput.value = ""
  origemInput.value = ""
  dataInput.value = ""
}

function mostrarMensagemSucesso() {
  mensagemSucesso.classList.remove("oculto")

  clearTimeout(mensagemSucesso.timeoutId)

  mensagemSucesso.timeoutId = setTimeout(() => {
    mensagemSucesso.classList.add("oculto")
  }, 2000)
}

function adicionarTransacao(event) {
  event.preventDefault()

  const descricao = descricaoInput.value.trim()
  const valor = converterValorParaNumero(valorInput.value)
  const tipo = tipoInput.value
  const origem = origemInput.value
  const data = dataInput.value

  if (!descricao || !valor || !tipo || !origem || !data) {
    alert("Preencha todos os campos.")
    return
  }

  botaoAdicionar.textContent = "Adicionando..."
  botaoAdicionar.disabled = true

  setTimeout(() => {
    const novaTransacao = {
      id: Date.now(),
      descricao,
      valor,
      tipo,
      origem,
      data
    }

    transacoes.push(novaTransacao)

    salvarNoLocalStorage()
    atualizarResumo()
    renderizarTransacoes()
    limparCampos()
    mostrarMensagemSucesso()

    botaoAdicionar.textContent = "Adicionar movimentação"
    botaoAdicionar.disabled = false
  }, 500)
}

function excluirTransacao(id) {
  transacoes = transacoes.filter((transacao) => transacao.id !== id)

  salvarNoLocalStorage()
  atualizarResumo()
  renderizarTransacoes()
}

function limparTudo() {
  const confirmar = confirm("Tem certeza que deseja apagar todas as movimentações?")

  if (!confirmar) return

  transacoes = []

  salvarNoLocalStorage()
  atualizarResumo()
  renderizarTransacoes()
}

valorInput.addEventListener("input", () => {
  valorInput.value = formatarValorInput(valorInput.value)
})

form.addEventListener("submit", adicionarTransacao)
botaoLimparTudo.addEventListener("click", limparTudo)

atualizarResumo()
renderizarTransacoes()

window.excluirTransacao = excluirTransacao