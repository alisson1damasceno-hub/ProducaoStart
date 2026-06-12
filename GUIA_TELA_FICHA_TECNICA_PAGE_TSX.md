# Guia da tela de Ficha Técnica (`app/ficha-tecnica/page.tsx`)

Este documento explica a tela de ficha técnica, juntando:

1. O que o código faz.
2. O que aparece no front-end.
3. Por que essa tela é importante no fluxo do MVP.

Arquivo explicado:

```text
app/ficha-tecnica/page.tsx
```

---

## 1. Objetivo dessa tela

A ficha técnica é o segundo passo do fluxo:

```text
Produto -> Ficha Técnica -> Ordem de Produção -> Kanban
```

Ela serve para transformar um produto cadastrado em algo que pode ser produzido.

Na prática, ela responde:

- qual produto será fabricado;
- quais insumos serão usados;
- quais etapas o produto passa;
- qual o tempo de ciclo;
- qual o custo unitário aproximado.

---

## 2. `"use client"`

```tsx
"use client";
```

Essa linha diz ao Next.js que a página precisa rodar no navegador.

Ela precisa disso porque usa:

- formulário;
- `useState`;
- clique de botão;
- dados salvos no navegador via `useMvpData`.

Sem isso, a tela não conseguiria reagir normalmente ao que o usuário digita.

---

## 3. Imports

```tsx
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardPlus } from "lucide-react";
import { Shell } from "../shared/shell";
import { useMvpData } from "../shared/store";
```

### `FormEvent`

Serve para tipar o evento do formulário.

Ajuda o TypeScript a entender que a função `submit` recebe um envio de formulário.

### `useState`

Guarda o que o usuário digita no formulário.

### `Link`

Cria navegação entre páginas.

Aqui é usado para o botão:

```text
Próximo
```

que leva para:

```text
/ordens
```

### `ArrowRight` e `ClipboardPlus`

Ícones usados no front.

- `ArrowRight`: botão de próximo.
- `ClipboardPlus`: botão de salvar ficha.

### `Shell`

Coloca cabeçalho e menu padrão na página.

### `useMvpData`

Dá acesso aos dados do MVP:

- produtos;
- fichas técnicas;
- função para criar ficha.

---

## 4. Função principal

```tsx
export default function TechnicalSheetsPage() {
```

Essa função é a página `/ficha-tecnica`.

Tudo que ela retorna aparece no navegador.

---

## 5. Pegando dados do sistema

```tsx
const { products, sheets, addSheet } = useMvpData();
```

Essa linha pega:

- `products`: lista de produtos cadastrados;
- `sheets`: lista de fichas técnicas existentes;
- `addSheet`: função que cria uma nova ficha.

No front:

- `products` alimenta o campo de seleção de produto;
- `sheets` alimenta a lista de fichas aprovadas;
- `addSheet` é chamado quando o usuário salva.

---

## 6. Estado do formulário

```tsx
const [form, setForm] = useState({
  productId: "",
  version: "1.0",
  cycleMinutes: 45,
  unitCost: 10,
  residue: "1 kg/un",
  inputs: "",
  steps: ""
});
```

Essa parte guarda os valores digitados no formulário.

Campos:

- `productId`: produto escolhido;
- `version`: versão da ficha;
- `cycleMinutes`: tempo de ciclo em minutos;
- `unitCost`: custo unitário;
- `residue`: resíduo usado;
- `inputs`: insumos;
- `steps`: etapas.

Por que usamos `useState`?

Porque o React precisa guardar esses valores enquanto o usuário digita.

---

## 7. Produto selecionado

```tsx
const selectedProductId = form.productId || products[0]?.id || "";
```

Essa linha escolhe qual produto está selecionado.

Ela funciona assim:

1. Se o usuário escolheu um produto, usa esse produto.
2. Se não escolheu, usa o primeiro produto da lista.
3. Se não existe produto, usa texto vazio.

Por que foi feita assim?

Para facilitar a demonstração.

Se já existem produtos cadastrados, a tela já vem com um produto selecionável.

---

## 8. Função `productName`

```tsx
function productName(id: string) {
  return products.find((product) => product.id === id)?.name || "Produto não encontrado";
}
```

Essa função recebe o ID de um produto e devolve o nome dele.

Por que precisa disso?

Porque a ficha técnica guarda o `productId`, não o nome do produto.

Guardar ID é melhor porque:

- o ID é único;
- o nome pode mudar;
- fica mais parecido com um sistema real.

No front, essa função permite mostrar:

```text
FT-001 - Placa Poliframe 2,40m
```

em vez de mostrar só:

```text
prod-1
```

