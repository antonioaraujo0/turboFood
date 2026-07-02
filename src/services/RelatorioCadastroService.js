/**
 * RelatorioCadastroService.js
 *
 * Relatórios de Listagens — RF45 a RF52
 *
 * RF45 – Listar Categorias           (ordem personalizada → alfabética)
 * RF46 – Listar Produtos             (alfabético por categoria)
 * RF47 – Listar Clientes             (alfabético)
 * RF48 – Listar Entregadores         (alfabético) — status, média e total de avaliações
 * RF49 – Listar Veículos             (alfabético por modelo)
 * RF50 – Listar Pedidos              (data decrescente)
 * RF51 – Listar Avaliações           (data decrescente)
 * RF52 – Listar Pagamentos           (data decrescente)
 *
 * Reescrito com o ORM do Sequelize e agregação em JS — portável entre Postgres
 * (Render) e SQLite (dev). Não usa SQL cru (que quebrava no Postgres por causa
 * de identificadores camelCase sem aspas).
 */

const { Op, fn, col } = require("sequelize");
const {
  Categoria,
  Produto,
  Cliente,
  Entregador,
  Veiculo,
  Pedido,
  ItemPedido,
  Entrega,
  Pagamento,
  Avaliacao,
} = require("../models");

const num = (v) => Number(v || 0);
const media = (soma, qtd) => (qtd ? Number((soma / qtd).toFixed(2)) : null);

