# Guia da tela de Produtos (`app/produtos/page.tsx`)

Este documento explica a tela de produtos do MVP, juntando duas partes:

1. O que o código faz.
2. O que aparece no front-end.

Arquivo explicado:

```text
app/produtos/page.tsx
```

---

## 1. Objetivo dessa tela

A tela de produtos é o primeiro passo do fluxo:

```text
Produto -> Ficha Técnica -> Ordem de Produção -> Kanban
```

Ela serve para:

- cadastrar um produto;
- listar os produtos já cadastrados;
- permitir seguir para a ficha técnica.

---

## 2. Código completo dividido por partes

### Parte 1: `"use client"`

```tsx
"use client";
```

No Next.js, os arquivos dentro da pasta `app` podem rodar no servidor por padrão.

Mas essa tela precisa funcionar no navegador, porque ela usa:

- formulário;
- clique de botão;
- `useState`;
- `localStorage`, indiretamente pelo `useMvpData`.

Por isso colocamos:

```tsx
"use client";
```

Isso avisa ao Next.js:

```text
Essa página é interativa e precisa rodar no navegador.
```

No front-end, isso permite que o usuário digite no formulário e salve produtos sem recarregar a página.

---

## 3. Imports

```tsx
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackagePlus } from "lucide-react";
import { Shell } from "../shared/shell";
import { useMvpData } from "../shared/store";
```

Essas linhas trazem ferramentas que a página usa.

### `FormEvent`

Usado para dizer ao TypeScript que a função `submit` recebe um evento de formulário.

Ajuda o editor a entender o tipo correto.

### `useState`

Usado para guardar o que o usuário digita nos campos.

Exemplo:

```text
Nome do produto
SKU
Categoria
Linha
% reciclado
```

### `Link`

Componente do Next.js para navegar entre páginas.

Aqui ele é usado no botão:

```text
Próximo
```

Esse botão leva para:

```text
/ficha-tecnica
```

### `ArrowRight` e `PackagePlus`

São ícones da biblioteca `lucide-react`.

No front:

- `ArrowRight` aparece no botão "Próximo";
- `PackagePlus` aparece no botão "Salvar produto".

### `Shell`

É o componente que coloca o cabeçalho e o menu padrão do sistema.

Sem ele, a tela teria só o formulário e a tabela.

Com ele, a tela ganha:

- topo verde;
- menu de navegação;
- botão de reset da demo.

### `useMvpData`

É o hook que dá acesso aos dados do MVP.

Nessa tela, ele fornece:

- a lista de produtos;
- a função para adicionar produto.

---

## 4. Função principal da página

```tsx
export default function ProductsPage() {
```

Essa função é a própria página `/produtos`.

No Next.js, quando existe:

```text
app/produtos/page.tsx
```

o navegador acessa essa função em:

```text
/produtos
```

Tudo que essa função retorna aparece na tela.

---

## 5. Pegando dados do MVP

```tsx
const { products, addProduct } = useMvpData();
```

Aqui a tela está pedindo duas coisas:

### `products`

É a lista de produtos cadastrados.

Essa lista aparece na tabela do lado direito.

### `addProduct`

É a função que salva um produto novo.

Ela é chamada quando o usuário envia o formulário.

No front, isso liga o formulário à tabela:

```text
preenche formulário -> clica salvar -> produto aparece na tabela
```

---

## 6. Estado do formulário

```tsx
const [form, setForm] = useState({
  name: "",
  sku: "",
  category: "Poliframe",
  line: "Linha 01",
  recycledPercent: 60
});
```

Essa parte cria uma memória para o formulário.

### `form`

Guarda os valores atuais dos campos.

Exemplo:

```ts
{
  name: "Placa Poliframe 1,20m",
  sku: "POL-120-STD",
  category: "Poliframe",
  line: "Linha 01",
  recycledPercent: 60
}
```

### `setForm`

Atualiza o formulário quando o usuário digita.

Por que isso é necessário?

Porque no React os campos normalmente são controlados pelo estado.

Ou seja:

```text
o valor que aparece no input vem do form
quando o usuário digita, setForm atualiza o form
```

No front, isso faz os campos responderem ao que o usuário digita.

---

## 7. Função `submit`

```tsx
function submit(event: FormEvent) {
  event.preventDefault();
  if (!form.name || !form.sku) return;
  addProduct({ ...form, status: "Ativo" });
  setForm({ name: "", sku: "", category: "Poliframe", line: "Linha 01", recycledPercent: 60 });
}
```

Essa função roda quando o usuário clica em:

```text
Salvar produto
```