---

## 9. Função `submit`

```tsx
function submit(event: FormEvent) {
  event.preventDefault();
  if (!selectedProductId || !form.inputs || !form.steps) return;
  addSheet({ ...form, productId: selectedProductId, status: "Aprovada" });
  setForm({ productId: selectedProductId, version: "1.0", cycleMinutes: 45, unitCost: 10, residue: "1 kg/un", inputs: "", steps: "" });
}
```

Essa função roda quando o usuário clica em:

```text
Salvar ficha
```

### `event.preventDefault()`

Impede o navegador de recarregar a página.

### Validação

```tsx
if (!selectedProductId || !form.inputs || !form.steps) return;
```

Essa linha impede salvar uma ficha sem:

- produto;
- insumos;
- etapas.

Por que esses campos?

Porque uma ficha técnica sem produto, insumos e etapas não prova o fluxo produtivo.

### Salvando

```tsx
addSheet({ ...form, productId: selectedProductId, status: "Aprovada" });
```

Essa linha cria a ficha técnica.

Ela copia os dados do formulário e adiciona:

```tsx
status: "Aprovada"
```

Por que aprovada?

Para simplificar o MVP.

Se a ficha já nasce aprovada, ela pode ser usada imediatamente na ordem de produção.

### Limpando o formulário

```tsx
setForm(...)
```

Depois de salvar, os campos principais voltam ao padrão.

---

## 10. Cabeçalho da página

```tsx
<div className="page-header">
  ...
  <Link className="btn btn-primary btn-lg" href="/ordens">
    Próximo <ArrowRight size={18} />
  </Link>
</div>
```

No front aparece:

```text
Fichas técnicas
Vincule o produto aos insumos, etapas e parâmetros básicos de produção.
```

E o botão:

```text
Próximo
```

que leva para:

```text
/ordens
```

---

## 11. Layout em duas colunas

```tsx
<div className="two-col">
```

Divide a tela em:

```text
[ Formulário de nova ficha ] [ Lista de fichas aprovadas ]
```

Isso ajuda porque o usuário cria a ficha e vê o resultado na mesma tela.

---

## 12. Formulário da ficha

```tsx
<form className="card" onSubmit={submit}>
```

`className="card"` dá visual de bloco branco.

`onSubmit={submit}` conecta o formulário à função de salvar.

---

## 13. Campo Produto

```tsx
<select value={selectedProductId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
  {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
</select>
```

Esse campo mostra os produtos cadastrados.

O `map` cria uma opção para cada produto.

Exemplo:

```text
Placa Poliframe 2,40m
Reparô 500ml
```

Quando o usuário escolhe um produto, o `productId` do formulário é atualizado.

---

## 14. Campos versão, ciclo e custo

```tsx
<input value={form.version} ... />
<input type="number" value={form.cycleMinutes} ... />
<input type="number" step="0.01" value={form.unitCost} ... />
```

Esses campos definem informações técnicas básicas.

No front:

- versão aparece como texto;
- ciclo aparece como número;
- custo aceita centavos por causa de `step="0.01"`.

---

## 15. Campo Resíduo

```tsx
<input value={form.residue} onChange={(e) => setForm({ ...form, residue: e.target.value })} />
```

Mostra o resíduo usado por unidade.

Exemplo:

```text
7,5 kg/un
120g/un
```

---

## 16. Campos Insumos e Etapas

```tsx
<textarea value={form.inputs} ... />
<textarea value={form.steps} ... />
```

São campos maiores porque podem ter mais texto.

Exemplo de insumos:

```text
PEAD reciclado, pigmento verde, aditivo UV
```

Exemplo de etapas:

```text
Triagem, moagem, mistura, prensagem, inspeção
```

Esses campos deixam claro que a ficha técnica tem conteúdo produtivo.

---

## 17. Lista de fichas aprovadas

```tsx
{sheets.map((sheet) => (
  <article className="list-card" key={sheet.id}>
    ...
  </article>
))}
```

Essa parte lista todas as fichas.

Para cada ficha, mostra:

- código;
- produto;
- versão;
- ciclo;
- custo;
- etapas;
- status.

No front aparece algo parecido com:

```text
FT-001 - Placa Poliframe 2,40m
v2.1 · ciclo 45 min · R$ 18.40/un
Triagem, moagem, mistura...
Aprovada
```

---

## 18. Resumo simples

Essa tela faz o seguinte:

```text
Escolhe um produto,
preenche dados técnicos,
salva uma ficha aprovada,
e mostra essa ficha na lista.
```

Ela é importante porque sem ficha técnica não faz sentido abrir uma ordem de produção.

