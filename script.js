// ============================================================
// CONTROLE DE GASTOS PESSOAIS - JAVASCRIPT PURO
// ============================================================
// Este arquivo controla toda a parte dinâmica do projeto.
//
// Fluxo principal para estudar:
// 1. O JavaScript pega os elementos do HTML com querySelector.
// 2. O usuário preenche o formulário e envia uma movimentação.
// 3. Os dados viram um objeto dentro do array "transactions".
// 4. A função renderTransactions() redesenha a lista na tela.
// 5. A função updateSummary() recalcula entradas, saídas e saldo.
// 6. O localStorage salva tudo no navegador para não perder ao atualizar.
//
// Técnicas exigidas na atividade:
// - Array de objetos;
// - Funções com responsabilidades separadas;
// - Arrow Functions;
// - map();
// - filter();
// - reduce();
// - Spread Operator (...);
// - Manipulação do DOM;
// - Eventos;
// - localStorage.

// ============================================================
// 1. SELEÇÃO DE ELEMENTOS DO DOM
// ============================================================
// DOM significa "Document Object Model".
// É como o navegador organiza o HTML para o JavaScript conseguir acessar.
//
// querySelector("#id") pega um elemento pelo id.
// querySelector(".classe") pega um elemento pela classe.
// querySelectorAll(".classe") pega vários elementos e retorna uma lista.

// Elementos do formulário.
const form = document.querySelector("#transactionForm");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");

// Elementos que mudam quando o usuário cadastra ou edita.
const submitButton = document.querySelector(".btn-submit");
const cancelEditButton = document.querySelector("#cancelEdit");
const formModeLabel = document.querySelector("#formModeLabel");
const formMessage = document.querySelector("#formMessage");

// Elementos da lista, filtros e busca.
const transactionsList = document.querySelector("#transactionsList");
const emptyState = document.querySelector("#emptyState");
const filters = document.querySelectorAll(".filter");
const searchInput = document.querySelector("#searchInput");
const clearAllButton = document.querySelector("#clearAll");
const transactionCount = document.querySelector("#transactionCount");

// Elementos dos cards de resumo financeiro.
const incomeTotal = document.querySelector("#incomeTotal");
const expenseTotal = document.querySelector("#expenseTotal");
const balanceTotal = document.querySelector("#balanceTotal");

// Elementos do relógio do topo.
const currentTime = document.querySelector("#currentTime");
const currentDate = document.querySelector("#currentDate");

// ============================================================
// 2. FUNÇÕES AUXILIARES
// ============================================================

// Retorna a data atual no formato yyyy-mm-dd, que é o formato aceito pelo input type="date".
// Foi feito com getFullYear/getMonth/getDate para respeitar a data local do computador.
const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Recebe um número e devolve esse número formatado em Real brasileiro.
// Exemplo: 1500 vira "R$ 1.500,00".
const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

// Recebe uma data no formato yyyy-mm-dd e mostra no formato brasileiro.
// Exemplo: "2026-09-08" vira "08/09/2026".
const formatDate = (date) => {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return parsedDate.toLocaleDateString("pt-BR");
};

// Exibe uma mensagem abaixo do formulário.
// O tipo muda a cor pelo CSS: success, error ou info.
const showMessage = (message, type = "info") => {
  formMessage.textContent = message;
  formMessage.dataset.type = type;
};

// Atualiza o cartão do topo com hora e data reais.
// setInterval, no final do arquivo, chama essa função a cada segundo.
const updateClock = () => {
  const now = new Date();

  currentTime.textContent = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  currentDate.textContent = now.toLocaleDateString("pt-BR");
};

// ============================================================
// 3. DADOS E ESTADO DA APLICAÇÃO
// ============================================================
// "Estado" é o conjunto de dados atuais da aplicação.
//
// Neste projeto, o estado principal é:
// let transactions = [...]
//
// Ele é um array de objetos. Cada objeto tem este formato:
// {
//   id: identificador único,
//   description: texto da movimentação,
//   amount: valor numérico,
//   type: "receita" ou "despesa",
//   category: categoria escolhida,
//   date: data da movimentação,
//   checked: se foi marcada como conferida
// }