ou aperta Enter dentro do formulário.

---

### `event.preventDefault()`

```tsx
event.preventDefault();
```

Por padrão, quando um formulário HTML é enviado, o navegador recarrega a página.

Em React, normalmente não queremos isso.

Então essa linha impede o recarregamento.

No front, isso faz o produto ser salvo sem piscar a tela.

---

### Validação simples

```tsx
if (!form.name || !form.sku) return;
```

Essa linha impede salvar produto sem nome ou sem SKU.

Se o nome estiver vazio, a função para.

Se o SKU estiver vazio, a função para.

Por que só valida esses dois?

Porque este é um MVP.

Nome e SKU são os campos mínimos para um produto fazer sentido.

---

### Salvando o produto

```tsx
addProduct({ ...form, status: "Ativo" });
```

Aqui a função envia os dados do formulário para o `store`.

O `...form` significa:

```text
copie todos os campos do formulário
```

Então ele envia:

- name;
- sku;
- category;
- line;
- recycledPercent.

E adiciona:

```tsx
status: "Ativo"
```

Por quê?

Porque todo produto cadastrado por essa tela entra como ativo.

No front, depois disso, o produto aparece na tabela.

---

### Limpando o formulário

```tsx
setForm({ name: "", sku: "", category: "Poliframe", line: "Linha 01", recycledPercent: 60 });
```

Depois de salvar, essa linha limpa o formulário.

Ela volta para os valores iniciais:

- nome vazio;
- SKU vazio;
- categoria Poliframe;
- linha Linha 01;
- reciclado 60%.

No front, isso deixa a tela pronta para cadastrar outro produto.

---

## 8. O `return`

```tsx
return (
  ...
);
```

Tudo dentro do `return` é a interface visual da página.

Esse código parece HTML, mas na verdade é JSX.

JSX é a forma do React escrever interface usando JavaScript/TypeScript.

---

## 9. Componente `Shell`

```tsx
<Shell active="produtos">
  ...
</Shell>
```

O `Shell` envolve a página.

Ele coloca:

- cabeçalho;
- navegação;
- botão reset.

O atributo:

```tsx
active="produtos"
```

serve para deixar o item "Produtos" marcado no menu.

No front, isso mostra que o usuário está na página de produtos.

---

## 10. Cabeçalho da página

```tsx
<div className="page-header">
  <div>
    <h2>Produtos</h2>
    <div className="subtitle">Primeiro passo do fluxo: cadastre o item que será produzido.</div>
  </div>
  <Link className="btn btn-primary btn-lg" href="/ficha-tecnica">
    Próximo <ArrowRight size={18} />
  </Link>
</div>
```

Essa parte cria o título da tela.

No front aparece:

```text
Produtos
Primeiro passo do fluxo: cadastre o item que será produzido.
```

E também aparece o botão:

```text
Próximo ->
```

Esse botão leva para:

```text
/ficha-tecnica
```

Por que isso existe?

Para guiar o usuário pelo fluxo do MVP.

Depois de cadastrar produto, o próximo passo natural é criar a ficha técnica.

---

## 11. Layout em duas colunas

```tsx
<div className="two-col">
```

Essa classe divide a tela em duas partes:

1. Formulário à esquerda.
2. Tabela à direita.

No CSS, essa classe usa grid.

Visualmente fica assim:

```text
[ Formulário de novo produto ] [ Catálogo de produtos ]
```

Por que foi feito assim?

Porque o usuário consegue cadastrar e ver o resultado na mesma tela.

---

## 12. Formulário

```tsx
<form className="card" onSubmit={submit}>
```

Essa linha cria o formulário.

`className="card"` deixa ele com visual de card.

`onSubmit={submit}` liga o formulário à função `submit`.

No front, quando o usuário salva, essa função roda.

---

## 13. Campo Nome

```tsx
<input
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  placeholder="Ex: Placa Poliframe 1,20m"
/>
```

Esse campo mostra e altera:

```tsx
form.name
```

Quando o usuário digita, acontece:

```tsx
setForm({ ...form, name: e.target.value })
```

Isso significa:

```text
mantenha todo o formulário como está, mas troque o campo name
```

Por que usa `...form`?

Porque se você atualizasse só `name`, perderia os outros campos.

---

## 14. Campo SKU

```tsx
<input
  value={form.sku}
  onChange={(e) => setForm({ ...form, sku: e.target.value })}
  placeholder="POL-120-STD"
/>
```

Funciona igual ao campo nome.

Ele controla:

```tsx
form.sku
```

SKU é o código interno do produto.

Exemplo:

