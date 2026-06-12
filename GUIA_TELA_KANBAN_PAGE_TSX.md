# Guia da tela de Kanban (`app/kanban/page.tsx`)

Este documento explica a tela de Kanban do MVP.

Arquivo explicado:

```text
app/kanban/page.tsx
```

---

## 1. Objetivo dessa tela

O Kanban é o quarto passo do fluxo:

```text
Produto -> Ficha Técnica -> Ordem de Produção -> Kanban
```

Ele mostra a ordem de produção andando pelas etapas.

Essa é uma das telas mais importantes para apresentar, porque deixa visual que o sistema funciona.

---

## 2. `"use client"`

```tsx
"use client";
```

O Kanban precisa rodar no navegador porque tem interação:

- clicar para avançar etapa;
- clicar para voltar etapa;
- atualizar cards na tela.

---

## 3. Imports

```tsx
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Shell } from "../shared/shell";
import { stageLabels } from "../shared/seed";
import { useMvpData } from "../shared/store";
import type { ProductionStage } from "../shared/types";
```

### `ArrowLeft` e `ArrowRight`

Ícones dos botões de voltar e avançar etapa.

### `Shell`

Coloca cabeçalho e menu.

### `stageLabels`

Guarda os nomes das etapas.

Exemplo:

```ts
recepcao: "Recepção"
```

### `useMvpData`

Traz os dados e a função que move ordem.

### `ProductionStage`

Tipo que limita as etapas possíveis.

Ajuda a evitar escrever uma etapa inexistente.

---

## 4. Lista de etapas

```tsx
const stages = Object.keys(stageLabels) as ProductionStage[];
```

Essa linha cria uma lista com as etapas do Kanban.

Se `stageLabels` tiver:

```text
recepcao
processamento
fabricacao
qualidade
embalagem
concluido
```

então `stages` vira uma lista com essas etapas.

Por que foi feito assim?

Para não repetir a lista de etapas em dois lugares.

Se mudar em `seed.ts`, o Kanban acompanha.

---

## 5. Função principal

```tsx
export default function KanbanPage() {
```

Essa função monta a página `/kanban`.

---

## 6. Pegando dados do sistema

```tsx
const { products, sheets, orders, moveOrder } = useMvpData();
```

O Kanban precisa de:

- `products`: para mostrar o nome do produto;
- `sheets`: para descobrir qual produto pertence à ordem;
- `orders`: para montar os cards;
- `moveOrder`: para mover cards entre colunas.

---

## 7. Função `productName`

```tsx
function productName(sheetId: string) {
  const sheet = sheets.find((item) => item.id === sheetId);
  return products.find((item) => item.id === sheet?.productId)?.name || "Produto não encontrado";
}
```

Essa função descobre o nome do produto a partir da ficha técnica.

Caminho:

```text
ordem -> sheetId -> ficha técnica -> productId -> produto -> nome
```

Por que é assim?

Porque a ordem não guarda diretamente o nome do produto.

Ela guarda a ficha técnica usada.

Isso representa melhor o fluxo real.

---

## 8. Função `move`

```tsx
function move(orderId: string, current: ProductionStage, direction: -1 | 1) {
  const index = stages.indexOf(current);
  const nextStage = stages[index + direction];
  if (nextStage) moveOrder(orderId, nextStage);
}
```

Essa função move uma ordem para frente ou para trás.

Parâmetros:

- `orderId`: qual ordem será movida;
- `current`: etapa atual;
- `direction`: direção do movimento.

Se `direction` for:

```text
1
```

avança.

Se for:

```text
-1
```

volta.

### Como ela funciona

Primeiro acha a posição atual:

```tsx
const index = stages.indexOf(current);
```

Depois calcula a próxima etapa:

```tsx
const nextStage = stages[index + direction];
```

Depois verifica se a etapa existe:

```tsx
if (nextStage) moveOrder(orderId, nextStage);
```

Por que essa verificação existe?

Para não tentar avançar depois de "Concluído" ou voltar antes de "Recepção".

---

## 9. Cabeçalho da página

```tsx
<h2>Kanban de produção</h2>
<div className="subtitle">Acompanhe e mova as ordens entre etapas durante a demonstração.</div>
```

No front aparece o título e a explicação da tela.

Também aparece:

```tsx
<span className="badge badge-green">Atualizado no navegador</span>
```

Isso reforça que a tela muda direto no navegador.

---

## 10. Criando as colunas

```tsx
{stages.map((stage) => {
  const stageOrders = orders.filter((order) => order.stage === stage);
  return (
    <section className={`column ${stage}`} key={stage}>
      ...
    </section>
  );
})}
```

Essa é a parte central do Kanban.

Para cada etapa, o código cria uma coluna.

Exemplo:

```text
Recepção
Processamento
Fabricação
Qualidade
Embalagem
Concluído
```

### `filter`

```tsx
const stageOrders = orders.filter((order) => order.stage === stage);
```

Essa linha pega apenas as ordens daquela coluna.

Exemplo:

Se a etapa atual é:

```text
processamento
```

ela pega só ordens com:

```text
order.stage === "processamento"
```

---

## 11. Cabeçalho de cada coluna

```tsx
<div className="column-title">{stageLabels[stage]}</div>
<div className="column-count">{stageOrders.length}</div>
```

Mostra:

- nome da etapa;
- quantidade de ordens naquela etapa.

Exemplo:

```text
Processamento 2
```

---

## 12. Coluna vazia

```tsx
{stageOrders.length === 0 ? (
  <div className="empty-column">Sem ordens nesta etapa</div>
) : (
  ...
)}
```

Se não existe ordem naquela etapa, aparece:

```text
Sem ordens nesta etapa
```

Isso deixa o Kanban mais claro.

---

## 13. Criando cards das ordens

```tsx
stageOrders.map((order) => (
  <article className="kanban-card ..." key={order.id}>
    ...
  </article>
))
```

Para cada ordem da etapa, cria um card.

Cada card mostra:

- código da OP;
- nome do produto;
- quantidade;
- lote;
- prioridade;
- progresso;
- prazo;
- responsável;
- botões de voltar e avançar.

---

## 14. Classe de prioridade

```tsx
className={`kanban-card priority-${order.priority === "Alta" ? "high" : order.priority === "Média" ? "med" : "low"}`}
```

Essa linha escolhe a cor lateral do card.

Se prioridade for:

- Alta: `priority-high`;
- Média: `priority-med`;
- Baixa: `priority-low`.

No front, isso ajuda a identificar urgência.

---

## 15. Nome do produto e quantidade

```tsx
<div className="op-product">{productName(order.sheetId)} - {order.quantity} un</div>
```

Mostra algo assim:

```text
Placa Poliframe 2,40m - 80 un
```

---

## 16. Lote e prioridade

```tsx
<span className="lote-tag">{order.lot}</span>
<span className={`badge ...`}>{order.priority}</span>
```

Mostra:

```text
LT-2459
Alta
```

Essas tags deixam o card mais parecido com um sistema de produção.

---

## 17. Barra de progresso

```tsx
<div className="progress-mini">
  <div className="bar" style={{ width: `${order.progress}%` }} />
</div>
```

Cria uma barrinha visual de progresso.

Se o progresso for 45:

```text
width: 45%
```

Quando a ordem vai para concluído, o progresso vira 100%.

---

## 18. Prazo formatado

```tsx
new Date(`${order.dueDate}T00:00:00`).toLocaleDateString("pt-BR")
```

Mostra a data em formato brasileiro.

Exemplo:

```text
27/04/2026
```

---

## 19. Botões de movimentação

```tsx
<button onClick={() => move(order.id, order.stage, -1)} disabled={stage === "recepcao"}>
  <ArrowLeft size={16} />
</button>

<button onClick={() => move(order.id, order.stage, 1)} disabled={stage === "concluido"}>
  <ArrowRight size={16} />
</button>
```

O primeiro botão volta a ordem.

O segundo botão avança a ordem.

### `disabled`

```tsx
disabled={stage === "recepcao"}
```

Não deixa voltar se já está na primeira etapa.

```tsx
disabled={stage === "concluido"}
```

Não deixa avançar se já está concluído.

---

## 20. Resumo simples

Essa tela faz:

```text
Lê as ordens,
separa por etapa,
desenha uma coluna para cada etapa,
desenha um card para cada ordem,
e permite mover as ordens para frente ou para trás.
```

Ela é a prova visual de que o fluxo do MVP funciona.

