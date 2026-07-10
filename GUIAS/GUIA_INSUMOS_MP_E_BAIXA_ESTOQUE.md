# Guia: matérias-primas, custo individual e baixa prevista de estoque

Este guia explica a melhoria feita no MVP para discriminar os insumos da ficha técnica.

Antes, a ficha tinha apenas um campo de texto:

```text
PEAD reciclado, pigmento verde, aditivo UV
```

Isso era bom para apresentação visual, mas ruim para controle produtivo, porque o sistema não sabia:

- quanto de cada matéria-prima era usado;
- qual era a unidade de medida;
- quanto custava cada matéria-prima;
- quanto deveria ser baixado do estoque quando uma OP fosse aberta.

Agora cada ficha técnica tem uma lista estruturada de matérias-primas.

---

## 1. Novo tipo `RawMaterial`

Arquivo:

```text
app/shared/types.ts
```

Foi criado este tipo:

```ts
export type RawMaterial = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
};
```

O que cada campo significa:

- `id`: identificador interno da matéria-prima dentro da ficha.
- `name`: nome da MP, por exemplo `PEAD reciclado`.
- `quantity`: quantidade usada para produzir 1 unidade do produto.
- `unit`: unidade de medida, por exemplo `kg`, `g`, `un`, `L`.
- `unitCost`: custo de 1 unidade dessa MP.

Exemplo:

```ts
{
  name: "PEAD reciclado",
  quantity: 7.2,
  unit: "kg",
  unitCost: 2.1
}
```

Isso quer dizer:

```text
Para produzir 1 unidade do produto, usa 7,2 kg de PEAD.
Cada kg custa R$ 2,10.
```

---

## 2. A ficha técnica agora guarda as MPs

Ainda em:

```text
app/shared/types.ts
```

A ficha recebeu este campo:

```ts
rawMaterials: RawMaterial[];
```

Agora a ficha técnica representa melhor a produção:

```text
Produto -> Ficha Técnica -> Lista de MP -> Ordem de Produção -> Kanban
```

O campo antigo `inputs` foi mantido para compatibilidade, mas agora ele vira um resumo textual automático das MPs.

---

## 3. Funções criadas para calcular custo e consumo

Arquivo:

```text
app/shared/materials.ts
```

### `materialLineCost`

```ts
export function materialLineCost(material) {
  return material.quantity * material.unitCost;
}
```

Ela calcula o custo de uma MP para 1 unidade produzida.

Exemplo:

```text
7,2 kg x R$ 2,10 = R$ 15,12
```

Foi escrita separada porque esse cálculo aparece em vários lugares:

- ficha técnica;
- tela de ordens;
- visão geral de OPs;
- Kanban.

---

### `sheetMaterialCost`

```ts
export function sheetMaterialCost(sheet) {
  return sheet.rawMaterials.reduce((total, material) => total + materialLineCost(material), 0);
}
```

Ela soma todas as MPs da ficha e encontra o custo total de matéria-prima por unidade produzida.

Exemplo:

```text
PEAD + pigmento + aditivo + embalagem = custo MP/un
```

---

### `cleanRawMaterials`

Essa função limpa os dados digitados no formulário.

Ela:

- remove MP sem nome;
- garante que quantidade e custo sejam números;
- coloca `un` como unidade padrão se a pessoa esquecer.

Isso evita salvar lixo no banco.

---

### `materialSummary`

Ela transforma a lista estruturada em texto simples.

Exemplo:

```text
PEAD reciclado, pigmento verde, aditivo UV
```

Isso mantém o campo antigo `inputs` funcionando.

---

### `orderMaterialConsumption`

Essa é a função mais importante para o controle de estoque.

Ela pega:

```text
MP usada por 1 unidade x quantidade da OP
```

Exemplo:

```text
7,2 kg por unidade x OP de 80 unidades = 576 kg de PEAD
```

É isso que aparece como baixa prevista de MP na tela de ordens.

---

## 4. O que mudou na tela de ficha técnica

Arquivo:

```text
app/ficha-tecnica/page.tsx
```

O campo antigo de texto livre foi substituído por uma mini-tabela:

```text
MP | Qtd | Un. | Custo unit. | Custo/un.
```

Agora você pode cadastrar:

- nome da matéria-prima;
- quantidade usada por unidade;
- unidade de medida;
- custo unitário;
- custo calculado automaticamente.

O botão `Adicionar MP` permite inserir várias matérias-primas na mesma ficha.

O custo total por unidade é calculado automaticamente e salvo na ficha.

---

## 5. O que mudou na tela de ordens

Arquivo:

```text
app/ordens/page.tsx
```

Quando você escolhe uma ficha e informa a quantidade da OP, a tela mostra:

```text
Baixa prevista de MP
```

Exemplo:

```text
PEAD reciclado: 576 kg
Pigmento verde: 6,4 kg
Aditivo UV: 2,4 kg
```

Também mostra o custo previsto total da OP.

Isso prova para o professor que o fluxo não é só visual: a OP usa dados reais da ficha técnica para prever consumo produtivo.

---

## 6. O que mudou na visão geral de OPs

Arquivo:

```text
app/ops/page.tsx
```

Foi adicionada a coluna:

```text
MP prevista
```

Assim dá para ver todas as OPs e comparar rapidamente o custo previsto de matéria-prima.

---

## 7. O que mudou no Kanban

Arquivo:

```text
app/kanban/page.tsx
```

Cada card de OP agora mostra também:

```text
MP R$ valor
```

O Kanban continua sendo o ponto alto da apresentação, mas agora ele tem um dado produtivo importante junto do status.

---

## 8. O que mudou no Supabase

Foi adicionada uma coluna nova na tabela:

```text
technical_sheets.raw_materials
```

Tipo:

```sql
jsonb
```

Por que `jsonb`?

Porque cada ficha pode ter uma quantidade diferente de matérias-primas.

Uma ficha pode ter 3 MPs, outra pode ter 8. Guardar isso em JSON simplifica o MVP sem criar uma arquitetura grande demais.

Para um ERP completo no futuro, o ideal seria criar tabelas separadas:

```text
raw_materials
technical_sheet_items
stock_movements
```

Mas para o MVP acadêmico, `jsonb` no Supabase é um ótimo meio-termo: funcional, rápido e fácil de explicar.

---

## 9. SQL que precisa rodar no Supabase

Arquivo criado:

```text
supabase_raw_materials_migration.sql
```

Rode esse arquivo no SQL Editor do Supabase.

Ele faz duas coisas:

1. cria a coluna `raw_materials`;
2. preenche as fichas de exemplo com MPs detalhadas.

---

## 10. Resumo para apresentar

Você pode explicar assim:

```text
Cada ficha técnica possui uma lista de matérias-primas com quantidade e custo individual.
Quando uma ordem de produção é criada, o sistema multiplica o consumo por unidade pela quantidade da OP.
Com isso, conseguimos prever a baixa de estoque e o custo de matéria-prima antes da produção avançar no Kanban.
```

Esse é exatamente o tipo de fluxo funcional que um MVP precisa provar.
