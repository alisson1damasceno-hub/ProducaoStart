# Guia explicado do MVP Next.js - Start Solidarium

Este documento explica, em linguagem simples, o que foi feito nesta pasta e como o MVP funciona.

## 1. Ideia principal do MVP

O objetivo não é criar um ERP completo agora.

O objetivo é provar que existe um fluxo funcional:

```text
Produto -> Ficha Técnica -> Ordem de Produção -> Kanban
```

Isso significa:

1. Você cadastra um produto.
2. Você cria uma ficha técnica para esse produto.
3. Você abre uma ordem de produção usando essa ficha técnica.
4. A ordem aparece no Kanban e pode mudar de etapa.

Esse fluxo já é suficiente para apresentar um sistema funcionando.

## 2. O que é Next.js aqui

Next.js é um framework baseado em React.

Neste projeto ele está sendo usado para criar páginas do sistema, como:

```text
/
/produtos
/ficha-tecnica
/ordens
/kanban
```

Cada página fica dentro da pasta `app`.

Exemplo:

```text
app/produtos/page.tsx
```

Esse arquivo vira automaticamente a página:

```text
/produtos
```

Você não precisa configurar rotas manualmente.

## 3. Arquivos principais criados

### `package.json`

É o arquivo que diz que este projeto é um projeto Next.js.

Ele define:

- nome do projeto;
- comandos para rodar;
- dependências usadas.

Comandos importantes:

```bash
npm install
npm run dev
```

O `npm install` instala as bibliotecas.

O `npm run dev` inicia o servidor local.

Depois disso, o sistema abre normalmente em:

```text
http://localhost:3000
```

### `app/layout.tsx`

É a estrutura geral do app.

Tudo que aparece nas páginas passa por esse layout.

Neste MVP ele importa o CSS global:

```tsx
import "./globals.css";
```

### `app/globals.css`

É o arquivo visual do sistema.

Ele define:

- cores;
- botões;
- cards;
- tabelas;
- Kanban;
- responsividade para celular;
- layout geral.

A ideia foi manter o visual parecido com as telas HTML que você já tinha, mas usando componentes Next.js.

### `app/page.tsx`

É a página inicial, o Dashboard do MVP.

Ela mostra:

- resumo de produtos;
- resumo de fichas técnicas;
- resumo de ordens;
- quantas ordens foram concluídas;
- roteiro da apresentação.

Ela também deixa claro o caminho da demonstração:

```text
Produto -> Ficha Técnica -> Ordem -> Kanban
```

### `app/produtos/page.tsx`

É a tela de produtos.

O que ela faz:

- mostra um formulário para cadastrar produto;
- salva o produto;
- lista os produtos cadastrados.

Campos principais:

- nome;
- SKU;
- categoria;
- linha;
- percentual reciclado.

Quando você salva um produto, ele fica disponível para ser usado na ficha técnica.

### `app/ficha-tecnica/page.tsx`

É a tela de fichas técnicas.

O que ela faz:

- permite escolher um produto já cadastrado;
- cria uma ficha técnica vinculada a esse produto;
- lista as fichas já criadas.

Campos principais:

- produto;
- versão;
- tempo de ciclo;
- custo unitário;
- resíduo usado;
- insumos;
- etapas.

Essa tela prova que o produto tem uma ficha técnica associada.

### `app/ordens/page.tsx`

É a tela de ordens de produção.

O que ela faz:

- permite escolher uma ficha técnica aprovada;
- cria uma ordem de produção;
- lista as ordens criadas.

Campos principais:

- ficha técnica;
- quantidade;
- prazo;
- prioridade;
- responsável.

Quando uma ordem é criada, ela entra automaticamente no Kanban na etapa de recepção.

### `app/kanban/page.tsx`

É o Kanban de produção.

O que ele faz:

- mostra as ordens separadas por etapa;
- permite avançar ou voltar uma ordem;
- atualiza o progresso da ordem.

Etapas usadas:

```text
Recepção
Processamento
Fabricação
Qualidade
Embalagem
Concluído
```

Essa é a parte mais importante para a apresentação, porque mostra a ordem andando pelo processo produtivo.

## 4. Pasta `app/shared`

Essa pasta guarda código reaproveitado pelas páginas.

Ela evita copiar a mesma lógica várias vezes.

### `app/shared/types.ts`

Define os tipos dos dados.

Exemplo de produto:

```ts
export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  line: string;
  recycledPercent: number;
  status: "Ativo" | "Em desenvolvimento";
};
```

Isso ajuda o TypeScript a avisar quando algum dado está errado.

Em termos simples: é como uma ficha dizendo quais campos cada coisa precisa ter.

### `app/shared/seed.ts`

Guarda os dados iniciais de demonstração.

O sistema já começa com:

