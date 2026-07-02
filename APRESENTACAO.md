# Roteiro de Apresentação — TurboFood (passo a passo)

Tudo é feito com o site rodando, em **`<url-do-frontend>/integrado`**
(na tela de Login, botão **"🔌 Demonstração integrada ao backend"**).

Abas no topo: **Cadastros · Pedidos (João) · Pagamentos (Renan) · Entrega (Rui) ·
Avaliação (Antônio) · Relatórios**.

| Pessoa | Cadastro (CRUD) | Processo (RN01 + RN02) | Relatórios (2) |
|--------|-----------------|------------------------|----------------|
| **João**   | Produtos      | **Pedidos**    | Pedidos + Produtos |
| **Renan**  | Clientes      | **Pagamentos** | Pagamentos + Clientes |
| **Rui**    | Entregadores  | **Entrega**    | Entregas concluídas + Horas trabalhadas |
| **Antônio**| Avaliações    | **Avaliação**  | Avaliações por bairro + Desempenho de entregadores |

### Antes de começar (quem publicou)
- Rodar o seed (`npm run seed`) e **aquecer** o backend 2–3 min antes (plano Free
  dorme; 1ª chamada ~50s).
- Cadastro de Cliente/Entregador **com sucesso**: CPF de **11 dígitos** e senha **≥ 6**.
- Se algo falhar: repetir a operação no **Swagger** (`/api-docs`).

---

# 1) JOÃO — Produtos + Pedidos

## 1.1 Cadastro (aba **Cadastros › Produtos**)
1. Deixe **Nome** vazio e clique **"Inserir"** → aparece o aviso do **frontend**
   ("Nome é obrigatório").
2. Clique **"Testar validação do backend"** → mostra o **400** vindo da API
   ("Nome do produto é obrigatório"). *(front e back validando)*
3. Preencha Nome (ex.: "Coca 2L"), Categoria (Bebidas), Preço (12) → **"Inserir"**
   → aparece na lista.
4. Na linha do produto, **"Editar"** → mude o Preço (ex.: 13,5) → **"Salvar
   alteração"**.
5. **"Excluir"** em algum produto de teste → some da lista. *(CRUD completo)*

## 1.2 Processo Pedidos — testar as 2 RNs (aba **Pedidos (João)**)
> RN01: cliente não pode ter novo pedido se já tiver um `aguardando`.
> RN02: valor mínimo R$ 30 (só itens).
1. **Inserção com sucesso:** escolha um **Cliente**, o **Endereço** dele, marque
   produtos até o **Subtotal ≥ R$ 30** (fica verde) → **"Criar pedido (sucesso)"**
   → mensagem verde com o nº do pedido.
2. **Testar RN01:** com o **mesmo cliente**, clique **"Criar pedido (sucesso)"** de
   novo → banner vermelho: *"já possui um pedido aguardando"*.
3. **Testar RN02:** clique **"Demonstrar RN02 (itens < R$30)"** → banner vermelho:
   *"valor mínimo do pedido é de R$ 30,00"*.
4. Mostre a tabela de pedidos embaixo (o pedido criado aparece como `aguardando`).

## 1.3 Relatórios (aba **Relatórios › "João — Pedidos/Produtos"**)
1. **Relatório de Pedidos** — mostra todos os pedidos (cliente, status, itens,
   total) e o resumo (total, entregues, receita). Clique **"Atualizar"**.
2. **Relatório de Produtos** — lista produtos ativos e inativos, com preço,
   estoque e vendas.

## 1.4 Explicar no CÓDIGO um componente React
Abra `frontend/src/pages/integrado/Demo.jsx` → função **`PedidosDemo`** e explique:
- **Hooks:** vários `useState` (clientes, produtos, pedidos, seleção, `qtds`) e o
  `useEffect(() => { carregar() }, [])` que **busca os dados da API ao montar**.
- **Estado derivado:** `itens` e `subtotal` são **calculados no render** a partir
  de `qtds`/`produtos` (não são estado guardado).
- **Chamada à API + regra de negócio:** a função `criar()` chama
  `api.pedidos.criar(...)`; o `try/catch` captura o erro do backend (RN01/RN02) e
  mostra no componente `Banner`.
