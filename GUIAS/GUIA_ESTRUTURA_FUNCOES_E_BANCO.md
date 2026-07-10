# Guia da estrutura, funções e banco de dados

Projeto: **Start Solidarium MVP**

Este guia explica três coisas:

1. Como a estrutura de pastas do Next.js funciona.
2. O que cada função principal faz e por que foi escrita daquele jeito.
3. Qual banco de dados usar se o projeto vai ficar no GitHub e publicado na Vercel.

---

## 1. Estrutura geral do projeto

Na imagem que você mostrou, a pasta `app` tem esta estrutura:

```text
app
├── ficha-tecnica
│   └── page.tsx
├── kanban
│   └── page.tsx
├── ordens
│   └── page.tsx
├── produtos
│   └── page.tsx
├── shared
│   ├── seed.ts
│   ├── shell.tsx
│   ├── store.ts
│   └── types.ts
├── globals.css
├── layout.tsx
└── page.tsx
```

Essa estrutura é do **Next.js App Router**.

No Next.js, a pasta `app` controla as páginas do sistema.

---

## 2. Como as rotas funcionam

No Next.js, cada pasta dentro de `app` pode virar uma rota.

Exemplo:

```text
app/produtos/page.tsx
```

vira:

```text
/produtos
```

Outro exemplo:

```text
app/kanban/page.tsx
```

vira:

```text
/kanban
```

O arquivo precisa se chamar `page.tsx`, porque esse é o nome especial que o Next.js reconhece como página.

---

## 3. Para que serve cada pasta

### `app/produtos`

Contém a página de produtos.

Arquivo principal:

```text
app/produtos/page.tsx
```

Função:

- cadastrar produto;
- listar produtos cadastrados;
- iniciar o fluxo do MVP.

Essa tela é o primeiro passo:

```text
Produto -> Ficha Técnica -> Ordem -> Kanban
```

---

### `app/ficha-tecnica`

Contém a página de fichas técnicas.

Arquivo principal:

```text
app/ficha-tecnica/page.tsx
```

Função:

- escolher um produto;
- criar uma ficha técnica para esse produto;
- listar fichas técnicas existentes.

Essa tela mostra que um produto tem uma receita/processo de produção.

---

### `app/ordens`

Contém a página de ordens de produção.

Arquivo principal:

```text
app/ordens/page.tsx
```

Função:

- escolher uma ficha técnica;
- criar uma ordem de produção;
- mandar essa ordem automaticamente para o Kanban.

Essa tela conecta planejamento com execução.

---

### `app/kanban`

Contém a página do Kanban.

Arquivo principal:

```text
app/kanban/page.tsx
```

Função:

- mostrar as ordens por etapa;
- avançar ou voltar uma ordem;
- demonstrar o acompanhamento da produção.

Etapas usadas:

```text
Recepção
Processamento
Fabricação
Qualidade
Embalagem
Concluído
```

---

### `app/shared`

Essa é uma pasta de apoio.

Ela não vira uma página.

Ela guarda código reutilizado por várias páginas.

Pense nela como uma caixa de ferramentas do projeto.

Arquivos:

```text
app/shared/types.ts
app/shared/seed.ts
app/shared/store.ts
app/shared/shell.tsx
```

---

## 4. Arquivos globais

### `app/layout.tsx`

Esse arquivo é o layout geral do sistema.

Tudo que aparece nas páginas passa por ele.

Ele importa o CSS:

```tsx
import "./globals.css";
```

Por que existe?

Porque o Next.js precisa de um layout raiz para montar a aplicação.

---

### `app/globals.css`

Esse arquivo controla o visual do sistema.

Ele define:

- cores;
- botões;
- tabelas;
- cards;
- formulários;
- Kanban;
- responsividade.

Por que é global?

Porque essas classes são usadas em várias páginas.

Exemplo:

```css
.btn
.card
.badge
.kanban
.column
```

---

### `app/page.tsx`

Essa é a página inicial.

Ela vira a rota:

```text
/
```

Função:

- mostrar o dashboard;
- mostrar os números do MVP;
- guiar a apresentação.

---

## 5. Explicação dos arquivos da pasta `shared`

### `types.ts`

Esse arquivo define os formatos dos dados.

Exemplo:

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

Isso diz que todo produto precisa ter:

- id;
- nome;
- SKU;
- categoria;
- linha;
- percentual reciclado;
- status.

