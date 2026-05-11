# SGPE – TurboFood Backend
**Sistema de Gestão de Pedidos Exclusivos**  
Empresa: JARR Logistics & Innovation | Cliente: TurboFood

---

## Estrutura de Diretórios

```
turbofood-backend/
├── package.json
├── database.sqlite          ← gerado automaticamente (SQLite dev)
└── src/
    ├── server.js            ← ponto de entrada: Express + rotas + Swagger
    ├── config/
    │   └── database.js      ← conexão Sequelize
    ├── middleware/
    │   └── authMiddleware.js  ← JWT + bloqueio 5 tentativas (RN01) + perfis (RN02)
    ├── models/              ← tabelas do banco (Sequelize)
    │   ├── index.js         ← associações (hasMany, belongsTo...)
    │   ├── Categoria.js     ← RF01-04 | máx 30 chars (RNF01) | campo ordem (RF02)
    │   ├── Produto.js       ← RF05-08 | paranoid=true (soft-delete, RNF02)
    │   ├── Cliente.js       ← RF09-12 | hash bcrypt
    │   ├── EnderecoEntrega.js ← RF13-16
    │   ├── Entregador.js    ← RF17-20 | status ativo/inativo/em_entrega
    │   ├── Veiculo.js       ← RF21-24 | unicidade placa e RENAVAN
    │   ├── Pedido.js        ← RF29-32 | fluxo de estados completo
    │   ├── ItemPedido.js    ← itens de cada pedido
    │   ├── Pagamento.js     ← RF33-36
    │   └── Avaliacao.js     ← RF41-44 | notas 1-5
    ├── controllers/         ← recebe req → chama service → retorna res
    │   ├── authController.js       ← RF25-28 | RN01 bloqueio | RN02 perfis
    │   ├── categoriaController.js  ← RF01-04 + RF45
    │   ├── produtoController.js    ← RF05-08 + RF46 | soft-delete
    │   ├── clienteController.js    ← RF09-12 + RF47 | bloqueia remoção c/ pedidos ativos
    │   ├── enderecoEntregaController.js
    │   ├── entregadorController.js ← RF17-20 + RF48
    │   ├── veiculoController.js    ← RF21-24 + RF49
    │   ├── pedidoController.js     ← RF29-32 + RF50
    │   ├── pagamentoController.js  ← RF33-36 + RF52
    │   ├── cozinhaController.js    ← RF37-40
    │   ├── entregaController.js    ← RF41 (parte entrega)
    │   └── avaliacaoController.js  ← RF41-44 + RF51 (NOVO)
    ├── services/            ← regras de negócio com transações Sequelize
    │   ├── PedidoService.js    ← RN01 endereço | RN02 estoque
    │   ├── PagamentoService.js ← RN01 máx 1 aprovado | RN02 janela 15 min
    │   ├── CozinhaService.js   ← RN01 pag. aprovado | RN02 progressão status
    │   └── EntregaService.js   ← RN01 limite 5 pedidos | RN02 jornada 8h
    │                             RN03 entregador ativo | RN04 1 avaliação/pedido
    │                             RN05 desligar <2 estrelas | RN06 bônus >4.5 estrelas
    └── routes/              ← mapeamento URL → controller
        ├── authRoutes.js        ← POST /auth/login | GET /auth/me (NOVO)
        ├── avaliacaoRoutes.js   ← /avaliacoes CRUD (NOVO)
        └── ... (demais rotas inalteradas)
```

---

## Como rodar

```bash
npm install
npm run dev    # modo desenvolvimento (nodemon)
npm start      # modo produção
```

- API: http://localhost:3000  
- Swagger: http://localhost:3000/api-docs

---

## Fluxo de estados do pedido

```
aguardando → (pagamento aprovado) → confirmado
          → (cozinha)             → em_preparo → pronto
          → (entregador atribuído)→ saiu_para_entrega
          → (confirmação)         → entregue
          → (avaliação do cliente)→ Avaliacao criada

Cancelamento permitido somente até: confirmado (RF03)
```

---

## Autenticação (RF25-RF28)

```
POST /auth/login
{ "email": "...", "senha": "...", "perfil": "cliente|entregador|cozinha" }
→ { "token": "eyJ...", "perfil": "cliente" }

Header nas demais rotas: Authorization: Bearer <token>
```

Perfis: `admin` (tudo) | `cliente` (cardápio + pedidos próprios) | `cozinha` | `entregador`

---

## Correções aplicadas (alinhamento com documento SGPE v1.0)

| Arquivo | O que foi corrigido | Requisito |
|---|---|---|
| `Categoria.js` | Nome limitado a 30 caracteres | RNF01 |
| `Categoria.js` | Campo `ordem` para ordenação personalizada | RF02 |
| `Produto.js` | `paranoid: true` (soft-delete preserva histórico) | RNF02 |
| `produtoController.js` | Remove físico só se sem histórico, senão soft-delete | RNF02 |
| `clienteController.js` | Bloqueia remoção se cliente tem pedidos em andamento | RF11 |
| `PagamentoService.js` | Valida janela de 15 minutos para pagamento | RN02 |
| `EntregaService.js` | Limite de 5 pedidos simultâneos por entregador | RN01 |
| `EntregaService.js` | Jornada máxima de 8h nas últimas 24h | RN02 |
| `EntregaService.js` | Desligar entregador com média < 2★ após 50 entregas | Regra Negócio 1 |
| `EntregaService.js` | Registrar bônus de 10% com média > 4.5★ após 100 entregas | Regra Negócio 2 |
| `avaliacaoController.js` | **NOVO**: CRUD completo de avaliações | RF41-RF44, RF51 |
| `avaliacaoRoutes.js` | **NOVA** rota `/avaliacoes` | RF51 |
| `authController.js` | **NOVO**: login com bloqueio após 5 tentativas | RF25-RF28, RN01 |
| `authMiddleware.js` | **NOVO**: JWT + autorização por perfil | RN02 |
| `authRoutes.js` | **NOVA** rota `/auth` | RF25-RF28 |
| `package.json` | `jsonwebtoken` adicionado | — |

---

## Por que essa estrutura em camadas?

**`models/`** — descreve as tabelas e validações. Um model = uma tabela.  
**`controllers/`** — processa a requisição HTTP, delega ao service ou model, retorna resposta.  
**`services/`** — contém as regras de negócio que envolvem múltiplos models e transações atômicas (`sequelize.transaction()`). Se algo falha, tudo é revertido com `rollback`.  
**`routes/`** — mapeia URLs e métodos HTTP para o controller correto.  
**`middleware/`** — código transversal reutilizado em várias rotas (autenticação, autorização).

---

## Banco de dados

**Desenvolvimento**: SQLite (arquivo `database.sqlite`)  
**Produção**: PostgreSQL (RNF02 do documento)

Para produção, edite `src/config/database.js`:
```js
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});
```