- **Lista controlada:** o `.map` dos produtos com `<input value/onChange>`
  (componente controlado do React).

---

# 2) RENAN — Clientes + Pagamentos

## 2.1 Cadastro (aba **Cadastros › Clientes**)
1. Deixe um campo vazio → **"Inserir"** → aviso do **frontend**.
2. **"Testar validação do backend"** → **400** da API.
3. Preencha Nome, E-mail, Telefone, **CPF com 11 dígitos** (ex.: 12345678901),
   **Senha ≥ 6** (ex.: 123456) → **"Inserir"** → aparece na lista.
4. **"Editar"** o cliente (mude o telefone) → **"Salvar alteração"**.
5. **"Excluir"** o cliente de teste. *(CRUD completo)*

## 2.2 Processo Pagamentos — testar as 2 RNs (aba **Pagamentos (Renan)**)
> RN01: pagamento só dentro de 15 min após a criação do pedido.
> RN02: só um pagamento aprovado por pedido.
1. **Testar RN02:** selecione um **pedido que já tem pagamento aprovado** (ex.:
   #1), Status **Aprovado** → **"Criar pagamento"** → banner vermelho: *"já possui
   um pagamento aprovado"*.
2. **Testar RN01:** selecione um **pedido antigo do seed** (ex.: #5) → **"Criar
   pagamento"** → *"prazo para pagamento expirou"* (passou dos 15 min).
3. **Inserção com sucesso:** vá à aba **Pedidos**, crie um **pedido novo**; volte
   aqui, selecione esse pedido, Status **Aprovado** → **"Criar pagamento"** →
   sucesso (o pedido passa a `confirmado`).

## 2.3 Relatórios (aba **Relatórios › "Renan — Pagamentos/Clientes"**)
1. **Relatório de Pagamentos** — valor, forma, status, cliente e pedido; resumo
   com aprovados e receita.
2. **Relatório de Clientes** — clientes com total de pedidos e valor gasto.

## 2.4 Explicar no CÓDIGO um componente React
Abra `frontend/src/pages/integrado/Demo.jsx` e explique o componente reutilizável
**`Banner`** + o **`PagamentosDemo`**:
- **Componente com props + renderização condicional:** `function Banner({ msg })`
  recebe a **prop** `msg`, faz `if (!msg) return null` e muda a cor conforme
  `msg.tipo` (ok/erro). É **reaproveitado** por todos os processos.
- **Estado do formulário:** `useState` para `selPedido`, `forma`, `status`.
- **Chamada à API:** a função `criar()` chama `api.pagamentos.criar(...)`; o
  `catch` envia a mensagem da RN (ex.: "já possui pagamento aprovado") para o
  `Banner`.

---

# 3) RUI — Entregadores + Entrega

## 3.1 Cadastro (aba **Cadastros › Entregadores**)
1. Deixe um campo vazio → **"Inserir"** → aviso do **frontend**;
   **"Testar validação do backend"** → **400** da API.
2. Preencha Nome, E-mail, Telefone, **CPF 11 díg.**, CNH, Tipo de veículo (Moto),
   **Senha ≥ 6** → **"Inserir"** → aparece na lista (coluna **Avaliações** mostra
   `totalAvaliacoes`).
3. **"Editar"** (mude o telefone) → **"Salvar alteração"**. **"Excluir"** o de
   teste. *(CRUD completo)*

## 3.2 Processo Entrega — testar as 2 RNs (aba **Entrega (Rui)**)
> RN01: máximo 5 pedidos por entrega. RN02: máximo 8h em 24h.
1. Selecione um **Entregador** (status **ativo**). Aparece o painel **Jornada
   (RN02)** com horas trabalhadas/disponíveis.
2. **Testar RN01:** clique **"Demonstrar bloqueio RN01 (6 pedidos)"** → banner
   vermelho: *"O limite é de 5 pedidos por entrega"*.
3. **Comentar RN02:** aponte o painel Jornada (o backend bloqueia quem passa de
   8h nas últimas 24h).
4. **Inserção com sucesso:** marque **1 a 5** pedidos → **"Criar entrega
   (inserção com sucesso)"** → entrega criada (`AGUARDANDO`).
5. Na tabela de entregas, **"Iniciar"** (→ `EM_ROTA`) e depois **"Finalizar"**
   (→ `ENTREGUE`, libera o entregador).

## 3.3 Relatórios (aba **Relatórios › "Rui — Entrega"**)
1. **Entregas concluídas** — total de entregas por entregador.
2. **Horas trabalhadas** — horas de cada entregador e quem atingiu as 8h (RN02).

## 3.4 Explicar no CÓDIGO um componente React
Abra `frontend/src/pages/integrado/Demo.jsx` → função **`EntregaDemo`** e explique:
- **Seleção múltipla com imutabilidade:** o estado `selPedidos` (array) e a função
  `togglePedido()` que retorna um **novo array** (`s.includes(id) ? s.filter(...) :
  [...s, id]`) — o React exige atualizar o estado de forma imutável.
- **Efeito colateral sob demanda:** `escolherEntregador()` chama
  `api.entregas.jornada(id)` e guarda em `jornada` (painel da RN02).
- **Renderização condicional:** `{jornada && ( ...painel... )}` só aparece quando
  há dados.
- **Regra no backend:** `demonstrarRN01()` monta 6 ids e chama a API para provar
  o bloqueio (a validação real está no backend).

---

# 4) ANTÔNIO — Avaliações + Avaliação

## 4.1 Cadastro Avaliações (aba **Avaliação (Antônio)**)
> O cadastro e o processo são a mesma tela (criar + listar avaliações).
1. **Inserção com sucesso:** selecione o **Pedido #6** (entrega concluída há 8
   dias no seed), escolha as notas (comida/entrega) e um comentário →
   **"Enviar avaliação"** → registrada; aparece na lista embaixo.

## 4.2 Processo Avaliação — testar as 2 RNs (mesma aba)
> RN01: ≥ 50 avaliações com média < 2 → entregador desligado (`inativo`).
> RN02: só avalia **após 7 dias** da confirmação da entrega.
1. **Testar RN02:** selecione um pedido **recém-entregue** (ex.: criado/finalizado
   na aba Entrega agora, ou #1/#2) → **"Enviar avaliação"** → banner vermelho:
   *"só é permitida após 7 dias da confirmação"* (ou "entrega não concluída").
2. **Comentar RN01:** explique o corte automático (≥ 50 avaliações e média < 2 →
   `inativo`) e aponte o campo **Avaliações** (`totalAvaliacoes`) na aba
   Cadastros › Entregadores.

## 4.3 Relatórios (aba **Relatórios › "Antônio — Avaliação"**)
1. **Avaliações por bairro** — total e média de comida/entrega por bairro.
2. **Desempenho de entregadores** — por entregador: entregas, avaliações, médias e
   quantidade de avaliações negativas.

## 4.4 Explicar no CÓDIGO um componente React
Abra `frontend/src/pages/integrado/Demo.jsx` e explique o componente **genérico
`Relatorio`** + o **`AvaliacaoDemo`**:
- **Componente genérico e reutilizável (props + composição):** `Relatorio` recebe
  as **props** `titulo`, `carregar`, `colunas`, `getLista`, `getResumo`, busca os
  dados no `useEffect` e monta a tabela com `colunas.map(...)`. O objeto
  `RELATORIOS` **configura** os relatórios de cada pessoa — um só componente serve
  a todos (ótimo exemplo de reaproveitamento no React).
- **Em `AvaliacaoDemo`:** a função `criar()` pega o `clienteId` do pedido
  selecionado e chama `api.avaliacoes.criar(...)`; o `Banner` mostra o resultado
  (sucesso ou a RN02 de 7 dias).

---

## Pontuação (para mirar a nota cheia)
- **Cadastro** pelo frontend = **1,5** · **Processo** com as 2 RNs explicadas =
  **2,0** · **Relatórios** pelo frontend = **1,0** · **Atenção** às outras
  apresentações = **0,5**.
- Tudo acima acontece no `/integrado` chamando a API real.

## Ordem sugerida (para caber em ~15 min)
João → Renan → Rui → Antônio. Cada um: **cadastro (2 min) + processo/RNs (2 min)
+ relatórios (1 min)** ≈ 5 min? Se apertar, priorizem **processo + relatórios** e
mostrem o cadastro rapidamente.