// Nome usado para salvar e buscar os dados no localStorage.
const STORAGE_KEY = "controle-gastos-pessoais";

// Carrega as movimentações salvas no navegador.
// localStorage guarda apenas texto, por isso usamos JSON.parse para transformar o texto em array.
const loadTransactions = () => {
  const savedTransactions = localStorage.getItem(STORAGE_KEY);

  // Se não existir nada salvo, a aplicação começa com os exemplos.
  if (!savedTransactions) {
    return createInitialTransactions();
  }

  try {
    const parsedTransactions = JSON.parse(savedTransactions);

    // Esta proteção evita erro caso o dado salvo não seja um array.
    if (!Array.isArray(parsedTransactions)) {
      return createInitialTransactions();
    }

    // map() percorre o array salvo e cria um novo array tratado.
    // Aqui ele garante que amount seja número e que checked seja booleano.
    return parsedTransactions.map((transaction) => {
      const amount = Number(transaction.amount);

      // Spread Operator (...transaction) copia o objeto original.
      // Depois dele, podemos sobrescrever campos específicos com valores seguros.
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
    // Se o JSON estiver quebrado, o projeto não trava.
    // Ele apenas volta para os dados iniciais.
    return createInitialTransactions();
  }
};

// transactions guarda todas as movimentações que aparecem no sistema.
let transactions = loadTransactions();

// currentFilter controla qual filtro está ativo: todos, receitas ou despesas.
let currentFilter = "todos";

// editingId guarda o id do item que está sendo editado.
// Quando é null, significa que o formulário está em modo de cadastro.
let editingId = null;

// Salva o array transactions no navegador.
// JSON.stringify transforma o array em texto, porque localStorage só salva strings.
const saveTransactions = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

// ============================================================
// 4. FORMULÁRIO: LER, VALIDAR, CADASTRAR E EDITAR
// ============================================================
// Esta parte controla tudo que acontece quando o usuário usa o formulário.

// Lê os campos do formulário e monta um objeto.
// Esse objeto ainda não tem id nem checked; esses campos entram no cadastro.
const getFormData = () => ({
  description: descriptionInput.value.trim(),
  amount: Number(amountInput.value),
  type: typeInput.value,
  category: categoryInput.value,
  date: dateInput.value,
});

// Valida os dados antes de cadastrar ou editar.
// Em vez de cadastrar direto, primeiro conferimos se está tudo correto.
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

  // String vazia significa que não existe erro.
  return "";
};

// Limpa o formulário e volta para o modo padrão de cadastro.
// Também esconde o botão "Cancelar edição".
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

// Cadastra uma nova movimentação no array.
const createTransaction = (transactionData) => {
  const newTransaction = {
    ...transactionData,
    id: Date.now(),
    checked: false,
  };

  // Spread Operator em array:
  // [newTransaction, ...transactions] cria um novo array com o item novo no começo.
  // Isso evita mexer diretamente no array antigo e deixa a atualização mais controlada.
  transactions = [newTransaction, ...transactions];

  saveTransactions();
  renderTransactions();
  resetForm();
  showMessage("Movimentação cadastrada com sucesso.", "success");
};

// Edita uma movimentação existente.
const updateTransaction = (id, transactionData) => {
  // map() é ideal aqui porque ele percorre o array e retorna um novo array.
  // Se o id for diferente, o item volta igual.
  // Se o id for igual, o item volta atualizado.
  transactions = transactions.map((transaction) => {
    if (transaction.id !== id) {
      return transaction;
    }

    // Primeiro copiamos o objeto antigo com ...transaction.
    // Depois aplicamos os novos dados com ...transactionData.
    // Assim, o id e o checked continuam existindo.
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

// Inicia o modo de edição.
// Quando o usuário clica em "Editar", os dados do item aparecem no formulário.
const startEdit = (id) => {
  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === id,
  );

  if (!selectedTransaction) {
    showMessage("Movimentação não encontrada.", "error");
    return;
  }

  // Guardamos o id para o handleSubmit saber que deve editar, não cadastrar.
  editingId = id;

  // Preenche cada campo do formulário com os dados já cadastrados.
  descriptionInput.value = selectedTransaction.description;
  amountInput.value = selectedTransaction.amount;
  typeInput.value = selectedTransaction.type;
  categoryInput.value = selectedTransaction.category;
  dateInput.value = selectedTransaction.date;

  // Muda textos e estilos para deixar claro que o usuário está editando.
  submitButton.textContent = "Salvar alteração";
  cancelEditButton.hidden = false;
  formModeLabel.textContent = "Editando";
  form.classList.add("editing");

  showMessage("Edite os campos e salve a alteração.", "info");
  descriptionInput.focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
};

// Controla o envio do formulário.
// Esta função decide entre cadastrar um item novo ou salvar uma edição.
const handleSubmit = (event) => {
  event.preventDefault();

  const transactionData = getFormData();
  const validationMessage = validateTransaction(transactionData);

  if (validationMessage !== "") {
    showMessage(validationMessage, "error");
    return;
  }

  // Se editingId for null, é cadastro.
  if (editingId === null) {
    createTransaction(transactionData);
    return;
  }

  // Se editingId tiver um id, é edição.
  updateTransaction(editingId, transactionData);
};

// ============================================================
// 5. LISTA: FILTRAR, BUSCAR E RENDERIZAR
// ============================================================
// Renderizar significa transformar os dados do JavaScript em elementos visuais no HTML.

// Aplica o filtro escolhido e o texto digitado na busca.
const getFilteredTransactions = () => {
  const searchTerm = searchInput.value.trim().toLowerCase();

  // filter() devolve apenas os itens que passam na condição.
  return transactions.filter((transaction) => {
    const matchesType =
      currentFilter === "todos" ||
      (currentFilter === "receitas" && transaction.type === "receita") ||
      (currentFilter === "despesas" && transaction.type === "despesa");

    // Juntamos descrição e categoria para permitir busca nos dois campos.
    const searchableText =
      `${transaction.description} ${transaction.category}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm);

    return matchesType && matchesSearch;
  });
};

// Cria um elemento HTML para uma movimentação.
// Esta função não altera o array; ela só monta a parte visual.
const createTransactionElement = (transaction) => {
  const item = document.createElement("article");

  // A classe income ou expense muda a cor do item pelo CSS.
  item.classList.add(
    "transaction",
    transaction.type === "receita" ? "income" : "expense",
  );

  if (transaction.checked) {
    item.classList.add("checked");
  }

  // Checkbox para marcar uma movimentação como conferida.
  const checkbox = document.createElement("input");
  checkbox.classList.add("transaction-check");
  checkbox.type = "checkbox";
  checkbox.checked = transaction.checked;
  checkbox.setAttribute(
    "aria-label",
    `Marcar ${transaction.description} como conferida`,
  );

  // Div que guarda descrição, tipo, categoria e data.
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

  // Valor aparece com sinal positivo para entrada e negativo para saída.
  const amount = document.createElement("strong");
  amount.classList.add(
    "transaction-amount",
    transaction.type === "receita" ? "income" : "expense",
  );
  amount.textContent = `${transaction.type === "receita" ? "+" : "-"} ${formatCurrency(
    transaction.amount,
  )}`;

  // Botões de ação do item.
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

  // Eventos específicos deste item.
  // As arrow functions permitem passar o id correto para cada ação.
  checkbox.addEventListener("change", () => toggleChecked(transaction.id));
  editButton.addEventListener("click", () => startEdit(transaction.id));
  removeButton.addEventListener("click", () =>
    removeTransaction(transaction.id),
  );

  // append coloca os elementos dentro de outros elementos.
  info.append(title, meta);
  actions.append(editButton, removeButton);
  item.append(checkbox, info, amount, actions);

  return item;
};

// Renderiza a lista completa na tela.
// Sempre que algo muda no array, chamamos esta função novamente.
const renderTransactions = () => {
  const filteredTransactions = getFilteredTransactions();

  // Limpa a lista antes de montar tudo de novo.
  transactionsList.innerHTML = "";

  // Copiamos o array com spread antes do sort.
  // Motivo: sort() altera o array original, então usamos uma cópia para preservar os dados.
  const orderedTransactions = [...filteredTransactions].sort(
    (first, second) => new Date(second.date) - new Date(first.date),
  );

  // map() transforma cada objeto financeiro em um elemento HTML.
  const transactionElements = orderedTransactions.map(createTransactionElement);

  // forEach() coloca cada elemento criado dentro da lista do HTML.
  transactionElements.forEach((element) => {
    transactionsList.appendChild(element);
  });

  // Mostra a mensagem vazia apenas quando não há itens no filtro atual.
  emptyState.classList.toggle("show", orderedTransactions.length === 0);

  updateCount(orderedTransactions.length);
  updateSummary();
};

// Marca ou desmarca uma movimentação como conferida.
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

// Exclui uma movimentação pelo id.
const removeTransaction = (id) => {
  const confirmed = confirm("Deseja excluir esta movimentação?");

  if (!confirmed) {
    return;
  }

  // filter() cria um novo array sem o item que possui o id recebido.
  transactions = transactions.filter((transaction) => transaction.id !== id);

  // Se o usuário estava editando exatamente esse item, o formulário é resetado.
  if (editingId === id) {
    resetForm();
  }

  saveTransactions();
  renderTransactions();
  showMessage("Movimentação excluída.", "info");
};

// Exclui todas as movimentações.
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

// ============================================================
// 6. RESUMO FINANCEIRO
// ============================================================
// Esta parte calcula:
// - Total de entradas;
// - Total de saídas;
// - Saldo final.

const updateSummary = () => {
  // reduce() transforma o array inteiro em um único resultado.
  // Neste caso, o resultado é um objeto com income e expense.
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

  // Essas classes mudam a cor do saldo final dependendo do resultado.
  balanceTotal.classList.toggle("positive", balance >= 0);
  balanceTotal.classList.toggle("negative", balance < 0);
};

// Atualiza o contador que aparece no topo da lista.
const updateCount = (total) => {
  const label = total === 1 ? "item" : "itens";
  transactionCount.textContent = `${total} ${label}`;
};

// ============================================================
// 7. EVENTOS
// ============================================================
// Eventos ligam ações do usuário às funções do código.
// Exemplos: clicar, enviar formulário, digitar no campo de busca.

// Quando o formulário é enviado, chama a função que cadastra ou edita.
form.addEventListener("submit", handleSubmit);

// Cancela uma edição em andamento e volta para o modo de cadastro.
cancelEditButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edição cancelada.", "info");
});

// Remove todos os registros após confirmação.
clearAllButton.addEventListener("click", clearAllTransactions);

// A cada letra digitada na busca, a lista é renderizada novamente.
searchInput.addEventListener("input", renderTransactions);

// Cada botão de filtro recebe um evento de clique.
filters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    // Remove a classe active de todos os filtros.
    filters.forEach((button) => button.classList.remove("active"));

    // Marca o botão clicado como ativo.
    filterButton.classList.add("active");

    // Atualiza o filtro atual com o valor do data-filter do HTML.
    currentFilter = filterButton.dataset.filter;

    renderTransactions();
  });
});

// ============================================================
// 8. INICIALIZAÇÃO
// ============================================================
// Este bloco roda assim que o arquivo JavaScript é carregado.

// Prepara o formulário com a data atual.
resetForm();

// Mostra a hora atual imediatamente.
updateClock();

// Mostra as movimentações e os totais assim que a página abre.
renderTransactions();

// Atualiza o relógio a cada segundo.
// 1000 milissegundos = 1 segundo.
setInterval(updateClock, 1000);
