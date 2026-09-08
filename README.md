# Hawkins Finance - Controle de Gastos Pessoais

Aplicação web desenvolvida com **HTML, CSS e JavaScript puro** para controle de gastos pessoais. O sistema permite cadastrar entradas e saídas, organizar por categoria, editar, excluir, filtrar, buscar movimentações e visualizar o resumo financeiro com total de entradas, total de saídas e saldo final.

O visual foi criado com uma proposta retrô inspirada em luzes coloridas e clima de suspense, mas a estrutura do código segue uma lógica simples, parecida com uma To-Do List: os dados ficam em um array, a interface é renderizada dinamicamente e cada ação do usuário atualiza o estado da aplicação.

## Funcionalidades

- Cadastrar movimentações financeiras.
- Escolher se a movimentação é **Entrada** ou **Saída**.
- Informar descrição, categoria, valor e data.
- Editar uma movimentação já cadastrada.
- Excluir uma movimentação individual.
- Limpar todas as movimentações.
- Listar os registros cadastrados.
- Filtrar por todos, entradas ou saídas.
- Buscar por descrição ou categoria.
- Exibir o **Total de Entradas**.
- Exibir o **Total de Saídas**.
- Calcular e exibir o **Saldo Final**.
- Validar os dados antes de cadastrar.
- Salvar os dados no navegador usando `localStorage`.
- Atualizar a tela dinamicamente usando JavaScript.

## Arquivos

- `index.html`: estrutura da página. Contém o topo, os cards de resumo, o formulário, os filtros, a busca e a área onde a lista será criada pelo JavaScript.
- `style.css`: aparência da aplicação. Define cores, fontes, espaçamentos, responsividade, animação das luzes, cards, botões, formulário e lista.
- `script.js`: lógica principal. Controla cadastro, edição, exclusão, filtros, busca, resumo financeiro, relógio e salvamento local.

## Como o projeto funciona

O projeto funciona em três partes:

1. **HTML:** cria os elementos que aparecem na tela.
2. **CSS:** deixa a interface bonita, responsiva e personalizada.
3. **JavaScript:** faz a aplicação funcionar de verdade, manipulando dados e atualizando o HTML.

O JavaScript pega os dados digitados no formulário, cria um objeto para representar a movimentação e coloca esse objeto dentro do array `transactions`. Depois disso, a função `renderTransactions()` redesenha a lista na tela e a função `updateSummary()` recalcula os valores dos cards.

## Estrutura dos dados

Cada movimentação é um objeto dentro do array `transactions`.

Exemplo:

```js
{
  id: 1720000000000,
  description: "Compra no mercado",
  amount: 168.9,
  type: "despesa",
  category: "Alimentação",
  date: "2026-09-08",
  checked: false
}
```

Explicação dos campos:

- `id`: identifica cada movimentação. Ele é usado para editar, excluir e marcar o item correto.
- `description`: guarda o texto digitado pelo usuário.
- `amount`: guarda o valor da movimentação.
- `type`: define se é `receita` ou `despesa`.
- `category`: guarda a categoria escolhida.
- `date`: guarda a data cadastrada.
- `checked`: indica se a movimentação foi marcada como conferida.

## Principais funções do JavaScript

### `getFormData()`

Pega os valores digitados no formulário e monta um objeto com descrição, valor, tipo, categoria e data.

### `validateTransaction()`

Confere se os campos foram preenchidos corretamente. Se algo estiver errado, retorna uma mensagem de erro e impede o cadastro.

### `createTransaction()`

Cadastra uma nova movimentação. Ela cria um objeto novo, adiciona no array `transactions`, salva no `localStorage` e atualiza a interface.

### `updateTransaction()`

Edita uma movimentação existente. Usa `map()` para percorrer o array e trocar apenas o objeto que tem o mesmo `id` do item editado.

### `startEdit()`

Preenche o formulário com os dados da movimentação escolhida. Também muda o botão de "Cadastrar movimentação" para "Salvar alteração".

### `removeTransaction()`

Exclui uma movimentação. Usa `filter()` para criar um novo array sem o item que possui o `id` escolhido.

### `getFilteredTransactions()`

Aplica os filtros de todos, entradas e saídas. Também usa o texto da busca para encontrar movimentações pela descrição ou categoria.

