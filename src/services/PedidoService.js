/**
 * PedidoService
 * Caso de uso: Finalizar Pedido [RF29]
 *
 * Regras de Negócio:
 *  RN01 – Pedido pendente: o cliente não pode criar um novo pedido se já possuir
 *          pedidos com o status "aguardando".
 *  RN02 – Valor mínimo: o sistema só deve permitir a autorização de pedidos cujo
 *          valor mínimo seja de R$ 30,00, sem a contabilização da taxa de entrega.
 */

const { sequelize, Pedido, ItemPedido, Produto, EnderecoEntrega, Cliente, Pagamento } = require('../models');

const PROGRESSAO = {
  confirmado: 'em_preparo',
  em_preparo: 'pronto',
};

class PedidoService {
  // ────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────

  static async _verificarRegrasDeNegocio(clienteId, enderecoEntregaId, itens) {
    // Validação básica de itens
    if (!itens || itens.length === 0) {
      throw new Error('O pedido deve conter pelo menos um item.');
    }

    // RN01 – Cliente não pode ter pedidos com status "aguardando"
    const pedidoPendente = await Pedido.findOne({
      where: { clienteId, status: 'aguardando' },
    });
    if (pedidoPendente) {
      throw new Error(
        'O cliente já possui um pedido aguardando. Não é permitido criar um novo pedido enquanto houver pedidos com status "aguardando".'
      );
    }

    // RN02 – Valor mínimo de R$ 30,00 (sem taxa de entrega)
    let totalItens = 0;
    for (const item of itens) {
      const produto = await Produto.findByPk(item.produtoId);
      if (!produto) {
        throw new Error(`Produto com id ${item.produtoId} não encontrado.`);
      }
      if (!produto.disponivel) {
        throw new Error(`O produto "${produto.nome}" está indisponível.`);
      }
      if (produto.estoque < item.quantidade) {
        throw new Error(
          `Estoque insuficiente para o produto "${produto.nome}". ` +
          `Disponível: ${produto.estoque}, solicitado: ${item.quantidade}.`
        );
      }
      totalItens += parseFloat(produto.preco) * item.quantidade;
    }

    if (totalItens < 30.00) {
      throw new Error(
        `O valor mínimo do pedido é de R$ 30,00 (sem taxa de entrega). ` +
        `Valor atual dos itens: R$ ${totalItens.toFixed(2)}.`
      );
    }

    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CREATE – Finalizar Pedido (transação atômica)
  // ────────────────────────────────────────────────────────────────────────────

  static async create(req) {
    const { clienteId, enderecoEntregaId, formaPagamento, itens, observacao } = req.body;

    // Verifica regras antes de abrir a transação
    await this._verificarRegrasDeNegocio(clienteId, enderecoEntregaId, itens);

    const t = await sequelize.transaction();
    try {
      // Cria o pedido principal
      const pedido = await Pedido.create(
        { clienteId, enderecoEntregaId, formaPagamento, observacao, total: 0, status: 'aguardando' },
        { transaction: t }
      );

      // Cria os itens e acumula total; decrementa estoque de cada produto
      let total = 0;
      for (const item of itens) {
        const produto = await Produto.findByPk(item.produtoId, { transaction: t });
        const subtotal = parseFloat(produto.preco) * item.quantidade;
        total += subtotal;

        await ItemPedido.create(
          {
            pedidoId: pedido.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: produto.preco,
            subtotal,
          },
          { transaction: t }
        );

        // Decrementa estoque atomicamente
        await produto.update(
          { estoque: produto.estoque - item.quantidade },
          { transaction: t }
        );
      }

      // RN02 – cálculo automático do valor final com taxa de entrega
      const taxaEntrega = total >= 100 ? 0 : 8;
      total += taxaEntrega;

      await pedido.update({ total }, { transaction: t });

      await t.commit();

      // Retorna pedido completo
      return await Pedido.findByPk(pedido.id, {
        include: [
          { association: 'cliente', attributes: { exclude: ['senha'] } },
          { association: 'enderecoEntrega' },
          {
            association: 'itens',
            include: [{ association: 'produto', include: [{ association: 'categoria' }] }],
          },
        ],
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // READ
  // ────────────────────────────────────────────────────────────────────────────

  static async findAll() {
    return Pedido.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { association: 'cliente', attributes: { exclude: ['senha'] } },
        { association: 'enderecoEntrega' },
        { association: 'itens', include: [{ association: 'produto' }] },
        { association: 'pagamentos' },
      ],
    });
  }

  static async findById(id) {
    const pedido = await Pedido.findByPk(id, {
      include: [
        { association: 'cliente', attributes: { exclude: ['senha'] } },
        { association: 'enderecoEntrega' },
        {
          association: 'itens',
          include: [{ association: 'produto', include: [{ association: 'categoria' }] }],
        },
        { association: 'pagamentos' },
        { association: 'avaliacao' },
        { association: 'entregador', attributes: { exclude: ['senha'] } },
      ],
    });
    if (!pedido) throw new Error('Pedido não encontrado.');
    return pedido;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // UPDATE – Alterar dados básicos (observação, endereço) enquanto "aguardando"
  // ────────────────────────────────────────────────────────────────────────────

  static async update(id, req) {
    const pedido = await Pedido.findByPk(id);
    if (!pedido) throw new Error('Pedido não encontrado.');
    if (pedido.status !== 'aguardando') {
      throw new Error('Somente pedidos com status "aguardando" podem ser alterados.');
    }
    const { observacao, enderecoEntregaId } = req.body;
    await pedido.update({ observacao, enderecoEntregaId });
    return this.findById(id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE – Cancelar pedido (somente até "confirmado")
  // ────────────────────────────────────────────────────────────────────────────

  static async remove(id) {
    const t = await sequelize.transaction();
    try {
      const pedido = await Pedido.findByPk(id, {
        include: [{ association: 'itens' }],
        transaction: t,
      });
      if (!pedido) throw new Error('Pedido não encontrado.');

      const statusPermitidos = ['aguardando', 'confirmado'];
      if (!statusPermitidos.includes(pedido.status)) {
        throw new Error(
          `Não é possível cancelar um pedido com status "${pedido.status}". ` +
          'O cancelamento só é permitido até o status "confirmado".'
        );
      }

      // Devolve estoque dos produtos
      for (const item of pedido.itens) {
        const produto = await Produto.findByPk(item.produtoId, { transaction: t });
        await produto.update(
          { estoque: produto.estoque + item.quantidade },
          { transaction: t }
        );
      }

      await pedido.update({ status: 'cancelado' }, { transaction: t });
      await t.commit();
      return { mensagem: 'Pedido cancelado com sucesso.' };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // COZINHA INTEGRADA AO PEDIDO – avanço de status
  // ────────────────────────────────────────────────────────────────────────────

  static async avancarStatus(id) {
    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      throw new Error('Pedido não encontrado.');
    }

    if (!PROGRESSAO[pedido.status]) {
      throw new Error(`O pedido está com status "${pedido.status}" e não pode ser avançado.`);
    }

    if (pedido.status === 'confirmado') {
      // RN02 – Verifica valor mínimo de R$ 30,00 (sem taxa de entrega) antes de autorizar
      const itensPedido = await ItemPedido.findAll({ where: { pedidoId: pedido.id } });
      const totalItens = itensPedido.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

      if (totalItens < 30.00) {
        throw new Error(
          `Não é possível autorizar um pedido com valor inferior a R$ 30,00 (sem taxa de entrega). ` +
          `Valor atual: R$ ${totalItens.toFixed(2)}.`
        );
      }

      const pagamentoAprovado = await Pagamento.findOne({
        where: {
          pedidoId: pedido.id,
          status: 'aprovado',
        },
      });

      if (!pagamentoAprovado) {
        throw new Error('Não é possível iniciar o preparo sem pagamento aprovado.');
      }
    }

    const novoStatus = PROGRESSAO[pedido.status];

    const t = await sequelize.transaction();

    try {
      await pedido.update({ status: novoStatus }, { transaction: t });

      await t.commit();

      return await this.findById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

}

module.exports = PedidoService;
