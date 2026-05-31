/**
 * RelatorioCadastroService.js
 *
 * Relatórios de Listagens — RF45 a RF52
 *
 * RF45 – Listar Categorias           (ordem personalizada → alfabética)
 * RF46 – Listar Produtos             (alfabético por categoria)
 * RF47 – Listar Clientes             (alfabético)
 * RF48 – Listar Entregadores         (alfabético)
 * RF49 – Listar Veículos             (alfabético por modelo)
 * RF50 – Listar Pedidos              (data decrescente)
 * RF51 – Listar Avaliações           (data decrescente)
 * RF52 – Listar Pagamentos           (data decrescente)
 *
 * Padrão Código B:
 *  - sequelize importado de '../models' (não de '../config/database')
 *  - QueryTypes importado de 'sequelize' (pacote)
 *  - Nomes de tabelas em snake_case conforme definido nos models do Código B
 *  - Funções exportadas como módulo (não como classe estática), igual ao
 *    RelatorioEntregaService.js do Código B
 */

const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// RF45 – Listar Categorias
//
// Campos: nome, descrição, ícone, ativo, ordem.
// Agrega: total de produtos e total de produtos disponíveis por categoria.
// Ordenado por campo `ordem` (nulo por último) e depois alfabeticamente.
// ─────────────────────────────────────────────────────────────────────────────
async function listarCategorias({ ativo } = {}) {
  const condicoes = [];
  const replacements = {};

  if (ativo !== undefined) {
    condicoes.push('c.ativo = :ativo');
    replacements.ativo = ativo === 'true' || ativo === true ? 1 : 0;
  }

  const clausulaWhere = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const categorias = await sequelize.query(
    `SELECT
       c.id                                                          AS id,
       c.nome                                                        AS nome,
       c.descricao                                                   AS descricao,
       c.icone                                                       AS icone,
       c.ativo                                                       AS ativo,
       c.ordem                                                       AS ordem,
       COUNT(p.id)                                                   AS totalProdutos,
       SUM(CASE WHEN p.disponivel = 1 AND p.deletedAt IS NULL
                THEN 1 ELSE 0 END)                                  AS produtosDisponiveis,
       c.createdAt                                                   AS criadoEm
     FROM categorias c
     LEFT JOIN produtos p ON p.categoriaId = c.id AND p.deletedAt IS NULL
     ${clausulaWhere}
     GROUP BY c.id, c.nome, c.descricao, c.icone, c.ativo, c.ordem, c.createdAt
     ORDER BY
       CASE WHEN c.ordem IS NULL THEN 1 ELSE 0 END,
       c.ordem ASC,
       c.nome  ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  return {
    filtros: { ativo: ativo !== undefined ? ativo : 'todos' },
    total: categorias.length,
    categorias,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF46 – Listar Produtos
//
// Campos: nome, descrição, preço, estoque, disponibilidade, categoria.
// Agrega: total de vendas e quantidade vendida por produto.
// Filtros: categoriaId, disponivel.
// Ordenado alfabeticamente dentro de cada categoria.
// ─────────────────────────────────────────────────────────────────────────────
async function listarProdutos({ categoriaId, disponivel } = {}) {
  const condicoes = ['p.deletedAt IS NULL'];
  const replacements = {};

  if (categoriaId) {
    condicoes.push('p.categoriaId = :categoriaId');
    replacements.categoriaId = Number(categoriaId);
  }

  if (disponivel !== undefined) {
    condicoes.push('p.disponivel = :disponivel');
    replacements.disponivel = disponivel === 'true' || disponivel === true ? 1 : 0;
  }

  const clausulaWhere = `WHERE ${condicoes.join(' AND ')}`;

  const produtos = await sequelize.query(
    `SELECT
       p.id                                AS id,
       p.nome                              AS nome,
       p.descricao                         AS descricao,
       p.preco                             AS preco,
       p.estoque                           AS estoque,
       p.disponivel                        AS disponivel,
       p.urlImagem                         AS urlImagem,
       c.id                                AS categoriaId,
       c.nome                              AS categoria,
       COUNT(ip.id)                        AS totalVendas,
       SUM(COALESCE(ip.quantidade, 0))     AS quantidadeVendida,
       p.createdAt                         AS criadoEm
     FROM produtos p
     INNER JOIN categorias c   ON c.id  = p.categoriaId
     LEFT JOIN  itens_pedido ip ON ip.produtoId = p.id
     ${clausulaWhere}
     GROUP BY p.id, p.nome, p.descricao, p.preco, p.estoque, p.disponivel,
              p.urlImagem, c.id, c.nome, p.createdAt
     ORDER BY c.nome ASC, p.nome ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  // Totalizadores por categoria para o resumo executivo
  const porCategoria = {};
  for (const prod of produtos) {
    if (!porCategoria[prod.categoria]) {
      porCategoria[prod.categoria] = {
        categoria: prod.categoria,
        totalProdutos: 0,
        estoqueTotal: 0,
      };
    }
    porCategoria[prod.categoria].totalProdutos += 1;
    porCategoria[prod.categoria].estoqueTotal += Number(prod.estoque);
  }

  return {
    filtros: {
      categoriaId: categoriaId ? Number(categoriaId) : null,
      disponivel: disponivel !== undefined ? disponivel : 'todos',
    },
    total: produtos.length,
    resumoPorCategoria: Object.values(porCategoria),
    produtos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF47 – Listar Clientes
//
// Campos: nomeCompleto, email, telefone, cpf, ativo.
// Agrega: total de pedidos e valor total gasto por cliente.
// Filtros: ativo, busca (nome ou e-mail).
// Ordenado alfabeticamente.
// ─────────────────────────────────────────────────────────────────────────────
async function listarClientes({ ativo, busca } = {}) {
  const condicoes = [];
  const replacements = {};

  if (ativo !== undefined) {
    condicoes.push('c.ativo = :ativo');
    replacements.ativo = ativo === 'true' || ativo === true ? 1 : 0;
  }

  if (busca) {
    condicoes.push('(c.nomeCompleto LIKE :busca OR c.email LIKE :busca)');
    replacements.busca = `%${busca}%`;
  }

  const clausulaWhere = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const clientes = await sequelize.query(
    `SELECT
       c.id                                                          AS id,
       c.nomeCompleto                                                AS nomeCompleto,
       c.email                                                       AS email,
       c.telefone                                                    AS telefone,
       c.cpf                                                         AS cpf,
       c.ativo                                                       AS ativo,
       COUNT(p.id)                                                   AS totalPedidos,
       SUM(CASE WHEN p.status NOT IN ('cancelado')
                THEN p.total ELSE 0 END)                            AS totalGasto,
       MAX(p.createdAt)                                              AS ultimoPedidoEm,
       c.createdAt                                                   AS clienteDesde
     FROM clientes c
     LEFT JOIN pedidos p ON p.clienteId = c.id
     ${clausulaWhere}
     GROUP BY c.id, c.nomeCompleto, c.email, c.telefone, c.cpf, c.ativo, c.createdAt
     ORDER BY c.nomeCompleto ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const totalAtivos = clientes.filter((c) => c.ativo).length;
  const receitaTotal = clientes.reduce((s, c) => s + Number(c.totalGasto || 0), 0);

  return {
    filtros: {
      ativo: ativo !== undefined ? ativo : 'todos',
      busca: busca || null,
    },
    totalClientes: clientes.length,
    totalAtivos,
    totalInativos: clientes.length - totalAtivos,
    receitaTotal: receitaTotal.toFixed(2),
    clientes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF48 – Listar Entregadores
//
// Campos: nomeCompleto, email, telefone, tipoVeiculo, status.
// Agrega: total de entregas, médias de avaliação e avaliações negativas.
// Filtros: status, busca (nome).
// Ordenado alfabeticamente.
// ─────────────────────────────────────────────────────────────────────────────
async function listarEntregadores({ status, busca } = {}) {
  const condicoes = [];
  const replacements = {};

  if (status) {
    condicoes.push('e.status = :status');
    replacements.status = status;
  }

  if (busca) {
    condicoes.push('e.nomeCompleto LIKE :busca');
    replacements.busca = `%${busca}%`;
  }

  const clausulaWhere = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const entregadores = await sequelize.query(
    `SELECT
       e.id                                                          AS id,
       e.nomeCompleto                                                AS nomeCompleto,
       e.email                                                       AS email,
       e.telefone                                                    AS telefone,
       e.tipoVeiculo                                                 AS tipoVeiculo,
       e.status                                                      AS status,
       COUNT(DISTINCT ent.id)                                        AS totalEntregas,
       ROUND(AVG(av.notaEntrega), 2)                                 AS mediaAvaliacaoEntrega,
       ROUND(AVG(av.notaComida),  2)                                 AS mediaAvaliacaoComida,
       SUM(CASE WHEN av.notaEntrega < 2 THEN 1 ELSE 0 END)          AS avaliacoesNegativas,
       v.modelo                                                      AS veiculoModelo,
       v.placa                                                       AS veiculoPlaca,
       e.createdAt                                                   AS cadastradoEm
     FROM entregadores e
     LEFT JOIN entregas    ent ON ent.entregadorId = e.id AND ent.status = 'ENTREGUE'
     LEFT JOIN pedidos     p   ON p.id             = ent.pedidoId
     LEFT JOIN avaliacoes  av  ON av.pedidoId      = p.id
     LEFT JOIN veiculos    v   ON v.entregadorId   = e.id
     ${clausulaWhere}
     GROUP BY e.id, e.nomeCompleto, e.email, e.telefone, e.tipoVeiculo,
              e.status, v.modelo, v.placa, e.createdAt
     ORDER BY e.nomeCompleto ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const totalDisponiveis = entregadores.filter((e) => e.status === 'ativo').length;
  const totalEmEntrega   = entregadores.filter((e) => e.status === 'em_entrega').length;

  return {
    filtros: {
      status: status || 'todos',
      busca: busca || null,
    },
    totalEntregadores: entregadores.length,
    totalDisponiveis,
    totalEmEntrega,
    totalInativos: entregadores.length - totalDisponiveis - totalEmEntrega,
    totalEntregasGeral: entregadores.reduce((s, e) => s + Number(e.totalEntregas || 0), 0),
    entregadores,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF49 – Listar Veículos
//
// Campos: tipo, modelo, placa, cor, ano, status, renavan.
// Inclui: entregador atribuído.
// Filtros: status, tipo.
// Ordenado alfabeticamente por modelo.
// ─────────────────────────────────────────────────────────────────────────────
async function listarVeiculos({ status, tipo } = {}) {
  const condicoes = [];
  const replacements = {};

  if (status) {
    condicoes.push('v.status = :status');
    replacements.status = status;
  }

  if (tipo) {
    condicoes.push('v.tipo = :tipo');
    replacements.tipo = tipo;
  }

  const clausulaWhere = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const veiculos = await sequelize.query(
    `SELECT
       v.id                        AS id,
       v.tipo                      AS tipo,
       v.modelo                    AS modelo,
       v.placa                     AS placa,
       v.cor                       AS cor,
       v.ano                       AS ano,
       v.status                    AS status,
       v.renavan                   AS renavan,
       e.id                        AS entregadorId,
       e.nomeCompleto              AS entregadorNome,
       e.status                    AS entregadorStatus,
       v.createdAt                 AS cadastradoEm
     FROM veiculos v
     LEFT JOIN entregadores e ON e.id = v.entregadorId
     ${clausulaWhere}
     ORDER BY v.modelo ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const totalDisponiveis = veiculos.filter((v) => v.status === 'disponivel').length;
  const totalEmUso       = veiculos.filter((v) => v.status === 'em_uso').length;
  const totalManutencao  = veiculos.filter((v) => v.status === 'manutencao').length;

  return {
    filtros: {
      status: status || 'todos',
      tipo: tipo || 'todos',
    },
    totalVeiculos: veiculos.length,
    totalDisponiveis,
    totalEmUso,
    totalManutencao,
    totalIndisponiveis: veiculos.length - totalDisponiveis - totalEmUso - totalManutencao,
    veiculos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF50 – Listar Pedidos
//
// Campos: id, status, total, formaPagamento, cliente, endereço, itens, pagamento.
// Filtros: clienteId, status, dataInicio, dataFim, busca (id ou nome do cliente).
// Ordenado por data decrescente.
//
// Tabela de endereço no Código B: enderecos_entrega (FK: enderecoEntregaId)
// ─────────────────────────────────────────────────────────────────────────────
async function listarPedidos({ clienteId, status, dataInicio, dataFim, busca } = {}) {
  const condicoes = [];
  const replacements = {};

  if (clienteId) {
    condicoes.push('p.clienteId = :clienteId');
    replacements.clienteId = Number(clienteId);
  }

  if (status) {
    condicoes.push('p.status = :status');
    replacements.status = status;
  }

  if (dataInicio) {
    condicoes.push('p.createdAt >= :dataInicio');
    replacements.dataInicio = `${dataInicio} 00:00:00`;
  }

  if (dataFim) {
    condicoes.push('p.createdAt <= :dataFim');
    replacements.dataFim = `${dataFim} 23:59:59`;
  }

  if (busca) {
    condicoes.push('(CAST(p.id AS TEXT) LIKE :busca OR c.nomeCompleto LIKE :busca)');
    replacements.busca = `%${busca}%`;
  }

  const clausulaWhere = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const pedidos = await sequelize.query(
    `SELECT
       p.id                        AS id,
       p.status                    AS status,
       p.total                     AS total,
       p.formaPagamento            AS formaPagamento,
       p.observacao                AS observacao,
       c.id                        AS clienteId,
       c.nomeCompleto              AS clienteNome,
       c.telefone                  AS clienteTelefone,
       ee.rua                      AS enderecoRua,
       ee.numero                   AS enderecoNumero,
       ee.bairro                   AS enderecoBairro,
       ee.cidade                   AS enderecoCidade,
       COUNT(ip.id)                AS totalItens,
       SUM(ip.quantidade)          AS quantidadeItens,
       pg.status                   AS pagamentoStatus,
       pg.forma                    AS pagamentoForma,
       p.createdAt                 AS criadoEm,
       p.updatedAt                 AS atualizadoEm
     FROM pedidos p
     INNER JOIN clientes           c  ON c.id  = p.clienteId
     INNER JOIN enderecos_entrega  ee ON ee.id = p.enderecoEntregaId
     LEFT JOIN  itens_pedido       ip ON ip.pedidoId = p.id
     LEFT JOIN  pagamentos         pg ON pg.pedidoId = p.id AND pg.status = 'aprovado'
     ${clausulaWhere}
     GROUP BY p.id, p.status, p.total, p.formaPagamento, p.observacao,
              c.id, c.nomeCompleto, c.telefone,
              ee.rua, ee.numero, ee.bairro, ee.cidade,
              pg.status, pg.forma, p.createdAt, p.updatedAt
     ORDER BY p.createdAt DESC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const emAndamento = pedidos.filter(
    (p) => !['entregue', 'cancelado'].includes(p.status)
  ).length;
  const entregues  = pedidos.filter((p) => p.status === 'entregue').length;
  const cancelados = pedidos.filter((p) => p.status === 'cancelado').length;
  const receita    = pedidos
    .filter((p) => p.status !== 'cancelado')
    .reduce((s, p) => s + Number(p.total || 0), 0);

  return {
    filtros: {
      clienteId: clienteId ? Number(clienteId) : null,
      status: status || 'todos',
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      busca: busca || null,
    },
    totalPedidos: pedidos.length,
    emAndamento,
    entregues,
    cancelados,
    receitaTotal: receita.toFixed(2),
    pedidos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF51 – Listar Avaliações
//
// Campos: notaComida, notaEntrega, notaMedia, comentário, pedido, cliente, data.
// Filtros: dataInicio, dataFim, notaMin, notaMax, busca.
// Ordenado por data decrescente.
// ─────────────────────────────────────────────────────────────────────────────
async function listarAvaliacoes({ dataInicio, dataFim, notaMin, notaMax, busca } = {}) {
  const condicoes = [];
  const replacements = {};

  if (dataInicio) {
    condicoes.push('av.createdAt >= :dataInicio');
    replacements.dataInicio = `${dataInicio} 00:00:00`;
  }

  if (dataFim) {
    condicoes.push('av.createdAt <= :dataFim');
    replacements.dataFim = `${dataFim} 23:59:59`;
  }

  if (notaMin !== undefined) {
    condicoes.push('((av.notaComida + av.notaEntrega) / 2.0) >= :notaMin');
    replacements.notaMin = Number(notaMin);
  }

  if (notaMax !== undefined) {
    condicoes.push('((av.notaComida + av.notaEntrega) / 2.0) <= :notaMax');
    replacements.notaMax = Number(notaMax);
  }

  if (busca) {
    condicoes.push(
      '(c.nomeCompleto LIKE :busca OR CAST(p.id AS TEXT) LIKE :busca OR av.comentario LIKE :busca)'
    );
    replacements.busca = `%${busca}%`;
  }

  const clausulaWhere = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const avaliacoes = await sequelize.query(
    `SELECT
       av.id                                                         AS id,
       av.notaComida                                                 AS notaComida,
       av.notaEntrega                                                AS notaEntrega,
       ROUND((av.notaComida + av.notaEntrega) / 2.0, 1)             AS notaMedia,
       av.comentario                                                 AS comentario,
       p.id                                                          AS pedidoId,
       c.id                                                          AS clienteId,
       c.nomeCompleto                                                AS clienteNome,
       av.createdAt                                                  AS avaliadoEm
     FROM avaliacoes av
     INNER JOIN pedidos  p ON p.id = av.pedidoId
     INNER JOIN clientes c ON c.id = av.clienteId
     ${clausulaWhere}
     ORDER BY av.createdAt DESC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const total5estrelas = avaliacoes.filter((a) => a.notaMedia >= 4.5).length;
  const total4estrelas = avaliacoes.filter((a) => a.notaMedia >= 3.5 && a.notaMedia < 4.5).length;
  const abaixo3        = avaliacoes.filter((a) => a.notaMedia < 3.5).length;
  const mediaGeral     = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + Number(a.notaMedia), 0) / avaliacoes.length).toFixed(1)
    : null;

  return {
    filtros: {
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      notaMin: notaMin !== undefined ? Number(notaMin) : null,
      notaMax: notaMax !== undefined ? Number(notaMax) : null,
      busca: busca || null,
    },
    totalAvaliacoes: avaliacoes.length,
    mediaGeral,
    total5estrelas,
    total4estrelas,
    abaixo3estrelas: abaixo3,
    avaliacoes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF52 – Listar Pagamentos
//
// Campos: valor, forma, status, pedido, cliente, data.
// Filtros: status, forma, dataInicio, dataFim, clienteId.
// Agrega: receita total aprovada e totais por forma de pagamento.
// Ordenado por data decrescente.
// ─────────────────────────────────────────────────────────────────────────────
async function listarPagamentos({ status, forma, dataInicio, dataFim, clienteId } = {}) {
  const condicoes = [];
  const replacements = {};

  if (status) {
    condicoes.push('pg.status = :status');
    replacements.status = status;
  }

  if (forma) {
    condicoes.push('pg.forma = :forma');
    replacements.forma = forma;
  }

  if (dataInicio) {
    condicoes.push('pg.createdAt >= :dataInicio');
    replacements.dataInicio = `${dataInicio} 00:00:00`;
  }

  if (dataFim) {
    condicoes.push('pg.createdAt <= :dataFim');
    replacements.dataFim = `${dataFim} 23:59:59`;
  }

  if (clienteId) {
    condicoes.push('p.clienteId = :clienteId');
    replacements.clienteId = Number(clienteId);
  }

  const clausulaWhere = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const pagamentos = await sequelize.query(
    `SELECT
       pg.id                       AS id,
       pg.valor                    AS valor,
       pg.forma                    AS forma,
       pg.status                   AS status,
       pg.pedidoId                 AS pedidoId,
       p.status                    AS pedidoStatus,
       c.id                        AS clienteId,
       c.nomeCompleto              AS clienteNome,
       c.email                     AS clienteEmail,
       pg.createdAt                AS criadoEm,
       pg.updatedAt                AS atualizadoEm
     FROM pagamentos pg
     INNER JOIN pedidos  p ON p.id = pg.pedidoId
     INNER JOIN clientes c ON c.id = p.clienteId
     ${clausulaWhere}
     ORDER BY pg.createdAt DESC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const aprovados    = pagamentos.filter((p) => p.status === 'aprovado');
  const totalPendentes = pagamentos.filter((p) => p.status === 'pendente').length;
  const totalRecusados = pagamentos.filter((p) => p.status === 'recusado').length;
  const receitaTotal   = aprovados.reduce((s, p) => s + Number(p.valor || 0), 0);

  // Totais por forma (somente aprovados)
  const porForma = {};
  for (const pg of aprovados) {
    if (!porForma[pg.forma]) {
      porForma[pg.forma] = { forma: pg.forma, quantidade: 0, total: 0 };
    }
    porForma[pg.forma].quantidade += 1;
    porForma[pg.forma].total      += Number(pg.valor);
  }

  return {
    filtros: {
      status: status || 'todos',
      forma: forma || 'todos',
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      clienteId: clienteId ? Number(clienteId) : null,
    },
    totalPagamentos: pagamentos.length,
    totalAprovados: aprovados.length,
    totalPendentes,
    totalRecusados,
    receitaTotal: receitaTotal.toFixed(2),
    totalPorForma: Object.values(porForma).map((f) => ({ ...f, total: f.total.toFixed(2) })),
    pagamentos,
  };
}

module.exports = {
  listarCategorias,
  listarProdutos,
  listarClientes,
  listarEntregadores,
  listarVeiculos,
  listarPedidos,
  listarAvaliacoes,
  listarPagamentos,
};
