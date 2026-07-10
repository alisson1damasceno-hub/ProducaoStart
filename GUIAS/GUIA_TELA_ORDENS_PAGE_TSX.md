# Guia da tela de Ordens (`app/ordens/page.tsx`)

Este documento explica a tela de ordens de produção, juntando código e front-end.

Arquivo explicado:

```text
app/ordens/page.tsx
```

---

## 1. Objetivo dessa tela

A tela de ordens é o terceiro passo do fluxo:

```text
Produto -> Ficha Técnica -> Ordem de Produção -> Kanban
```

Ela serve para criar uma ordem de produção usando uma ficha técnica aprovada.

Em termos simples:

```text
Produto diz "o que é".
Ficha técnica diz "como faz".
Ordem diz "quanto produzir e até quando".
```

---

## 2. `"use client"`

```tsx
"use client";
```

Essa página precisa ser interativa, então ela roda no navegador.

Ela usa:

- formulário;
- `useState`;
- dados do `localStorage`;
- navegação para o Kanban.

---

## 3. Imports

```tsx
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import { Shell } from "../shared/shell";
import { useMvpData } from "../shared/store";
import { stageLabels } from "../shared/seed";
import type { ProductionOrder } from "../shared/types";
```

### `FormEvent`

Tipa o envio do formulário.

### `useState`

Guarda os campos da ordem enquanto o usuário preenche.

### `Link`

Usado no botão que leva para:

```text
/kanban
```

### Ícones

- `ArrowRight`: botão "Ver Kanban".
- `PlusCircle`: botão "Abrir OP".

### `Shell`

Coloca cabeçalho e menu.

### `useMvpData`

Traz produtos, fichas, ordens e a função de criar ordem.

### `stageLabels`

Traduz etapas internas como:

```text
recepcao
```

para texto amigável:

```text
Recepção
```

### `ProductionOrder`

Tipo usado para garantir que prioridade e etapa tenham valores válidos.

---

## 4. Função principal

```tsx
export default function OrdersPage() {
```

Essa função monta a página `/ordens`.

---

## 5. Pegando dados do sistema

```tsx
const { products, sheets, orders, addOrder } = useMvpData();
```

Aqui a página pega:

- `products`: produtos;
- `sheets`: fichas técnicas;
- `orders`: ordens existentes;
- `addOrder`: função que cria ordem.

Por que precisa de produtos e fichas?

Porque a ordem aponta para uma ficha, e a ficha aponta para um produto.

Assim a tela consegue mostrar:

```text
FT-001 - Placa Poliframe 2,40m
```

---

## 6. Estado do formulário

```tsx
const [form, setForm] = useState({
  sheetId: "",
  quantity: 100,
  dueDate: "2026-04-30",
  priority: "Média" as ProductionOrder["priority"],
  responsible: "Carlos P."
});
```

Campos:

- `sheetId`: ficha técnica escolhida;
- `quantity`: quantidade a produzir;
- `dueDate`: prazo;
- `priority`: prioridade;
- `responsible`: responsável.

Por que já vem com valores padrão?

Para facilitar a demonstração.

Você consegue criar uma OP rapidamente sem preencher tudo do zero.

---

## 7. Ficha selecionada

```tsx
const selectedSheetId = form.sheetId || sheets[0]?.id || "";
```

Funciona assim:

1. Se o usuário escolheu uma ficha, usa ela.
2. Se não escolheu, usa a primeira ficha da lista.
3. Se não existe ficha, usa texto vazio.

Isso ajuda o fluxo a não travar durante a apresentação.

---

## 8. Função `sheetLabel`

```tsx
function sheetLabel(id: string) {
  const sheet = sheets.find((item) => item.id === id);
  const product = products.find((item) => item.id === sheet?.productId);
  return sheet && product ? `${sheet.code} - ${product.name}` : "Ficha não encontrada";
}
```

Essa função transforma o ID da ficha em um texto fácil de entender.

Exemplo:

```text
FT-001 - Placa Poliframe 2,40m
```

Ela faz dois passos:

1. Procura a ficha pelo ID.
2. Procura o produto ligado à ficha.

