# Guia de Deploy no Render — TurboFood

Guia para quem vai publicar o projeto. Tempo estimado: ~20 min (fora o build).
O repositório já tem um `render.yaml` que cria os 3 recursos automaticamente.

> Pré-requisito: o código já deve estar no GitHub, na branch
> `claude/tubofood-frontend-backend-zkgb83` (ou na `main`).

---

## Opção A — Blueprint (recomendada, cria tudo de uma vez)

1. Acesse https://dashboard.render.com → **New +** → **Blueprint**.
2. Conecte a conta do GitHub e selecione o repositório **turboFood**.
3. Escolha a branch onde está o código e confirme. O Render vai ler o
   `render.yaml` e criar **3 recursos**:
   - `turbofood-db` — banco Postgres
   - `turbofood-api` — backend (Node)
   - `turbofood-web` — frontend (site estático Vite)
4. Clique em **Apply**. Aguarde o primeiro deploy (o backend sobe sozinho e o
   `DATABASE_URL` já é injetado com SSL).
5. **Ajuste as duas variáveis que dependem das URLs geradas:**
   - Copie a URL do **turbofood-web** (ex.: `https://turbofood-web.onrender.com`)
     e cole em **turbofood-api → Environment → `CORS_ORIGIN`**.
   - Copie a URL do **turbofood-api** (ex.: `https://turbofood-api.onrender.com`)
     e cole em **turbofood-web → Environment → `VITE_API_URL`**.
   - Salve. Isso dispara um novo deploy de cada serviço (o frontend precisa
     rebuildar para embutir a `VITE_API_URL`).

Pronto. Backend em `https://turbofood-api.onrender.com` (Swagger em `/api-docs`)
e frontend em `https://turbofood-web.onrender.com`.

---

## Opção B — Manual (caso o Blueprint dê problema)

**1) Banco:** New + → **PostgreSQL** → nome `turbofood-db` → Free → Create.
Copie a **Internal Database URL**.

**2) Backend:** New + → **Web Service** → repositório turboFood.
- Root Directory: *(vazio / raiz)*
- Runtime: Node · Build: `npm install` · Start: `npm start`
- Environment:
  - `DATABASE_URL` = a Internal Database URL do passo 1
  - `NODE_ENV` = `production`
  - `CORS_ORIGIN` = (preencher depois com a URL do frontend)
- Create Web Service.

**3) Frontend:** New + → **Static Site** → mesmo repositório.
- Root Directory: `frontend`
- Build: `npm install && npm run build` · Publish Directory: `dist`
- Environment: `VITE_API_URL` = URL do backend do passo 2
- **Redirects/Rewrites** (para o React Router): Source `/*` → Destination
  `/index.html` → Action **Rewrite**.
- Create Static Site.

**4)** Volte no backend e preencha `CORS_ORIGIN` com a URL do frontend. Salve.

---

## Preparar o banco com o cenário (Observação 1 — IMPORTANTE)

O script de seed popula categorias, produtos, clientes, endereços, veículos,
entregadores, pedidos, pagamentos e avaliações. **Atenção: ele apaga e recria as
tabelas (`force:true`), então rode apenas uma vez, antes da apresentação.**

Jeito mais simples (rodando da própria máquina, apontando para o banco do Render):

1. No `turbofood-db` do Render, copie a **External Database URL**.
2. Na pasta do projeto, rode:
   ```bash
   npm install
   DATABASE_URL="<EXTERNAL_DATABASE_URL>" DB_SSL=true npm run seed
   ```
3. Deve aparecer `✅ Banco de dados populado com sucesso!`.

(Alternativa: usar a aba **Shell** do serviço `turbofood-api` no Render e rodar
`npm run seed`.)

---

## Checklist final (fazer ANTES da apresentação)

- [ ] Abrir `https://turbofood-api.onrender.com/` → responde JSON do sistema.
- [ ] Abrir `https://turbofood-api.onrender.com/api-docs` → Swagger carrega.
- [ ] `GET /produtos` e `GET /relatorios/entregas-concluidas` retornam dados
      (banco populado pelo seed).
- [ ] Abrir o frontend e, na tela de Login, clicar em **"🔌 Demonstração
      integrada ao backend"** → abre `/integrado`.
- [ ] Em `/integrado`, testar **1 CRUD** (aba Cadastros → criar/editar/excluir um
      produto ou cliente) e **1 processo** (aba Entrega → criar entrega) para
      confirmar que o frontend está falando com o backend (sem erro de CORS).
- [ ] **Aquecer o servidor**: no plano Free, o serviço "dorme" após ~15 min de
      inatividade e a 1ª requisição demora ~50s. Faça uma requisição uns 2–3 min
      antes de apresentar para ele acordar.

> Onde apresentar: tudo acontece em **`<url-do-frontend>/integrado`** — abas de
> Cadastros (Produtos, Clientes, Entregadores, Veículos, Categorias), os 4
> processos (Pedidos, Pagamentos, Entrega, Avaliação) e os Relatórios.
> Dica de cadastro com sucesso: CPF com **11 dígitos** e senha com **≥ 6**
> caracteres (senão o backend rejeita — o que também serve para mostrar a
> validação do backend).

## Problemas comuns
- **CORS bloqueado no frontend**: confirme `CORS_ORIGIN` (backend) = URL exata do
  frontend, e `VITE_API_URL` (frontend) = URL exata do backend. Após mudar
  `VITE_API_URL`, o frontend precisa **rebuildar**.
- **Erro de SSL no banco**: o `database.js` já ativa SSL quando há `DATABASE_URL`.
- **Node**: o `package.json` pede Node >= 18 (o Render usa 20 por padrão, ok).
