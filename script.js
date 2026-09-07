// ===============================
// SELECAO DE ELEMENTOS DO DOM
// ===============================
// O DOM e a representacao do HTML dentro do navegador.
// Com querySelector, conseguimos pegar os elementos para ler valores,
// escutar eventos e atualizar a tela de forma dinamica.

const form = document.querySelector("#transactionForm");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");

const submitButton = document.querySelector(".btn-submit");
const cancelEditButton = document.querySelector("#cancelEdit");
const formModeLabel = document.querySelector("#formModeLabel");
const formMessage = document.querySelector("#formMessage");

const transactionsList = document.querySelector("#transactionsList");
const emptyState = document.querySelector("#emptyState");
const filters = document.querySelectorAll(".filter");
const searchInput = document.querySelector("#searchInput");
const clearAllButton = document.querySelector("#clearAll");
const transactionCount = document.querySelector("#transactionCount");

const incomeTotal = document.querySelector("#incomeTotal");
const expenseTotal = document.querySelector("#expenseTotal");
const balanceTotal = document.querySelector("#balanceTotal");
const currentTime = document.querySelector("#currentTime");
const currentDate = document.querySelector("#currentDate");

// ===============================
// FUNCOES AUXILIARES
// ===============================
// Estas funcoes pequenas evitam repeticao e deixam o codigo principal
// mais facil de ler e explicar.

// Retorna a data atual no formato usado pelo input type="date".
const getToday = () => new Date().toISOString().split("T")[0];

// Formata numeros como moeda brasileira.
const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

// Formata a data salva no objeto para o padrao brasileiro.
const formatDate = (date) => {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return parsedDate.toLocaleDateString("pt-BR");
};

// Mostra mensagens de erro, sucesso ou informacao abaixo do formulario.
const showMessage = (message, type = "info") => {
  formMessage.textContent = message;
  formMessage.dataset.type = type;
};

// Atualiza o cartao do topo com a hora e a data reais do navegador.
const updateClock = () => {
  const now = new Date();

  currentTime.textContent = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  currentDate.textContent = now.toLocaleDateString("pt-BR");
};

// ===============================
// DADOS E ESTADO DA APLICACAO
// ===============================
// O array transactions guarda objetos. Cada objeto representa uma
// movimentacao financeira cadastrada pelo usuario.

const STORAGE_KEY = "controle-gastos-pessoais";

// Cria alguns dados iniciais para a tela nao comecar vazia.
const createInitialTransactions = () => {
  const today = getToday();

  return [
    {
      id: Date.now() - 3,
      description: "Salário do mês",
      amount: 2500,
      type: "receita",
      category: "Trabalho",
      date: today,
      checked: true,
    },
    {
      id: Date.now() - 2,
      description: "Compra no mercado",
      amount: 168.9,
      type: "despesa",
      category: "Alimentação",
      date: today,
      checked: false,
    },
    {
      id: Date.now() - 1,
      description: "Passagem de transporte",
      amount: 42.5,
      type: "despesa",
      category: "Transporte",
      date: today,
      checked: false,
    },
  ];
};

// Carrega os dados salvos no localStorage.
// Se nao houver dados salvos, usamos os exemplos iniciais.
const loadTransactions = () => {
  const savedTransactions = localStorage.getItem(STORAGE_KEY);

  if (!savedTransactions) {
    return createInitialTransactions();
  }

  try {
    const parsedTransactions = JSON.parse(savedTransactions);

    if (!Array.isArray(parsedTransactions)) {
      return createInitialTransactions();
    }

    // map() percorre o array e devolve um novo array tratado.
    // O spread operator (...) copia as propriedades originais do objeto.
    return parsedTransactions.map((transaction) => {
      const amount = Number(transaction.amount);

      return {
        ...transaction,
        description: transaction.description || "Sem descrição",
        amount: Number.isNaN(amount) ? 0 : amount,
        type: transaction.type === "receita" ? "receita" : "despesa",
        category: transaction.category || "Outros",
        date: transaction.date || getToday(),
        checked: Boolean(transaction.checked),
      };
    });
  } catch {
    return createInitialTransactions();
  }
};

let transactions = loadTransactions();
let currentFilter = "todos";
let editingId = null;

// Salva o array atual no navegador para manter os dados ao recarregar a pagina.
const saveTransactions = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

// ===============================
// FORMULARIO
// ===============================
// Esta area concentra leitura, validacao, cadastro e edicao.

// Pega os valores digitados e monta um objeto com os mesmos campos da lista.
const getFormData = () => ({
  description: descriptionInput.value.trim(),
  amount: Number(amountInput.value),
  type: typeInput.value,
  category: categoryInput.value,
  date: dateInput.value,
});

