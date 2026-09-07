# Hawkins Finance - Controle de Gastos Pessoais

Aplicação web feita com **HTML, CSS e JavaScript puro** para cadastrar, listar, editar e excluir movimentações financeiras. O projeto foi desenvolvido com uma identidade visual inspirada em painéis retrô, luzes coloridas e clima de suspense, sem deixar de cumprir os requisitos principais da atividade.

## Funcionalidades

- Cadastro de movimentações financeiras.
- Definição de tipo: **Entrada** ou **Saída**.
- Campos de descrição, valor, categoria e data.
- Edição de movimentações já cadastradas.
- Exclusão individual de movimentações.
- Botão para limpar todos os registros.
- Filtros por todos, entradas e saídas.
- Busca por descrição ou categoria.
- Cálculo automático de Total de Entradas, Total de Saídas e Saldo Final.
- Validação dos campos antes do cadastro.
- Persistência dos dados com `localStorage`.
- Layout responsivo para computador, tablet e celular.

## Arquivos do projeto

- `index.html`: cria a estrutura da aplicação, incluindo topo visual, cards de resumo, formulário, filtros, busca e área da lista.
- `style.css`: define o design da interface, as cores, a responsividade, os cards, o formulário, a lista e a animação das luzes.
- `script.js`: controla toda a lógica do projeto, como cadastro, edição, exclusão, filtros, busca, totais e salvamento local.

## Organização do JavaScript

O arquivo `script.js` foi organizado em blocos comentados:

- **Seleção de elementos do DOM:** pega os elementos do HTML usando `querySelector` e `querySelectorAll`.
- **Funções auxiliares:** formata moeda, formata data, pega a data atual e exibe mensagens.
- **Dados e estado da aplicação:** mantém as movimentações em um array de objetos.
- **Formulário:** lê os dados digitados, valida os campos, cadastra novos itens e edita itens existentes.
- **Lista de movimentações:** renderiza os dados na tela, filtra, busca, marca como conferido e remove registros.
- **Resumo financeiro:** calcula entradas, saídas e saldo final.
- **Eventos:** conecta cliques, envio do formulário e digitação na busca às funções do projeto.

## Técnicas usadas

- `map()`: usado para atualizar uma movimentação existente e para transformar objetos em elementos HTML.
- `filter()`: usado para excluir movimentações e aplicar filtros de entradas, saídas e busca.
- `reduce()`: usado para somar o total de entradas e saídas.
- **Spread Operator (`...`)**: usado para copiar objetos e arrays sem alterar diretamente os dados anteriores.
- **Arrow Functions:** usadas na maior parte das funções para reforçar a sintaxe moderna de JavaScript.
- **localStorage:** usado para manter as informações salvas mesmo depois de atualizar a página.

## Como executar

Abra o arquivo `index.html` no navegador.

## Como enviar para o GitHub

Depois de criar o repositório no GitHub, use estes comandos dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Primeira versão do controle de gastos"
git branch -M main
git remote add origin https://github.com/wanessags/ControleGastos.git
git push -u origin main
```

Se o repositório remoto já tiver sido adicionado antes, use:

```bash
git remote set-url origin https://github.com/wanessags/ControleGastos.git
git push -u origin main
```
