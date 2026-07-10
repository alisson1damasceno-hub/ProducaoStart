# Guia do backend com Supabase e Next.js

Este documento explica as melhorias feitas para ligar o MVP ao Supabase.

Objetivo:

```text
Front Next.js -> API Routes do Next.js -> Supabase
```

Assim o front nÃ£o acessa a chave secreta diretamente.

---

## 1. Por que nÃ£o colocar a chave secreta no front

VocÃª recebeu duas chaves:

- uma chave publicÃ¡vel;
- uma chave secreta.

A chave publicÃ¡vel pode aparecer no front.

A chave secreta nÃ£o pode.

Ela deve ficar apenas no backend, porque tem permissÃµes maiores no projeto.

Por isso foi criada esta estrutura:

```text
app/api
â”œâ”€â”€ mvp-data
â”‚   â””â”€â”€ route.ts
â”œâ”€â”€ products
â”‚   â””â”€â”€ route.ts
â”œâ”€â”€ sheets
â”‚   â””â”€â”€ route.ts
â”œâ”€â”€ orders
â”‚   â”œâ”€â”€ route.ts
â”‚   â””â”€â”€ [id]
â”‚       â””â”€â”€ route.ts
â”œâ”€â”€ reset-demo
â”‚   â””â”€â”€ route.ts
â””â”€â”€ shared
    â””â”€â”€ supabase-rest.ts
```

Esses arquivos sÃ£o o backend do MVP dentro do prÃ³prio Next.js.

---

## 2. Fluxo novo da aplicaÃ§Ã£o

Antes:

```text
Tela -> localStorage
```

Agora:

```text
Tela -> /api/... -> Supabase
```

Se o Supabase nÃ£o estiver configurado ainda, o sistema tenta continuar com `localStorage` para a demonstraÃ§Ã£o nÃ£o parar.

---

## 3. Arquivo `.env.local.example`

Foi criado:

```text
.env.local.example
```

Ele mostra quais variÃ¡veis precisam existir:

```text
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_REST_KEY=sb_publishable_sua_chave_publishable_ou_service_role
```

Para rodar localmente, crie um arquivo chamado:

```text
.env.local
```

com os valores reais.

Importante:

```text
.env.local nÃ£o deve ir para o GitHub.
```

Por isso tambÃ©m foi criado `.gitignore`.

---

## 4. Arquivo `.gitignore`

Foi criado:

```text
.gitignore
```

Ele impede enviar arquivos sensÃ­veis ou desnecessÃ¡rios para o GitHub.

Inclui:

```text
.env.local
node_modules
.next
```

Isso protege a chave secreta.

---

## 5. Arquivo `supabase_schema.sql`

Esse arquivo cria as tabelas no Supabase.

Tabelas:

```text
products
technical_sheets
production_orders
```

RelaÃ§Ãµes:

```text
technical_sheets.product_id -> products.id
production_orders.sheet_id -> technical_sheets.id
```

Isso representa o fluxo:

```text
Produto -> Ficha TÃ©cnica -> Ordem de ProduÃ§Ã£o
```

---

## 6. Arquivo `supabase_seed.sql`

Esse arquivo coloca dados iniciais no banco.

Ele cria:

- produtos de exemplo;
- fichas tÃ©cnicas de exemplo;
- ordens de exemplo.

Use depois de rodar o `supabase_schema.sql`.

---

## 7. Arquivo `app/api/shared/supabase-rest.ts`

Esse Ã© o arquivo central do backend.

Ele faz a comunicaÃ§Ã£o com o Supabase via REST API.

FunÃ§Ãµes principais:

- `getMvpData`;
- `insertProduct`;
- `insertSheet`;
- `insertOrder`;
- `updateOrderStage`;
- `resetMvpData`.

---

## 8. FunÃ§Ã£o `getMvpData`

Ela busca todos os dados principais:

```text
products
technical_sheets
production_orders
```

Ela Ã© usada pela rota:

```text
GET /api/mvp-data
```

O front chama essa rota quando a pÃ¡gina abre.

---

## 9. FunÃ§Ã£o `insertProduct`

Salva produto no Supabase.

Ã‰ usada pela rota:

```text
POST /api/products
```

Quando vocÃª salva um produto na tela, o front manda para essa rota.

---

## 10. FunÃ§Ã£o `insertSheet`

Salva ficha tÃ©cnica no Supabase.

Ã‰ usada pela rota:

```text
POST /api/sheets
```

---

## 11. FunÃ§Ã£o `insertOrder`

Salva ordem de produÃ§Ã£o no Supabase.

Ã‰ usada pela rota:

```text
POST /api/orders
```

---

## 12. FunÃ§Ã£o `updateOrderStage`

Atualiza a etapa da ordem.

Ã‰ usada pela rota:

```text
PATCH /api/orders/[id]
```

Quando vocÃª avanÃ§a uma OP no Kanban, essa rota salva a nova etapa no Supabase.

---

## 13. FunÃ§Ã£o `resetMvpData`

Apaga os dados atuais e recria os dados de demonstraÃ§Ã£o.

Ã‰ usada pela rota:

```text
POST /api/reset-demo
```

Ela faz o botÃ£o "Reset demo" funcionar tambÃ©m com banco de dados.

---

## 14. MudanÃ§a no `store.ts`

O `store.ts` agora tenta usar o backend.

Fluxo:

```text
1. Tenta buscar dados em /api/mvp-data
2. Se funcionar, usa Supabase
3. Se falhar, usa localStorage
```

Isso deixa o MVP mais resistente.

Se o Supabase ainda nÃ£o estiver pronto, a interface nÃ£o morre.

---

## 15. Indicador visual no front

Foi adicionado um aviso no topo:

```text
Backend Supabase conectado
```

ou:

```text
Usando localStorage porque o backend ainda nÃ£o respondeu.
```

Isso ajuda vocÃª a saber se estÃ¡ usando banco real ou modo local.

---

## 16. Como configurar no Supabase

No painel do Supabase:

1. Entre no projeto.
2. VÃ¡ em SQL Editor.
3. Rode o conteÃºdo de:

```text
supabase_schema.sql
```

4. Depois rode o conteÃºdo de:

```text
supabase_seed.sql
```

---

## 17. Como configurar localmente

Crie um arquivo:

```text
.env.local
```

com:

```text
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
SUPABASE_REST_KEY=sua-chave-rest
```

Depois rode:

```bash
npm run dev
```

---

## 18. Como configurar na Vercel

No painel da Vercel:

1. Entre no projeto.
2. VÃ¡ em Settings.
3. VÃ¡ em Environment Variables.
4. Adicione:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_REST_KEY
```

5. FaÃ§a redeploy.

---

## 19. Resumo simples

Antes o MVP era sÃ³ front.

Agora ele tem:

```text
Front-end: pÃ¡ginas do app
Backend: rotas em app/api
Banco: Supabase
Fallback: localStorage
```

Essa Ã© uma arquitetura boa para apresentaÃ§Ã£o porque mostra evoluÃ§Ã£o real sem deixar o projeto complexo demais.