```text
POL-120-STD
```

---

## 15. Campo `% reciclado`

```tsx
<input
  type="number"
  min="0"
  max="100"
  value={form.recycledPercent}
  onChange={(e) => setForm({ ...form, recycledPercent: Number(e.target.value) })}
/>
```

Esse campo é numérico.

Por isso usa:

```tsx
type="number"
```

Também limita:

```tsx
min="0"
max="100"
```

O valor digitado no HTML vem como texto.

Por isso usamos:

```tsx
Number(e.target.value)
```

para transformar em número.

---

## 16. Campo Categoria

```tsx
<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
  <option>Poliframe</option>
  <option>Reparô</option>
  <option>Composteira</option>
</select>
```

Esse campo é uma lista de opções.

No front, o usuário escolhe entre:

- Poliframe;
- Reparô;
- Composteira.

Por que usar `select`?

Porque categoria deve ter opções controladas.

Isso evita o usuário digitar categorias diferentes com erro de escrita.

---

## 17. Campo Linha

```tsx
<input
  value={form.line}
  onChange={(e) => setForm({ ...form, line: e.target.value })}
/>
```

Esse campo guarda a linha produtiva.

Exemplo:

```text
Linha 01
Envase
Montagem
```

Foi deixado como texto livre porque as linhas podem variar.

---

## 18. Botão Salvar produto

```tsx
<button className="btn btn-primary" type="submit">
  <PackagePlus size={17} /> Salvar produto
</button>
```

Esse botão envia o formulário.

Como ele tem:

```tsx
type="submit"
```

ele aciona:

```tsx
onSubmit={submit}
```

No front, ele aparece com ícone e texto.

---

## 19. Card do catálogo

```tsx
<div className="card table-card">
  <h3>Catálogo</h3>
  ...
</div>
```

Essa parte mostra os produtos cadastrados.

`card` dá o visual de bloco branco.

`table-card` ajuda no responsivo, especialmente em telas menores.

---

## 20. Tabela

```tsx
<table>
  <thead>
    ...
  </thead>
  <tbody>
    ...
  </tbody>
</table>
```

A tabela tem cabeçalho e corpo.

Cabeçalho:

```text
Produto | Categoria | Linha | Reciclado | Status
```

Corpo:

Mostra os produtos cadastrados.

---

## 21. Listando produtos com `map`

```tsx
{products.map((product) => (
  <tr key={product.id}>
    ...
  </tr>
))}
```

Essa parte percorre a lista de produtos.

Para cada produto, ela cria uma linha na tabela.

Exemplo:

Se existem 3 produtos, o `map` cria 3 linhas.

Por que precisa do `key`?

```tsx
key={product.id}
```

O React usa `key` para identificar cada item da lista.

Isso ajuda a atualizar a tela corretamente.

---

## 22. Mostrando os dados do produto

```tsx
<strong>{product.name}</strong>
<span className="meta">SKU: {product.sku}</span>
```

Mostra nome e SKU.

No front aparece algo como:

```text
Placa Poliframe 2,40m
SKU: POL-240-STD
```

Depois:

```tsx
<td>{product.category}</td>
<td>{product.line}</td>
<td>{product.recycledPercent}%</td>
```

Mostra categoria, linha e percentual reciclado.

Por fim:

```tsx
<span className="badge badge-green">{product.status}</span>
```

Mostra o status em um selo verde.

---

## 23. Como o front se comporta

Fluxo visual da tela:

```text
1. Usuário entra em /produtos
2. Vê formulário do lado esquerdo
3. Vê catálogo do lado direito
4. Preenche nome, SKU, categoria, linha e reciclado
5. Clica em Salvar produto
6. Produto aparece no catálogo
7. Usuário clica em Próximo
8. Vai para /ficha-tecnica
```

---

## 24. Por que essa tela foi feita desse jeito

A tela foi pensada para MVP.

Por isso ela é:

- simples;
- direta;
- sem backend;
- sem várias etapas;
- com resultado visível imediatamente.

Ela resolve o primeiro problema do fluxo:

```text
Antes de criar ficha técnica, precisa existir produto.
```

---

## 25. Resumo em linguagem simples

A tela de produtos faz o seguinte:

```text
Guarda o que o usuário digita,
valida se tem nome e SKU,
salva o produto,
limpa o formulário,
e mostra o produto na tabela.
```

O código principal por trás disso é:

```tsx
const { products, addProduct } = useMvpData();
```

Essa linha conecta a tela aos dados.

E:

```tsx
addProduct({ ...form, status: "Ativo" });
```

Essa linha realmente salva o produto.

