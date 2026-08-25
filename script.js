// ===============================
// SELEÇÃO DE ELEMENTOS DO DOM
// ===============================
// Aqui usamos querySelector para pegar elementos do HTML.
// Isso permite que o JavaScript leia campos, escute eventos
// e atualize a tela sem recarregar a página.

const form = document.querySelector("#transactionForm");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");

const transactionsList = document.querySelector("#transactionsList");
const filters = document.querySelectorAll(".filter");
const emptyState = document.querySelector("#emptyState");
const formMessage = document.querySelector("#formMessage");
const clearAllButton = document.querySelector("#clearAll");

const incomeTotal = document.querySelector("#incomeTotal");
const expenseTotal = document.querySelector("#expenseTotal");
const balanceTotal = document.querySelector("#balanceTotal");
const transactionCount = document.querySelector("#transactionCount");

// ===============================
// ESTADO DA APLICAÇÃO
// ===============================
// "Estado" representa os dados atuais da aplicação.
// Neste projeto, os lançamentos ficam em um array de objetos.

const STORAGE_KEY = "controle-gastos-pessoais";

let transactions = loadTransactions();
let currentFilter = "todos";

// ===============================
// DADOS INICIAIS
// ===============================
function createInitialTransactions() {
  const today = getToday();

  return [
    {
      id: Date.now() - 3,
      description: "Salário do mês",
      amount: 2500,
      type: "receita",
      category: "Trabalho",
      date: today,
    },
    {
      id: Date.now() - 2,
      description: "Compra no mercado",
      amount: 168.9,
      type: "despesa",
      category: "Alimentação",
      date: today,
    },
    {
      id: Date.now() - 1,
      description: "Passagem de transporte",
      amount: 42.5,
      type: "despesa",
      category: "Transporte",
      date: today,
    },
  ];
}

// ===============================
// FUNÇÃO: CARREGAR DADOS SALVOS
// ===============================
function loadTransactions() {
  const savedTransactions = localStorage.getItem(STORAGE_KEY);

  if (!savedTransactions) {
    return createInitialTransactions();
  }

  try {
    return JSON.parse(savedTransactions);
  } catch {
    return createInitialTransactions();
  }
}

// ===============================
// FUNÇÃO: SALVAR NO LOCALSTORAGE
// ===============================
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// ===============================
// FUNÇÃO: ADICIONAR LANÇAMENTO
// ===============================
function addTransaction(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;

  if (description === "" || Number.isNaN(amount) || amount <= 0 || date === "") {
    showMessage("Preencha descrição, valor válido e data.");
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date,
  };

  transactions.push(transaction);
  saveTransactions();
  renderTransactions();

  form.reset();
  dateInput.value = getToday();
  typeInput.value = "despesa";
  showMessage("Lançamento cadastrado com sucesso.");
}

// ===============================
// FUNÇÃO: RENDERIZAR LANÇAMENTOS
// ===============================
function renderTransactions() {
  transactionsList.innerHTML = "";

  let filteredTransactions = transactions;

  if (currentFilter === "receitas") {
    filteredTransactions = transactions.filter((transaction) => transaction.type === "receita");
  }

  if (currentFilter === "despesas") {
    filteredTransactions = transactions.filter((transaction) => transaction.type === "despesa");
  }

  filteredTransactions
    .slice()
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .forEach((transaction) => {
      const item = createTransactionElement(transaction);
      transactionsList.appendChild(item);
    });

  emptyState.classList.toggle("show", filteredTransactions.length === 0);
  updateSummary();
  updateCount(filteredTransactions.length);
}

// ===============================
// FUNÇÃO: CRIAR ITEM DA LISTA
// ===============================
function createTransactionElement(transaction) {
  const item = document.createElement("div");
  item.classList.add("transaction", transaction.type === "receita" ? "income" : "expense");

  const info = document.createElement("div");
  info.classList.add("transaction-info");

  const title = document.createElement("span");
  title.classList.add("transaction-title");
  title.textContent = transaction.description;

  const meta = document.createElement("small");
  meta.classList.add("transaction-meta");
  meta.textContent = `${transaction.category} - ${formatDate(transaction.date)}`;

  const amount = document.createElement("strong");
  amount.classList.add("transaction-amount", transaction.type === "receita" ? "income" : "expense");
  amount.textContent = `${transaction.type === "receita" ? "+" : "-"} ${formatCurrency(transaction.amount)}`;

  const removeButton = document.createElement("button");
  removeButton.classList.add("btn-remove");
  removeButton.type = "button";
  removeButton.title = "Remover lançamento";
  removeButton.setAttribute("aria-label", `Remover ${transaction.description}`);
  removeButton.textContent = "×";

  removeButton.addEventListener("click", () => {
    removeTransaction(transaction.id);
  });

  info.append(title, meta);
  item.append(info, amount, removeButton);

  return item;
}

// ===============================
// FUNÇÃO: REMOVER LANÇAMENTO
// ===============================
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  renderTransactions();
  showMessage("Lançamento removido.");
}

// ===============================
// FUNÇÃO: ATUALIZAR RESUMO
// ===============================
function updateSummary() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "receita")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "despesa")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  incomeTotal.textContent = formatCurrency(totalIncome);
  expenseTotal.textContent = formatCurrency(totalExpense);
  balanceTotal.textContent = formatCurrency(balance);

  balanceTotal.classList.toggle("green", balance >= 0);
  balanceTotal.classList.toggle("orange", balance < 0);
}

// ===============================
// FUNÇÃO: ATUALIZAR CONTADOR
// ===============================
function updateCount(total) {
  const label = total === 1 ? "item" : "itens";
  transactionCount.textContent = `${total} ${label}`;
}

// ===============================
// FUNÇÃO: LIMPAR TUDO
// ===============================
function clearAllTransactions() {
  if (transactions.length === 0) return;

  const confirmed = confirm("Deseja remover todos os lançamentos?");

  if (!confirmed) return;

  transactions = [];
  saveTransactions();
  renderTransactions();
  showMessage("Todos os lançamentos foram removidos.");
}

// ===============================
// FILTROS
// ===============================
filters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    filters.forEach((button) => button.classList.remove("active"));
    filterButton.classList.add("active");

    currentFilter = filterButton.dataset.filter;
    renderTransactions();
  });
});

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function showMessage(message) {
  formMessage.textContent = message;
}

// ===============================
// EVENTOS GERAIS
// ===============================
form.addEventListener("submit", addTransaction);
clearAllButton.addEventListener("click", clearAllTransactions);

// ===============================
// INICIALIZAÇÃO
// ===============================
dateInput.value = getToday();
renderTransactions();