Por que isso existe?

Porque a ordem guarda `sheetId`, mas o usuário precisa ver o nome do produto.

---

## 9. Função `submit`

```tsx
function submit(event: FormEvent) {
  event.preventDefault();
  if (!selectedSheetId) return;
  addOrder({ ...form, sheetId: selectedSheetId });
}
```

Essa função roda quando o usuário clica em:

```text
Abrir OP
```

### `event.preventDefault()`

Impede recarregar a página.

### Validação

```tsx
if (!selectedSheetId) return;
```

Não deixa criar uma ordem sem ficha técnica.

### Salvando ordem

```tsx
addOrder({ ...form, sheetId: selectedSheetId });
```

Cria a ordem no sistema.

Depois disso, ela aparece:

- na tabela de ordens;
- no Kanban, na etapa inicial.

---

## 10. Cabeçalho da página

```tsx
<h2>Ordens de produção</h2>
<div className="subtitle">A OP nasce de uma ficha técnica aprovada e entra direto no Kanban.</div>
```

No front, isso explica a função da tela.

Também existe o botão:

```tsx
<Link className="btn btn-primary btn-lg" href="/kanban">
  Ver Kanban <ArrowRight size={18} />
</Link>
```

Esse botão leva para o quarto passo do fluxo.

---

## 11. Formulário de nova ordem

```tsx
<form className="card" onSubmit={submit}>
```

Cria um card com formulário.

Campos:

- ficha técnica;
- quantidade;
- prazo;
- prioridade;
- responsável.

---

## 12. Campo Ficha Técnica

```tsx
<select value={selectedSheetId} onChange={(e) => setForm({ ...form, sheetId: e.target.value })}>
  {sheets.map((sheet) => <option key={sheet.id} value={sheet.id}>{sheetLabel(sheet.id)}</option>)}
</select>
```

Esse campo lista as fichas técnicas disponíveis.

O `map` cria uma opção para cada ficha.

No front aparece:

```text
FT-001 - Placa Poliframe 2,40m
FT-002 - Reparô 500ml
```

---

## 13. Campos Quantidade e Prazo

```tsx
<input type="number" min="1" value={form.quantity} ... />
<input type="date" value={form.dueDate} ... />
```

Quantidade é número.

Prazo é data.

Esses campos são essenciais para uma ordem de produção.

---

## 14. Campo Prioridade

```tsx
<select value={form.priority} ...>
  <option>Alta</option>
  <option>Média</option>
  <option>Baixa</option>
</select>
```

Prioridade usa `select` porque são opções fechadas.

Isso evita digitação errada.

---

## 15. Campo Responsável

```tsx
<input value={form.responsible} ... />
```

Campo de texto livre para informar quem acompanha a OP.

---

## 16. Botão Abrir OP

```tsx
<button className="btn btn-primary" type="submit">
  <PlusCircle size={17} /> Abrir OP
</button>
```

Quando clicado, envia o formulário e chama `submit`.

No front aparece com ícone de mais.

---

## 17. Tabela de ordens geradas

```tsx
{orders.map((order) => (
  <tr key={order.id}>
    ...
  </tr>
))}
```

Lista todas as ordens.

Para cada ordem mostra:

- código da OP;
- responsável;
- ficha/produto;
- quantidade;
- prazo;
- etapa.

---

## 18. Formatando a data

```tsx
new Date(`${order.dueDate}T00:00:00`).toLocaleDateString("pt-BR")
```

Transforma a data para formato brasileiro.

Exemplo:

```text
30/04/2026
```

---

## 19. Mostrando a etapa

```tsx
<span className="badge badge-blue">{stageLabels[order.stage]}</span>
```

A ordem guarda a etapa de forma interna:

```text
recepcao
```

Mas a tela mostra:

```text
Recepção
```

Isso deixa o front mais amigável.

---

## 20. Resumo simples

Essa tela faz:

```text
Escolhe uma ficha técnica,
define quantidade, prazo, prioridade e responsável,
cria uma OP,
e manda essa OP para o Kanban.
```

Ela é o elo entre planejamento e execução.