// Valida os campos antes de cadastrar ou editar.
const validateTransaction = (transactionData) => {
  if (transactionData.description === "") {
    return "Informe uma descrição.";
  }

  if (Number.isNaN(transactionData.amount) || transactionData.amount <= 0) {
    return "Informe um valor maior que zero.";
  }

  if (transactionData.category === "") {
    return "Escolha uma categoria.";
  }

  if (transactionData.date === "") {
    return "Informe uma data.";
  }

  return "";
};

// Volta o formulario para o modo de cadastro.
const resetForm = () => {
  form.reset();
  dateInput.value = getToday();
  typeInput.value = "despesa";
  editingId = null;
  submitButton.textContent = "Cadastrar movimentação";
  cancelEditButton.hidden = true;
  formModeLabel.textContent = "Registro";
  form.classList.remove("editing");
};

// Cadastra uma nova movimentacao.
const createTransaction = (transactionData) => {
  const newTransaction = {
    ...transactionData,
    id: Date.now(),
    checked: false,
  };

  // Spread operator em array: coloca o novo item no comeco sem alterar
  // diretamente o array anterior.
  transactions = [newTransaction, ...transactions];

  saveTransactions();
  renderTransactions();
  resetForm();
  showMessage("Movimentação cadastrada com sucesso.", "success");
};

// Atualiza uma movimentacao existente.
const updateTransaction = (id, transactionData) => {
  // map() e usado porque queremos percorrer todos os itens e alterar
  // apenas aquele que possui o id selecionado.
  transactions = transactions.map((transaction) => {
    if (transaction.id !== id) {
      return transaction;
    }

    // Spread operator em objeto: mantem id/checked e troca os dados editados.
    return {
      ...transaction,
      ...transactionData,
    };
  });

  saveTransactions();
  renderTransactions();
  resetForm();
  showMessage("Movimentação atualizada com sucesso.", "success");
};

// Preenche o formulario com os dados do item escolhido para edicao.
const startEdit = (id) => {
  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === id,
  );

  if (!selectedTransaction) {
    showMessage("Movimentação não encontrada.", "error");
    return;
  }

  editingId = id;
  descriptionInput.value = selectedTransaction.description;
  amountInput.value = selectedTransaction.amount;
  typeInput.value = selectedTransaction.type;
  categoryInput.value = selectedTransaction.category;
  dateInput.value = selectedTransaction.date;

  submitButton.textContent = "Salvar alteração";
  cancelEditButton.hidden = false;
  formModeLabel.textContent = "Editando";
  form.classList.add("editing");

  showMessage("Edite os campos e salve a alteração.", "info");
  descriptionInput.focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
};

// Decide se o formulario deve cadastrar um novo item ou editar um existente.
const handleSubmit = (event) => {
  event.preventDefault();

  const transactionData = getFormData();
  const validationMessage = validateTransaction(transactionData);

  if (validationMessage !== "") {
    showMessage(validationMessage, "error");
    return;
  }

  if (editingId === null) {
    createTransaction(transactionData);
    return;
  }

  updateTransaction(editingId, transactionData);
};

// ===============================
// LISTA DE MOVIMENTACOES
// ===============================
// As funcoes abaixo filtram os dados e criam os elementos HTML pela tela.

// Filtra por tipo e tambem pelo texto digitado no campo de busca.
const getFilteredTransactions = () => {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return transactions.filter((transaction) => {
    const matchesType =
      currentFilter === "todos" ||
      (currentFilter === "receitas" && transaction.type === "receita") ||
      (currentFilter === "despesas" && transaction.type === "despesa");

    const searchableText = `${transaction.description} ${transaction.category}`
      .toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm);

    return matchesType && matchesSearch;
  });
};

// Cria um item visual da lista usando document.createElement.
const createTransactionElement = (transaction) => {
  const item = document.createElement("article");
  item.classList.add(
    "transaction",
    transaction.type === "receita" ? "income" : "expense",
  );

  if (transaction.checked) {
    item.classList.add("checked");
  }

  const checkbox = document.createElement("input");
  checkbox.classList.add("transaction-check");
  checkbox.type = "checkbox";
  checkbox.checked = transaction.checked;
  checkbox.setAttribute(
    "aria-label",
    `Marcar ${transaction.description} como conferida`,
  );

  const info = document.createElement("div");
  info.classList.add("transaction-info");

  const title = document.createElement("span");
  title.classList.add("transaction-title");
  title.textContent = transaction.description;

  const typeLabel = transaction.type === "receita" ? "Entrada" : "Saída";

  const meta = document.createElement("small");
  meta.classList.add("transaction-meta");
  meta.textContent = `${typeLabel} - ${transaction.category} - ${formatDate(
    transaction.date,
  )}`;

  const amount = document.createElement("strong");
  amount.classList.add(
    "transaction-amount",
    transaction.type === "receita" ? "income" : "expense",
  );
  amount.textContent = `${transaction.type === "receita" ? "+" : "-"} ${formatCurrency(
    transaction.amount,
  )}`;

  const actions = document.createElement("div");
  actions.classList.add("transaction-actions");

  const editButton = document.createElement("button");
  editButton.classList.add("btn-edit");
  editButton.type = "button";
  editButton.textContent = "Editar";
  editButton.setAttribute("aria-label", `Editar ${transaction.description}`);

  const removeButton = document.createElement("button");
  removeButton.classList.add("btn-remove");
  removeButton.type = "button";
  removeButton.textContent = "Excluir";
  removeButton.setAttribute("aria-label", `Excluir ${transaction.description}`);

  checkbox.addEventListener("change", () => toggleChecked(transaction.id));
  editButton.addEventListener("click", () => startEdit(transaction.id));
  removeButton.addEventListener("click", () => removeTransaction(transaction.id));

  info.append(title, meta);
  actions.append(editButton, removeButton);
  item.append(checkbox, info, amount, actions);

  return item;
};