- produtos de exemplo;
- fichas técnicas de exemplo;
- ordens de exemplo.

Isso é útil porque, ao abrir o sistema para apresentar, ele já não aparece vazio.

### `app/shared/store.ts`

É uma das partes mais importantes do MVP.

Ele cuida dos dados do sistema.

Neste MVP não foi criado backend nem banco de dados.

Os dados são salvos no navegador usando `localStorage`.

Isso significa:

- funciona rápido;
- não precisa configurar servidor de banco;
- é suficiente para uma apresentação acadêmica;
- os dados ficam salvos no navegador enquanto você não limpar ou resetar.

Funções principais:

- `addProduct`: adiciona produto;
- `addSheet`: adiciona ficha técnica;
- `addOrder`: adiciona ordem de produção;
- `moveOrder`: move uma ordem no Kanban;
- `resetDemo`: restaura os dados iniciais.

### `app/shared/shell.tsx`

É o layout visual reaproveitado nas páginas.

Ele mostra:

- cabeçalho;
- menu principal;
- botão de reset da demonstração.

Assim, todas as páginas ficam com a mesma cara.

## 5. Como os dados se conectam

O fluxo funciona assim:

### Produto

Quando você cria um produto, ele ganha um `id`.

Exemplo:

```text
prod-123
```

### Ficha técnica

A ficha técnica guarda o `id` do produto.

Assim o sistema sabe qual ficha pertence a qual produto.

Exemplo:

```text
Ficha FT-003 usa o produto prod-123
```

### Ordem de produção

A ordem de produção guarda o `id` da ficha técnica.

Assim o sistema sabe:

- qual ficha foi usada;
- qual produto será produzido;
- quais informações técnicas estão ligadas à ordem.

### Kanban

O Kanban lê as ordens de produção e separa por etapa.

Cada ordem tem um campo chamado `stage`.

Exemplo:

```text
stage: "processamento"
```

Quando você clica para avançar, esse campo muda.

## 6. Por que foi usado `localStorage`

Porque este é um MVP.

Para o prazo de entrega, o mais importante é mostrar o sistema funcionando.

Um banco de dados real exigiria:

- modelagem;
- conexão;
- API;
- autenticação;
- tratamento de erros;
- deploy mais complexo.

Para a apresentação, isso seria esforço demais para pouco ganho.

Com `localStorage`, você consegue demonstrar o fluxo completo sem depender de backend.

## 7. Como apresentar o sistema

Sugestão de roteiro:

1. Abra o Dashboard.
2. Explique que o MVP foca no fluxo principal da produção.
3. Vá para Produtos.
4. Cadastre um produto novo.
5. Vá para Fichas Técnicas.
6. Crie uma ficha usando esse produto.
7. Vá para Ordens.
8. Crie uma ordem usando essa ficha.
9. Vá para Kanban.
10. Mostre a ordem aparecendo na primeira etapa.
11. Avance a ordem até as próximas etapas.

Frase boa para apresentação:

```text
O sistema demonstra o fluxo essencial do ERP: o produto cadastrado gera uma ficha técnica, a ficha técnica gera uma ordem de produção e a ordem é acompanhada no Kanban.
```

## 8. O que dizer se perguntarem sobre banco de dados

Você pode responder:

```text
Nesta versão MVP, usamos persistência local no navegador para validar o fluxo funcional. A arquitetura permite evoluir depois para banco de dados e API, mas o foco da entrega atual é demonstrar o processo ponta a ponta.
```

Isso mostra maturidade, porque você não está dizendo que o sistema está completo.

Você está dizendo que ele foi feito com escopo controlado.

## 9. O que ainda pode ser melhorado depois

Depois da apresentação, seria possível evoluir para:

- banco de dados;
- login;
- permissões de usuário;
- relatórios;
- rastreabilidade real;
- exportação de PDF;
- edição e exclusão de registros;
- validações mais completas;
- integração com telas antigas.

Mas nada disso é necessário para provar o MVP agora.

## 10. Problema encontrado neste computador

O Node.js existe nesta máquina, mas o `npm` está com problema de caminho.

O erro indica que ele tenta encontrar o npm aqui:

```text
C:\Users\bbiac\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js
```

Mas esse caminho não existe.

Por isso eu não consegui instalar as dependências aqui dentro.

Solução provável:

1. Reinstalar o Node.js LTS pelo site oficial.
2. Fechar e abrir o terminal de novo.
3. Rodar:

```bash
npm --version
```

Se aparecer uma versão, então está ok.

Depois:

```bash
npm install
npm run dev
```

## 11. Resumo técnico em uma frase

Foi criado um MVP em Next.js com páginas integradas, estado compartilhado e persistência em `localStorage`, demonstrando o fluxo Produto -> Ficha Técnica -> Ordem de Produção -> Kanban sem depender de backend.