Por que isso existe?

Porque o projeto usa TypeScript.

O TypeScript ajuda a evitar erro.

Por exemplo, se você tentar criar um produto sem `name`, o editor pode avisar.

---

### `seed.ts`

Esse arquivo guarda os dados iniciais.

Exemplo:

```ts
export const seedData = {
  products: [...],
  sheets: [...],
  orders: [...]
};
```

Por que isso existe?

Porque um MVP não pode abrir vazio na apresentação.

Com `seedData`, o sistema já começa com:

- produtos de exemplo;
- fichas técnicas de exemplo;
- ordens de exemplo.

Isso ajuda muito na hora de demonstrar.

---

### `shell.tsx`

Esse arquivo cria a "casca" visual das páginas.

Ele mostra:

- cabeçalho;
- menu;
- botão de reset da demonstração.

Por que isso existe?

Para não repetir o mesmo cabeçalho e menu em todas as telas.

Em vez de copiar esse HTML em cada página, cada página usa:

```tsx
<Shell active="produtos">
  ...
</Shell>
```

Assim o sistema fica mais organizado.

---

### `store.ts`

Esse é o arquivo mais importante da lógica.

Ele controla:

- produtos;
- fichas técnicas;
- ordens;
- movimentação no Kanban;
- salvamento no navegador.

Neste MVP, ele usa `localStorage`.

---

## 6. Explicação das funções principais

### `createId`

Arquivo:

```text
app/shared/store.ts
```

Código:

```ts
function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
```

O que faz?

Cria um identificador único.

Exemplo:

```text
prod-17123456789-a8f3
sheet-17123456789-b21d
order-17123456789-92ab
```

Por que foi feita assim?

Porque não estamos usando banco de dados ainda.

Em um banco real, o banco cria o ID.

Como o MVP salva no navegador, o próprio código cria um ID.

---

### `loadData`

Código:

```ts
function loadData(): MvpData {
  if (typeof window === "undefined") return seedData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData;

  try {
    return JSON.parse(raw) as MvpData;
  } catch {
    return seedData;
  }
}
```

O que faz?

Carrega os dados salvos no navegador.

Se não existir nada salvo, usa `seedData`.

Por que tem `typeof window === "undefined"`?

Porque o Next.js também pode executar código no servidor.

O `localStorage` só existe no navegador.

Essa verificação evita erro.

Por que tem `try/catch`?

Porque os dados salvos no navegador podem estar quebrados.

Se der erro, o sistema volta para os dados iniciais em vez de travar.

---

### `useMvpData`

Código:

```ts
export function useMvpData() {
  const [data, setData] = useState<MvpData>(seedData);
  const [ready, setReady] = useState(false);
  ...
}
```

O que faz?

É o centro dos dados do MVP.

Ele permite que todas as páginas usem os mesmos dados.

Por que foi feito como hook?

Porque no React funções com `use...` podem guardar estado e reagir a mudanças.

Quando você cria um produto, a tela atualiza automaticamente.

---

### Primeiro `useEffect`

```ts
useEffect(() => {
  setData(loadData());
  setReady(true);
}, []);
```

O que faz?

Quando a página abre, ele carrega os dados do navegador.

O `[]` significa:

```text
executar só uma vez
```

---

### Segundo `useEffect`

```ts
useEffect(() => {
  if (ready) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}, [data, ready]);
```

O que faz?

Sempre que os dados mudam, salva no `localStorage`.

Por que tem `ready`?

Para evitar salvar antes de carregar.

---

### `addProduct`

```ts
addProduct(product: Omit<Product, "id">) {
  setData((current) => ({
    ...current,
    products: [{ ...product, id: createId("prod") }, ...current.products]
  }));
}
```

O que faz?

Adiciona um produto novo.

Por que recebe `Omit<Product, "id">`?

Porque a tela manda os dados do formulário, mas o ID é criado automaticamente.

Por que usa `...current`?

Para manter os dados antigos.

Por que usa:

```ts
[{ ...product, id: createId("prod") }, ...current.products]
```

Para colocar o produto novo no começo da lista.

---

### `addSheet`

```ts
addSheet(sheet: Omit<TechnicalSheet, "id" | "code">) {
  setData((current) => {
    const nextNumber = current.sheets.length + 1;
    return {
      ...current,
      sheets: [
        {
          ...sheet,
          id: createId("sheet"),
          code: `FT-${String(nextNumber).padStart(3, "0")}`
        },
        ...current.sheets
      ]
    };
  });
}
```