// Renderiza a lista de acordo com os dados, filtro atual e busca.
const renderTransactions = () => {
  const filteredTransactions = getFilteredTransactions();

  transactionsList.innerHTML = "";

  // O spread operator copia o array antes do sort, evitando mexer na ordem
  // original dos dados salvos.
  const orderedTransactions = [...filteredTransactions].sort(
    (first, second) => new Date(second.date) - new Date(first.date),
  );

  // map() transforma cada objeto em um elemento HTML.
  const transactionElements = orderedTransactions.map(createTransactionElement);

  transactionElements.forEach((element) => {
    transactionsList.appendChild(element);
  });

  emptyState.classList.toggle("show", orderedTransactions.length === 0);
  updateCount(orderedTransactions.length);
  updateSummary();
};

// Marca ou desmarca uma movimentacao como conferida.
const toggleChecked = (id) => {
  transactions = transactions.map((transaction) => {
    if (transaction.id !== id) {
      return transaction;
    }

    return {
      ...transaction,
      checked: !transaction.checked,
    };
  });

  saveTransactions();
  renderTransactions();
};

// Remove uma movimentacao da lista.
const removeTransaction = (id) => {
  const confirmed = confirm("Deseja excluir esta movimentação?");

  if (!confirmed) {
    return;
  }

  transactions = transactions.filter((transaction) => transaction.id !== id);

  if (editingId === id) {
    resetForm();
  }

  saveTransactions();
  renderTransactions();
  showMessage("Movimentação excluída.", "info");
};

// Remove todas as movimentacoes cadastradas.
const clearAllTransactions = () => {
  if (transactions.length === 0) {
    showMessage("Não existem movimentações para limpar.", "info");
    return;
  }

  const confirmed = confirm("Deseja remover todas as movimentações?");

  if (!confirmed) {
    return;
  }

  transactions = [];
  resetForm();
  saveTransactions();
  renderTransactions();
  showMessage("Todas as movimentações foram removidas.", "info");
};

// ===============================
// RESUMO FINANCEIRO
// ===============================
// O resumo usa reduce() para somar entradas e saidas em um unico objeto.

const updateSummary = () => {
  const totals = transactions.reduce(
    (accumulator, transaction) => {
      if (transaction.type === "receita") {
        return {
          ...accumulator,
          income: accumulator.income + transaction.amount,
        };
      }

      return {
        ...accumulator,
        expense: accumulator.expense + transaction.amount,
      };
    },
    {
      income: 0,
      expense: 0,
    },
  );

  const balance = totals.income - totals.expense;

  incomeTotal.textContent = formatCurrency(totals.income);
  expenseTotal.textContent = formatCurrency(totals.expense);
  balanceTotal.textContent = formatCurrency(balance);

  balanceTotal.classList.toggle("positive", balance >= 0);
  balanceTotal.classList.toggle("negative", balance < 0);
};

// Atualiza o contador exibido no topo da lista.
const updateCount = (total) => {
  const label = total === 1 ? "item" : "itens";
  transactionCount.textContent = `${total} ${label}`;
};

// ===============================
// EVENTOS
// ===============================
// Eventos conectam as acoes do usuario com as funcoes da aplicacao.

form.addEventListener("submit", handleSubmit);

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edição cancelada.", "info");
});

clearAllButton.addEventListener("click", clearAllTransactions);

searchInput.addEventListener("input", renderTransactions);

filters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    filters.forEach((button) => button.classList.remove("active"));

    filterButton.classList.add("active");
    currentFilter = filterButton.dataset.filter;

    renderTransactions();
  });
});

// ===============================
// INICIALIZACAO
// ===============================
// Define a data inicial e chama a primeira renderizacao da interface.

resetForm();
updateClock();
renderTransactions();

// setInterval executa a funcao novamente a cada 1000ms, ou seja, a cada segundo.
setInterval(updateClock, 1000);
