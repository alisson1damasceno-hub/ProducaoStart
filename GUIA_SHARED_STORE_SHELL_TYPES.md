# Guia da pasta `shared`

Este documento explica a pasta:

```text
app/shared
```

Essa pasta não é uma página.

Ela guarda código reaproveitado pelas páginas.

Estrutura:

```text
app/shared
├── seed.ts
├── shell.tsx
├── store.ts
└── types.ts
```

---

## 1. Por que existe a pasta `shared`

Se cada página tivesse sua própria lógica de dados, o projeto ficaria repetido e confuso.

A pasta `shared` evita isso.

Ela centraliza:

- tipos dos dados;
- dados iniciais;
- salvamento no navegador;
- layout comum das páginas.

---

## 2. `types.ts`

Esse arquivo define o formato dos dados.

Ele responde:

```text
Como é um produto?
Como é uma ficha técnica?
Como é uma ordem?
Quais etapas existem?
```

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

Isso significa que todo produto precisa ter esses campos.

Por que isso ajuda?

Porque o TypeScript avisa se algum dado estiver faltando ou errado.

---

## 3. `ProductionStage`

```ts
export type ProductionStage =
  | "recepcao"
  | "processamento"
  | "fabricacao"
  | "qualidade"
  | "embalagem"
  | "concluido";
```

Esse tipo define as etapas possíveis do Kanban.

Por que isso é bom?

Porque impede usar etapa escrita errada.

Exemplo errado:

```text
recepção
```

Exemplo certo:

```text
recepcao
```

Internamente usamos sem acento para evitar problema técnico.

Na tela mostramos com acento usando `stageLabels`.

---

## 4. `seed.ts`

Esse arquivo guarda dados iniciais.

Ele tem:

```ts
export const seedData: MvpData = {
  products: [...],
  sheets: [...],
  orders: [...]
};
```

Por que existe?

Para o MVP abrir com dados de exemplo.

Isso evita uma apresentação com tela vazia.

---

## 5. `stageLabels`

```ts
export const stageLabels = {
  recepcao: "Recepção",
  processamento: "Processamento",
  fabricacao: "Fabricação",
  qualidade: "Qualidade",
  embalagem: "Embalagem",
  concluido: "Concluído"
} as const;
```

Esse objeto traduz nomes internos para nomes bonitos.

Interno:

```text
recepcao
```

Na tela:

```text
Recepção
```

---

## 6. `store.ts`

Esse é o motor do MVP.

Ele controla:

- carregar dados;
- salvar dados;
- adicionar produto;
- adicionar ficha;
- adicionar ordem;
- mover ordem;
- resetar demonstração.

---

## 7. `STORAGE_KEY`

```ts
export const STORAGE_KEY = "start-solidarium-mvp";
```

É o nome usado para salvar os dados no `localStorage`.

Pense nele como a etiqueta da gaveta onde os dados ficam guardados no navegador.

---

## 8. `createId`

Cria IDs para produtos, fichas e ordens.

Como não existe banco de dados ainda, o próprio front cria IDs temporários.

---

## 9. `loadData`

Carrega dados do navegador.

Se não encontrar nada, usa `seedData`.

Se encontrar dados quebrados, também usa `seedData`.

Isso evita que o sistema quebre durante a apresentação.

---

## 10. `useMvpData`

É o hook principal.

As páginas usam ele assim:

```ts
const { products, addProduct } = useMvpData();
```

Ou:

```ts
const { orders, moveOrder } = useMvpData();
```

Ele é o ponto central de acesso aos dados.

---

## 11. `shell.tsx`

Esse arquivo cria o layout comum.

Ele mostra:

- cabeçalho;
- menu;
- botão reset.

As páginas usam assim:

```tsx
<Shell active="produtos">
  conteúdo da página
</Shell>
```

O `active` indica qual item do menu fica destacado.

---

## 12. Por que isso é importante

A pasta `shared` deixa o projeto mais organizado.

Sem ela, cada página teria que repetir:

- menu;
- lógica de dados;
- tipos;
- dados iniciais.

Com ela, o código fica mais fácil de entender e evoluir.