### `renderTransactions()`

É uma das funções mais importantes. Ela limpa a lista atual, aplica os filtros, ordena as movimentações por data, cria os elementos HTML e coloca tudo na tela novamente.

### `updateSummary()`

Calcula o total de entradas, o total de saídas e o saldo final. Usa `reduce()` para transformar o array de movimentações em um único objeto com os totais.

### `saveTransactions()` e `loadTransactions()`

Essas funções cuidam do `localStorage`. O `saveTransactions()` salva os dados no navegador e o `loadTransactions()` carrega esses dados quando a página abre.

## Técnicas usadas

### `map()`

Foi usado para atualizar itens do array sem alterar diretamente o objeto original.

Exemplo no projeto:

```js
transactions = transactions.map((transaction) => {
  if (transaction.id !== id) {
    return transaction;
  }

  return {
    ...transaction,
    ...transactionData,
  };
});
```

### `filter()`

Foi usado para remover itens e também para mostrar apenas entradas, saídas ou resultados da busca.

Exemplo no projeto:

```js
transactions = transactions.filter((transaction) => transaction.id !== id);
```

### `reduce()`

Foi usado para somar os valores e gerar o resumo financeiro.

Exemplo no projeto:

```js
const totals = transactions.reduce(
  (accumulator, transaction) => {
    // soma entradas e saídas
  },
  {
    income: 0,
    expense: 0,
  },
);
```

### Spread Operator (`...`)

Foi usado para copiar objetos e arrays.

Exemplo:

```js
const newTransaction = {
  ...transactionData,
  id: Date.now(),
  checked: false,
};
```

Isso significa: "copie todos os dados de `transactionData` e depois adicione `id` e `checked`".

### Arrow Functions

A maior parte das funções foi escrita com arrow function.

Exemplo:

```js
const getFormData = () => ({
  description: descriptionInput.value.trim(),
  amount: Number(amountInput.value),
});
```

## Roteiro de estudo em 1 hora

### 1. Primeiros 10 minutos

Leia o começo do `script.js` e entenda:

- o que é DOM;
- para que serve `querySelector`;
- quais elementos do HTML o JavaScript está pegando.

### 2. Próximos 15 minutos

Estude o fluxo do formulário:

- `getFormData()`;
- `validateTransaction()`;
- `createTransaction()`;
- `handleSubmit()`.

Essa é a parte que explica como o cadastro funciona.

### 3. Próximos 15 minutos

Estude edição e exclusão:

- `startEdit()`;
- `updateTransaction()`;
- `removeTransaction()`;
- `clearAllTransactions()`.

Aqui você explica principalmente `map()` e `filter()`.

### 4. Próximos 10 minutos

Estude renderização e resumo:

- `renderTransactions()`;
- `getFilteredTransactions()`;
- `updateSummary()`.

Aqui você explica `filter()`, `map()` e `reduce()`.

### 5. Últimos 10 minutos

Abra o projeto no navegador e teste:

- cadastrar uma entrada;
- cadastrar uma saída;
- editar uma movimentação;
- excluir uma movimentação;
- filtrar;
- buscar;
- atualizar a página para ver o `localStorage` funcionando.

## Como explicar em aula

Você pode explicar assim:

> "Eu organizei os dados em um array de objetos chamado `transactions`. Cada movimentação possui descrição, valor, tipo, categoria, data e id. Quando o usuário cadastra um item, o JavaScript valida os campos, cria um novo objeto, adiciona no array e renderiza a lista novamente. Para editar, eu uso `map()` porque preciso percorrer o array e atualizar apenas o item com o id selecionado. Para excluir, uso `filter()` porque ele retorna um novo array sem o item removido. Para calcular os totais, uso `reduce()` somando entradas e saídas. Também uso `localStorage` para salvar os dados no navegador."

## Como executar

Abra o arquivo `index.html` no navegador.

## Como enviar para o GitHub

Dentro da pasta do projeto, use:

```bash
git add .
git commit -m "Versão final comentada"
git branch -M main
git remote set-url origin https://github.com/wanessags/ControleGastos.git
git push -u origin main --force
```

Se o remoto ainda não existir, use:

```bash
git remote add origin https://github.com/wanessags/ControleGastos.git
git push -u origin main --force
```