O que faz?

Cria uma ficha técnica.

Por que gera `code`?

Para aparecer algo como:

```text
FT-001
FT-002
FT-003
```

Isso fica mais parecido com sistema real.

---

### `addOrder`

```ts
addOrder(order: Omit<ProductionOrder, "id" | "code" | "lot" | "createdAt" | "stage" | "progress">) {
  ...
}
```

O que faz?

Cria uma ordem de produção.

A tela informa:

- ficha técnica;
- quantidade;
- prazo;
- prioridade;
- responsável.

A função cria automaticamente:

- ID;
- código da OP;
- lote;
- data de criação;
- etapa inicial;
- progresso inicial.

Por que a etapa inicial é `recepcao`?

Porque toda ordem nova começa no início do processo produtivo.

---

### `moveOrder`

```ts
moveOrder(orderId: string, stage: ProductionOrder["stage"]) {
  setData((current) => ({
    ...current,
    orders: current.orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            stage,
            progress: stage === "concluido" ? 100 : Math.max(order.progress, 20)
          }
        : order
    )
  }));
}
```

O que faz?

Move uma ordem de produção para outra etapa.

Por que usa `map`?

Porque no React não devemos alterar o objeto direto.

Em vez disso, criamos uma nova lista com a ordem atualizada.

Por que o progresso vira 100 quando conclui?

Porque se a OP chegou em `concluido`, ela deve aparecer como finalizada.

---

### `resetDemo`

```ts
resetDemo() {
  setData(seedData);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  window.location.reload();
}
```

O que faz?

Restaura os dados iniciais.

Por que isso existe?

Para você poder testar e depois voltar tudo para o estado bonito da apresentação.

---

## 7. Funções das páginas

### `ProductsPage`

Arquivo:

```text
app/produtos/page.tsx
```

É a função que monta a página de produtos.

Ela usa:

```ts
const { products, addProduct } = useMvpData();
```

Isso significa:

- pegar a lista de produtos;
- pegar a função que adiciona produto.

Também usa:

```ts
const [form, setForm] = useState(...)
```

Isso guarda o que o usuário digitou no formulário.

---

### `submit` de produtos

```ts
function submit(event: FormEvent) {
  event.preventDefault();
  if (!form.name || !form.sku) return;
  addProduct({ ...form, status: "Ativo" });
  setForm({ name: "", sku: "", category: "Poliframe", line: "Linha 01", recycledPercent: 60 });
}
```

O que faz?

Salva o produto.

Por que tem `event.preventDefault()`?

Para impedir que o navegador recarregue a página.

Por que valida `name` e `sku`?

Porque produto sem nome e sem SKU não faz sentido.

---

### `TechnicalSheetsPage`

Arquivo:

```text
app/ficha-tecnica/page.tsx
```

Monta a página de ficha técnica.

Ela pega:

```ts
const { products, sheets, addSheet } = useMvpData();
```

Ou seja:

- produtos para selecionar;
- fichas para listar;
- função para criar ficha.

---

### `selectedProductId`

```ts
const selectedProductId = form.productId || products[0]?.id || "";
```

O que faz?

Escolhe o produto atual.

Se o usuário não escolheu nenhum, usa o primeiro produto da lista.

Por que isso ajuda?

Porque facilita a demonstração.

---

### `productName`

```ts
function productName(id: string) {
  return products.find((product) => product.id === id)?.name || "Produto não encontrado";
}
```

O que faz?

Transforma um ID de produto em nome.

Por que precisa disso?

Porque a ficha guarda o ID do produto, não o nome.

Guardar ID é melhor, porque o nome pode mudar.

---

### `OrdersPage`

Arquivo:

```text
app/ordens/page.tsx
```

Monta a página de ordens.

Ela pega:

```ts
const { products, sheets, orders, addOrder } = useMvpData();
```

Ela precisa de:

- produtos;
- fichas;
- ordens;
- função para criar ordem.

---

### `sheetLabel`

```ts
function sheetLabel(id: string) {
  const sheet = sheets.find((item) => item.id === id);
  const product = products.find((item) => item.id === sheet?.productId);
  return sheet && product ? `${sheet.code} - ${product.name}` : "Ficha não encontrada";
}
```

O que faz?

Mostra a ficha de forma amigável.

Exemplo:

```text
FT-001 - Placa Poliframe 2,40m
```

Por que foi feita assim?

Porque a ordem guarda `sheetId`, mas o usuário precisa enxergar o nome do produto.

---

### `KanbanPage`

Arquivo:

```text
app/kanban/page.tsx
```

Monta o Kanban.

Ela pega:

```ts
const { products, sheets, orders, moveOrder } = useMvpData();
```

Ela precisa dos dados para montar os cards e da função `moveOrder` para movimentar as OPs.

---

### `move`

```ts
function move(orderId: string, current: ProductionStage, direction: -1 | 1) {
  const index = stages.indexOf(current);
  const nextStage = stages[index + direction];
  if (nextStage) moveOrder(orderId, nextStage);
}
```

O que faz?

Move uma ordem para frente ou para trás.

Se `direction` for `1`, avança.

Se `direction` for `-1`, volta.

Por que foi feita assim?

Para usar a mesma função nos dois botões:

- botão de voltar;
- botão de avançar.

---

## 8. Podemos usar banco de dados?

Sim.

Mas depende do que o professor quer dizer com "não podemos usar banco de dados".

Existem dois cenários:

### Cenário A: ele não quer backend complexo

Nesse caso, podemos usar um banco simples na nuvem, conectado ao Next.js.

### Cenário B: ele proibiu qualquer banco externo

Nesse caso, o projeto deve ficar com `localStorage` ou dados mockados.

Mas atenção:

`localStorage` não é banco de dados real.

Ele salva apenas no navegador da pessoa.

Se você cadastrar um produto no seu computador, outra pessoa não vai ver.

---

## 9. Melhor banco para Next.js + Vercel

Minha recomendação para este projeto acadêmico:

```text
Supabase
```

Por quê?

- Tem plano gratuito.
- Usa PostgreSQL por baixo.
- Tem painel visual fácil.
- Funciona bem com Next.js.
- Dá para criar tabelas sem muita complexidade.
- Também tem autenticação, se depois precisar.
- A integração com Vercel é comum.

Fontes oficiais:

- Supabase com Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Template Supabase na Vercel: https://vercel.com/templates/next.js/supabase

---

## 10. Outra boa opção: Neon

Outra opção muito boa é:

```text
Neon Postgres
```

Por quê?

- É PostgreSQL serverless.
- Tem integração com Vercel.
- É mais "banco puro" do que Supabase.
- Combina muito com Next.js em deploy serverless.

Fontes oficiais:

- Neon na Vercel: https://vercel.com/integrations/neon
- Template Vercel com Neon: https://vercel.com/templates/next.js/vercel-with-neon-postgres

---

## 11. Supabase ou Neon?

Para o seu caso, eu escolheria:

```text
Supabase
```

Motivo:

Você disse que não entende muito de programação ainda.

O Supabase tem painel mais amigável para criar tabelas, ver dados e testar.

Para um MVP acadêmico, isso ajuda muito.

Use Neon se o grupo quiser algo mais técnico e mais parecido com banco PostgreSQL puro.

---

## 12. Modelo de tabelas sugerido

Se for usar Supabase ou Neon, as tabelas principais seriam:

### `products`

```text
id
name
sku
category
line
recycled_percent
status
created_at
```

### `technical_sheets`

```text
id
code
product_id
version
cycle_minutes
unit_cost
residue
inputs
steps
status
created_at
```

### `production_orders`

```text
id
code
sheet_id
quantity
due_date
priority
responsible
lot
stage
progress
created_at
```

Relações:

```text
technical_sheets.product_id -> products.id
production_orders.sheet_id -> technical_sheets.id
```

Isso mantém o mesmo fluxo do MVP atual.

---

## 13. O que falar para o professor

Você pode explicar assim:

```text
Nesta versão MVP, o sistema usa persistência local para validar o fluxo principal. Caso a versão publicada precise compartilhar dados entre usuários, a evolução natural é usar Supabase, que fornece PostgreSQL em nuvem e funciona bem com Next.js e Vercel.
```

Se vocês forem implementar banco agora:

```text
Escolhemos Supabase porque ele oferece PostgreSQL, painel visual, integração com Next.js e facilita o deploy em ambiente Vercel.
```

---

## 14. Decisão prática

Para entregar rápido:

```text
Agora: localStorage
Depois, se o professor exigir dados compartilhados: Supabase
```

Essa é a melhor estratégia para não travar o MVP.

