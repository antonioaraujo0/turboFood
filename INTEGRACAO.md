# TurboFood — Integração Frontend + Backend + Deploy no Render

Este documento explica como o frontend (React/Vite) e o backend (Node/Express/
Sequelize) se conectam, onde ficam as **regras de negócio** e como publicar tudo
no Render.

## Estrutura do repositório

```
/                → backend (Node/Express/Sequelize)   [raiz]
  src/
    config/database.js   → conexão (Postgres/DATABASE_URL ou SQLite)
    models/              → models Sequelize + associações (models/index.js)
    services/EntregaService.js  → RN01 e RN02 (transação)
    controllers/ routes/ → API REST
  render.yaml            → blueprint do Render (API + Web + Postgres)
/frontend           → SPA React/Vite
  src/services/api.js    → cliente HTTP (usa VITE_API_URL)
  src/context/AppContext.jsx  → estado do app
```

## Regras de negócio da Entrega (onde vivem agora)

As regras foram **movidas para o backend** e são validadas dentro de uma
transação Sequelize em `src/services/EntregaService.js`:

- **RN01 — Máx. 5 pedidos por entrega.** `criar()` recusa `pedidosIds` com mais
  de 5 itens; `validarLimitePedidos()` também bloqueia ao adicionar pedido a uma
  entrega existente.
- **RN02 — Máx. 8h de trabalho em 24h.** `validarJornadaTrabalho()` soma o tempo
  (`dataSaida → dataConclusao`) das entregas `ENTREGUE` nas últimas 24h e bloqueia
  a criação de nova entrega se já houver ≥ 480 minutos.

O frontend continua com uma checagem preventiva (em `utils/entregaRules.js`)
apenas para UX — **a regra que vale é a do backend**.

### Endpoints de Entrega

| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | `/entrega` | Lista entregas (`?status=`, `?entregadorId=`) |
| POST | `/entrega` | Cria entrega `{ entregadorId, pedidosIds:[] }` — aplica RN01+RN02 |
| GET  | `/entrega/:id` | Detalhe |
| POST | `/entrega/:id/pedidos` | Adiciona pedido `{ pedidoId }` (RN01) |
| POST | `/entrega/:id/iniciar` | → `EM_ROTA` |
| POST | `/entrega/:id/finalizar` | → `ENTREGUE` (libera entregador) |
| POST | `/entrega/:id/falhar` | → `FALHOU` `{ motivoFalha }` |
| GET  | `/entrega/entregador/:id/jornada` | Horas trabalhadas/disponíveis (RN02) |

## Rodando localmente

### Backend
```bash
# na raiz
cp .env.example .env
# para dev rápido sem Postgres, no .env: DB_DIALECT=sqlite
npm install
npm start          # http://localhost:3000  (Swagger em /api-docs)
npm run seed       # (opcional) popula dados de exemplo
```

### Frontend
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm install
npm run dev               # http://localhost:5173
```

## Testando as regras (curl)

```bash
# RN01 — mais de 5 pedidos deve falhar
curl -X POST http://localhost:3000/entrega \
  -H "Content-Type: application/json" \
  -d '{"entregadorId":1,"pedidosIds":[1,2,3,4,5,6]}'
# → 400 { "erro": "...O limite é de 5 pedidos por entrega." }

# RN02 — consultar jornada do entregador
curl http://localhost:3000/entrega/entregador/1/jornada
```

## Deploy no Render

O `render.yaml` na raiz cria 3 recursos automaticamente (Blueprint):

1. **turbofood-db** — Postgres gerenciado.
2. **turbofood-api** — Web Service Node (raiz). Recebe `DATABASE_URL` do banco
   (com SSL) e `CORS_ORIGIN`. Start: `npm start`.
3. **turbofood-web** — Static Site (pasta `frontend`). Build `npm run build`,
   publica `dist/`, com `VITE_API_URL` apontando para a API.

Passos:
1. `New > Blueprint` no Render e selecione este repositório.
2. Após o primeiro deploy, copie a URL do `turbofood-api` e defina
   `VITE_API_URL` no `turbofood-web`; copie a URL do `turbofood-web` e defina
   `CORS_ORIGIN` no `turbofood-api`. Redeploy.

> O `sequelize.sync()` cria as tabelas no primeiro boot. Rode a seed uma vez se
> quiser dados de exemplo.

## Próximo passo da integração (telas do frontend)

O cliente de API (`frontend/src/services/api.js`) já está pronto. Falta trocar,
nas telas, as chamadas locais (`dispatch`) por chamadas ao backend. Exemplo para
criar uma entrega respeitando as regras:

```jsx
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const toast = useToast()

async function criarEntrega(entregadorId, pedidosIds) {
  try {
    const entrega = await api.entregas.criar(entregadorId, pedidosIds)
    toast('Entrega criada!', 'success')
    // atualize o estado local com a entrega retornada
  } catch (e) {
    // Aqui chegam as mensagens de RN01/RN02 vindas do backend
    toast(e.message, 'danger')
  }
}
```

Como as tabelas de cadastro (clientes, entregadores, produtos...) têm formatos um
pouco diferentes entre o mock e o backend, a migração das telas deve ser feita
tela a tela, mapeando os campos. A tela de **Entregas** é a prioritária por
carregar as regras RN01/RN02.