// ─────────────────────────────────────────────────────────────────────────────
// RF45 – Listar Categorias
// ─────────────────────────────────────────────────────────────────────────────
async function listarCategorias({ ativo } = {}) {
  const where = {};
  if (ativo !== undefined) where.ativo = ativo === "true" || ativo === true;

  const registros = await Categoria.findAll({
    where,
    include: [{ association: "produtos", attributes: ["id", "disponivel"] }],
  });

  const categorias = registros
    .map((c) => {
      const j = c.toJSON();
      const produtos = j.produtos || [];
      return {
        id: j.id,
        nome: j.nome,
        descricao: j.descricao,
        icone: j.icone,
        ativo: j.ativo,
        ordem: j.ordem,
        totalProdutos: produtos.length,
        produtosDisponiveis: produtos.filter((p) => p.disponivel).length,
        criadoEm: j.createdAt,
      };
    })
    .sort((a, b) => {
      if (a.ordem == null && b.ordem != null) return 1;
      if (a.ordem != null && b.ordem == null) return -1;
      if (a.ordem != null && b.ordem != null && a.ordem !== b.ordem)
        return a.ordem - b.ordem;
      return (a.nome || "").localeCompare(b.nome || "");
    });

  return {
    filtros: { ativo: ativo !== undefined ? ativo : "todos" },
    total: categorias.length,
    categorias,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF46 – Listar Produtos (ativos e inativos)
// ─────────────────────────────────────────────────────────────────────────────
async function listarProdutos({ categoriaId, disponivel } = {}) {
  const where = {};
  if (categoriaId) where.categoriaId = Number(categoriaId);
  if (disponivel !== undefined) {
    where.disponivel = disponivel === "true" || disponivel === true;
  }

  const registros = await Produto.findAll({
    where,
    include: [{ association: "categoria", attributes: ["id", "nome"] }],
  });

  // Vendas por produto (COUNT de itens e SUM de quantidade)
  const vendas = await ItemPedido.findAll({
    attributes: [
      "produtoId",
      [fn("COUNT", col("id")), "totalVendas"],
      [fn("SUM", col("quantidade")), "quantidadeVendida"],
    ],
    group: ["produtoId"],
    raw: true,
  });
  const vendasPorProduto = {};
  for (const v of vendas) {
    vendasPorProduto[v.produtoId] = {
      totalVendas: num(v.totalVendas),
      quantidadeVendida: num(v.quantidadeVendida),
    };
  }

  const produtos = registros
    .map((p) => {
      const j = p.toJSON();
      const venda = vendasPorProduto[j.id] || {
        totalVendas: 0,
        quantidadeVendida: 0,
      };
      return {
        id: j.id,
        nome: j.nome,
        descricao: j.descricao,
        preco: j.preco,
        estoque: j.estoque,
        disponivel: j.disponivel,
        urlImagem: j.urlImagem,
        categoriaId: j.categoria ? j.categoria.id : j.categoriaId,
        categoria: j.categoria ? j.categoria.nome : null,
        totalVendas: venda.totalVendas,
        quantidadeVendida: venda.quantidadeVendida,
        criadoEm: j.createdAt,
      };
    })
    .sort(
      (a, b) =>
        (a.categoria || "").localeCompare(b.categoria || "") ||
        (a.nome || "").localeCompare(b.nome || "")
    );

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
    porCategoria[prod.categoria].estoqueTotal += num(prod.estoque);
  }

  return {
    filtros: {
      categoriaId: categoriaId ? Number(categoriaId) : null,
      disponivel: disponivel !== undefined ? disponivel : "todos",
    },
    total: produtos.length,
    resumoPorCategoria: Object.values(porCategoria),
    produtos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF47 – Listar Clientes
// ─────────────────────────────────────────────────────────────────────────────
async function listarClientes({ ativo, busca } = {}) {
  const where = {};
  if (ativo !== undefined) where.ativo = ativo === "true" || ativo === true;
  if (busca) {
    where[Op.or] = [
      { nomeCompleto: { [Op.like]: `%${busca}%` } },
      { email: { [Op.like]: `%${busca}%` } },
    ];
  }

  const registros = await Cliente.findAll({
    where,
    attributes: { exclude: ["senha"] },
    include: [
      { association: "pedidos", attributes: ["id", "status", "total", "createdAt"] },
    ],
    order: [["nomeCompleto", "ASC"]],
  });

  const clientes = registros.map((c) => {
    const j = c.toJSON();
    const pedidos = j.pedidos || [];
    const totalGasto = pedidos
      .filter((p) => p.status !== "cancelado")
      .reduce((s, p) => s + num(p.total), 0);
    const ultimo = pedidos.reduce(
      (max, p) => (!max || new Date(p.createdAt) > new Date(max) ? p.createdAt : max),
      null
    );
    return {
      id: j.id,
      nomeCompleto: j.nomeCompleto,
      email: j.email,
      telefone: j.telefone,
      cpf: j.cpf,
      ativo: j.ativo,
      totalPedidos: pedidos.length,
      totalGasto: totalGasto.toFixed(2),
      ultimoPedidoEm: ultimo,
      clienteDesde: j.createdAt,
    };
  });

  const totalAtivos = clientes.filter((c) => c.ativo).length;
  const receitaTotal = clientes.reduce((s, c) => s + num(c.totalGasto), 0);

  return {
    filtros: { ativo: ativo !== undefined ? ativo : "todos", busca: busca || null },
    totalClientes: clientes.length,
    totalAtivos,
    totalInativos: clientes.length - totalAtivos,
    receitaTotal: receitaTotal.toFixed(2),
    clientes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF48 – Listar Entregadores (relatório de entregador)
// Mostra status (ativos/inativos), média de notas e total de avaliações.
// ─────────────────────────────────────────────────────────────────────────────
async function listarEntregadores({ status, busca } = {}) {
  const where = {};
  if (status) where.status = status;
  if (busca) where.nomeCompleto = { [Op.like]: `%${busca}%` };

  const registros = await Entregador.findAll({
    where,
    attributes: { exclude: ["senha"] },
    include: [
      { association: "veiculo", attributes: ["id", "modelo", "placa"] },
    ],
    order: [["nomeCompleto", "ASC"]],
  });

  // Métricas por entregador: entregas ENTREGUE e avaliações (via entrega→pedidos→avaliacao)
  const entregas = await Entrega.findAll({
    where: { status: "ENTREGUE" },
    attributes: ["id", "entregadorId"],
    include: [
      {
        association: "pedidos",
        attributes: ["id"],
        include: [
          { association: "avaliacao", attributes: ["notaComida", "notaEntrega"] },
        ],
      },
    ],
  });

  const metricas = {};
  const garantir = (id) => {
    if (!metricas[id])
      metricas[id] = {
        totalEntregas: 0,
        somaEntrega: 0,
        somaComida: 0,
        qtdAvaliacoes: 0,
        negativas: 0,
      };
    return metricas[id];
  };

  for (const e of entregas) {
    const j = e.toJSON();
    const m = garantir(j.entregadorId);
    m.totalEntregas += 1;
    for (const p of j.pedidos || []) {
      if (p.avaliacao) {
        m.qtdAvaliacoes += 1;
        m.somaEntrega += num(p.avaliacao.notaEntrega);
        m.somaComida += num(p.avaliacao.notaComida);
        if (num(p.avaliacao.notaEntrega) < 2) m.negativas += 1;
      }
    }
  }

  const entregadores = registros.map((e) => {
    const j = e.toJSON();
    const m = metricas[j.id] || {
      totalEntregas: 0,
      somaEntrega: 0,
      somaComida: 0,
      qtdAvaliacoes: 0,
      negativas: 0,
    };
    return {
      id: j.id,
      nomeCompleto: j.nomeCompleto,
      email: j.email,
      telefone: j.telefone,
      tipoVeiculo: j.tipoVeiculo,
      status: j.status,
      totalEntregas: m.totalEntregas,
      totalAvaliacoes: m.qtdAvaliacoes,
      mediaAvaliacaoEntrega: media(m.somaEntrega, m.qtdAvaliacoes),
      mediaAvaliacaoComida: media(m.somaComida, m.qtdAvaliacoes),
      avaliacoesNegativas: m.negativas,
      veiculoModelo: j.veiculo ? j.veiculo.modelo : null,
      veiculoPlaca: j.veiculo ? j.veiculo.placa : null,
      cadastradoEm: j.createdAt,
    };
  });

  const totalAtivos = entregadores.filter((e) => e.status === "ativo").length;
  const totalEmEntrega = entregadores.filter((e) => e.status === "em_entrega").length;
  const totalInativos = entregadores.filter((e) => e.status === "inativo").length;

  return {
    filtros: { status: status || "todos", busca: busca || null },
    totalEntregadores: entregadores.length,
    totalAtivos,
    totalEmEntrega,
    totalInativos,
    totalEntregasGeral: entregadores.reduce((s, e) => s + e.totalEntregas, 0),
    entregadores,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF49 – Listar Veículos
// ─────────────────────────────────────────────────────────────────────────────
async function listarVeiculos({ status, tipo } = {}) {
  const where = {};
  if (status) where.status = status;
  if (tipo) where.tipo = tipo;

  const registros = await Veiculo.findAll({
    where,
    include: [
      { association: "entregador", attributes: ["id", "nomeCompleto", "status"] },
    ],
    order: [["modelo", "ASC"]],
  });

  const veiculos = registros.map((v) => {
    const j = v.toJSON();
    return {
      id: j.id,
      tipo: j.tipo,
      modelo: j.modelo,
      placa: j.placa,
      cor: j.cor,
      ano: j.ano,
      status: j.status,
      renavan: j.renavan,
      entregadorId: j.entregador ? j.entregador.id : j.entregadorId,
      entregadorNome: j.entregador ? j.entregador.nomeCompleto : null,
      entregadorStatus: j.entregador ? j.entregador.status : null,
      cadastradoEm: j.createdAt,
    };
  });

  const totalDisponiveis = veiculos.filter((v) => v.status === "disponivel").length;
  const totalEmUso = veiculos.filter((v) => v.status === "em_uso").length;
  const totalManutencao = veiculos.filter((v) => v.status === "manutencao").length;

  return {
    filtros: { status: status || "todos", tipo: tipo || "todos" },
    totalVeiculos: veiculos.length,
    totalDisponiveis,
    totalEmUso,
    totalManutencao,
    totalIndisponiveis:
      veiculos.length - totalDisponiveis - totalEmUso - totalManutencao,
    veiculos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RF50 – Listar Pedidos
// ─────────────────────────────────────────────────────────────────────────────
async function listarPedidos({ clienteId, status, dataInicio, dataFim, busca } = {}) {
  const where = {};
  if (clienteId) where.clienteId = Number(clienteId);
  if (status) where.status = status;
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt[Op.gte] = `${dataInicio} 00:00:00`;
    if (dataFim) where.createdAt[Op.lte] = `${dataFim} 23:59:59`;
  }

  const registros = await Pedido.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [
      { association: "cliente", attributes: ["id", "nomeCompleto", "telefone"] },
      { association: "enderecoEntrega" },
      { association: "itens", attributes: ["id", "quantidade"] },
      { association: "pagamentos", attributes: ["status", "forma"] },
    ],
  });

  let pedidos = registros.map((r) => {
    const j = r.toJSON();
    const itens = j.itens || [];
    const aprovado = (j.pagamentos || []).find((pg) => pg.status === "aprovado");
    const ee = j.enderecoEntrega || {};
    return {
      id: j.id,
      status: j.status,
      total: j.total,
      formaPagamento: j.formaPagamento,
      observacao: j.observacao,
      clienteId: j.cliente ? j.cliente.id : j.clienteId,
      clienteNome: j.cliente ? j.cliente.nomeCompleto : null,
      clienteTelefone: j.cliente ? j.cliente.telefone : null,
      enderecoRua: ee.rua || null,
      enderecoNumero: ee.numero || null,
      enderecoBairro: ee.bairro || null,
      enderecoCidade: ee.cidade || null,
      totalItens: itens.length,
      quantidadeItens: itens.reduce((s, i) => s + num(i.quantidade), 0),
      pagamentoStatus: aprovado ? aprovado.status : null,
      pagamentoForma: aprovado ? aprovado.forma : null,
      criadoEm: j.createdAt,
      atualizadoEm: j.updatedAt,
    };
  });

  if (busca) {
    const termo = String(busca).toLowerCase();
    pedidos = pedidos.filter(
      (p) =>
        String(p.id).includes(termo) ||
        (p.clienteNome || "").toLowerCase().includes(termo)
    );
  }

  const emAndamento = pedidos.filter(
    (p) => !["entregue", "cancelado"].includes(p.status)
  ).length;
  const entregues = pedidos.filter((p) => p.status === "entregue").length;
  const cancelados = pedidos.filter((p) => p.status === "cancelado").length;
  const receita = pedidos
    .filter((p) => p.status !== "cancelado")
    .reduce((s, p) => s + num(p.total), 0);

  return {
    filtros: {
      clienteId: clienteId ? Number(clienteId) : null,
      status: status || "todos",
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
// ─────────────────────────────────────────────────────────────────────────────
async function listarAvaliacoes({ dataInicio, dataFim, notaMin, notaMax, busca } = {}) {
  const where = {};
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt[Op.gte] = `${dataInicio} 00:00:00`;
    if (dataFim) where.createdAt[Op.lte] = `${dataFim} 23:59:59`;
  }

  const registros = await Avaliacao.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [
      { association: "cliente", attributes: ["id", "nomeCompleto"] },
      { association: "pedido", attributes: ["id"] },
    ],
  });

  let avaliacoes = registros.map((a) => {
    const j = a.toJSON();
    const notaMedia = Number(((num(j.notaComida) + num(j.notaEntrega)) / 2).toFixed(1));
    return {
      id: j.id,
      notaComida: j.notaComida,
      notaEntrega: j.notaEntrega,
      notaMedia,
      comentario: j.comentario,
      pedidoId: j.pedido ? j.pedido.id : j.pedidoId,
      clienteId: j.cliente ? j.cliente.id : j.clienteId,
      clienteNome: j.cliente ? j.cliente.nomeCompleto : null,
      avaliadoEm: j.createdAt,
    };
  });

  if (notaMin !== undefined)
    avaliacoes = avaliacoes.filter((a) => a.notaMedia >= Number(notaMin));
  if (notaMax !== undefined)
    avaliacoes = avaliacoes.filter((a) => a.notaMedia <= Number(notaMax));
  if (busca) {
    const termo = String(busca).toLowerCase();
    avaliacoes = avaliacoes.filter(
      (a) =>
        (a.clienteNome || "").toLowerCase().includes(termo) ||
        String(a.pedidoId).includes(termo) ||
        (a.comentario || "").toLowerCase().includes(termo)
    );
  }

  const total5estrelas = avaliacoes.filter((a) => a.notaMedia >= 4.5).length;
  const total4estrelas = avaliacoes.filter(
    (a) => a.notaMedia >= 3.5 && a.notaMedia < 4.5
  ).length;
  const abaixo3 = avaliacoes.filter((a) => a.notaMedia < 3.5).length;
  const mediaGeral = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + a.notaMedia, 0) / avaliacoes.length).toFixed(1)
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
// ─────────────────────────────────────────────────────────────────────────────
async function listarPagamentos({ status, forma, dataInicio, dataFim, clienteId } = {}) {
  const where = {};
  if (status) where.status = status;
  if (forma) where.forma = forma;
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt[Op.gte] = `${dataInicio} 00:00:00`;
    if (dataFim) where.createdAt[Op.lte] = `${dataFim} 23:59:59`;
  }

  const registros = await Pagamento.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [
      {
        association: "pedido",
        attributes: ["id", "status", "clienteId"],
        include: [
          { association: "cliente", attributes: ["id", "nomeCompleto", "email"] },
        ],
      },
    ],
  });

  let pagamentos = registros.map((pg) => {
    const j = pg.toJSON();
    const pedido = j.pedido || {};
    const cliente = pedido.cliente || {};
    return {
      id: j.id,
      valor: j.valor,
      forma: j.forma,
      status: j.status,
      pedidoId: j.pedidoId,
      pedidoStatus: pedido.status || null,
      clienteId: cliente.id || null,
      clienteNome: cliente.nomeCompleto || null,
      clienteEmail: cliente.email || null,
      criadoEm: j.createdAt,
      atualizadoEm: j.updatedAt,
    };
  });

  // Filtro por cliente (aplicado em memória via pedido→cliente)
  if (clienteId) {
    pagamentos = pagamentos.filter((p) => p.clienteId === Number(clienteId));
  }

  const aprovados = pagamentos.filter((p) => p.status === "aprovado");
  const totalPendentes = pagamentos.filter((p) => p.status === "pendente").length;
  const totalRecusados = pagamentos.filter((p) => p.status === "recusado").length;
  const receitaTotal = aprovados.reduce((s, p) => s + num(p.valor), 0);

  const porForma = {};
  for (const pg of aprovados) {
    if (!porForma[pg.forma]) {
      porForma[pg.forma] = { forma: pg.forma, quantidade: 0, total: 0 };
    }
    porForma[pg.forma].quantidade += 1;
    porForma[pg.forma].total += num(pg.valor);
  }

  return {
    filtros: {
      status: status || "todos",
      forma: forma || "todos",
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      clienteId: clienteId ? Number(clienteId) : null,
    },
    totalPagamentos: pagamentos.length,
    totalAprovados: aprovados.length,
    totalPendentes,
    totalRecusados,
    receitaTotal: receitaTotal.toFixed(2),
    porForma: Object.values(porForma),
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
