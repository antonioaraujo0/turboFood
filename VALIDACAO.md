# Validação dos processos — TurboFood (backend)

Alvo de deploy: **Render + Postgres**. Reescritas feitas com o ORM do Sequelize
para funcionar tanto no Postgres (produção) quanto no SQLite (dev).

## Pedido
- **RN01** (cliente sem pedido `aguardando`) ✅ e **RN02** (mínimo R$ 30,00 só de
  itens, sem taxa) ✅ — em `PedidoService`, com transação.

## Cadastro de Produtos
- CRUD completo ✅, **nome e categoria obrigatórios** ✅, inativar via
  `disponivel` ✅, exclusão com soft-delete (`paranoid`) ✅.

## Pagamento — VALIDADO (já estava correto)
Em `PagamentoService` (ORM, sem SQL cru → ok no Postgres):
- **RN01** ✅ — o pagamento só é aceito **dentro do tempo limite** após a criação
  do pedido (`JANELA_MINUTOS = 15`; ajuste o valor se o limite for outro).
- **RN02** ✅ — cada pedido só pode ter **um pagamento aprovado** (bloqueado na
  criação e na atualização). Ao aprovar, o pedido `aguardando` vira `confirmado`.
- Apenas alinhei os comentários RN01/RN02 à sua numeração (a lógica já estava
  certa).

## Cadastro de Clientes
- CRUD completo ✅ (`clienteController`): criar, alterar, remover e visualizar,
  com unicidade de e-mail/CPF e bloqueio de remoção quando há pedidos em
  andamento. Tudo em ORM.

## Entrega (RNs já validadas antes)
- **RN01** (máx. 5 pedidos) e **RN02** (máx. 8h/24h) ✅ em `EntregaService`.
- **CRUD de Veículos e Entregadores** ✅ (passaram a funcionar após a criação das
  associações centrais em `models/index.js`).
- **Inclusão de entrega** ✅.

## Avaliação — VALIDADO E CORRIGIDO
Suas regras foram aplicadas em `AvaliacaoService` (reescrito com ORM; a versão
anterior usava `julianday()` do SQLite, colunas camelCase sem aspas, fazia
`UPDATE ... SET ativo=0` numa coluna inexistente e juntava `Entrega.pedidoId`,
que não existe mais no modelo 1→N):

- **RN01 (real)** ✅ — desligamento automático (status → `inativo`) quando o
  entregador acumula **≥ 50 avaliações** e a **média de notaEntrega < 2**.
- **RN02 (real)** ✅ — cliente só pode avaliar **após 7 dias** da confirmação da
  entrega (`dataConclusao`). *(Corrigido: antes o código aceitava apenas DENTRO
  de 7 dias — a lógica estava invertida.)*
- **Cadastro de Avaliações** ✅ — criar/listar; nota (comida e entrega)
  obrigatórias; vínculo com **entrega confirmada** (só avalia pedido cuja entrega
  está `ENTREGUE`); data via `createdAt`.

### Cadastro de Entregadores (ajuste de schema)
- Adicionado o campo **`totalAvaliacoes`** (contador) ao model `Entregador`,
  incrementado a cada avaliação — atende ao requisito de o entregador possuir
  obrigatoriamente **nome, status e contagem de avaliações**.

## Relatórios — TODOS reescritos para Postgres
Estavam em **SQL cru** e quebravam no Postgres (identificadores camelCase sem
aspas; `julianday()` no de horas; e no de avaliação havia colunas/joins do schema
antigo: `et.nome`, `et.ativo`, `e.pedidoId`, `p.enderecoId`, tabela `Enderecos`).
Agora usam ORM:

- **RF45 Categorias, RF46 Produtos, RF47 Clientes, RF48 Entregadores,
  RF49 Veículos, RF50 Pedidos, RF51 Avaliações, RF52 Pagamentos** ✅
  (`RelatorioCadastroService`).
- **REL01 Entregas concluídas** e **REL02 Horas trabalhadas** ✅
  (`RelatorioEntregaService`).
- **Avaliações por bairro** e **Desempenho de entregadores** ✅
  (`RelatorioAvaliacaoService`).

### Relatório de Entregador (o que você pediu)
`GET /relatorios/entregadores` retorna todos os entregadores com **status**
(ativo/inativo/em_entrega), **média de notas** (`mediaAvaliacaoEntrega` e
`mediaAvaliacaoComida`), **total de avaliações** (`totalAvaliacoes`) e total de
entregas.

## Teste rápido (após deploy)
```bash
curl https://SUA-API/relatorios/entregadores
curl https://SUA-API/relatorios/produtos
curl https://SUA-API/relatorios/pedidos
curl https://SUA-API/relatorios/entregas-concluidas
curl https://SUA-API/relatorios/horas-trabalhadas
curl "https://SUA-API/relatorios/avaliacoes/entregadores/2026-01-01/2026-12-31"
```

> Observação: as reescritas foram verificadas por análise estática (sintaxe +
> associações). Não foi possível subir o servidor com banco neste ambiente para
> um teste de execução ao vivo.
