/**
 * PagamentoService
 * Caso de uso: Finalizar Pagamento [RF33]
 *
 * Regras de Negócio:
 *  RN01 – O pagamento só pode ser realizado dentro do tempo limite (JANELA_MINUTOS)
 *          após a criação do pedido.
 *  RN02 – Cada pedido pode possuir apenas um pagamento aprovado: o sistema impede
 *          um segundo pagamento aprovado para o mesmo pedido.
 *
 *  (Efeito colateral) Ao aprovar o pagamento de um pedido "aguardando", o pedido
 *  avança automaticamente para "confirmado" na mesma transação.
 */

const { sequelize, Pagamento, Pedido } = require('../models');

class PagamentoService {
  // ────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────

  static async _verificarRegrasDeNegocio(pedidoId, statusPagamento) {
    const pedido = await Pedido.findByPk(pedidoId, {
      include: [{ association: 'pagamentos' }],
    });
    if (!pedido) throw new Error('Pedido não encontrado.');

    // RN02 – Já existe pagamento aprovado?
    if (statusPagamento === 'aprovado') {
      const jaAprovado = pedido.pagamentos.some((p) => p.status === 'aprovado');
      if (jaAprovado) {
        throw new Error(
          'Este pedido já possui um pagamento aprovado. Não é permitido aprovar mais de um pagamento.'
        );
      }
    }

    return pedido;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CREATE – Finalizar Pagamento (transação atômica)
  // ────────────────────────────────────────────────────────────────────────────

  static async create(req) {
    const { pedidoId, forma, status = 'pendente' } = req.body;

    if (!pedidoId || !forma) {
      throw new Error('Pedido e forma de pagamento são obrigatórios.');
    }

    const pedido = await this._verificarRegrasDeNegocio(pedidoId, status);

    // RN01 – Janela de pagamento: máximo 15 minutos após a criação do pedido
    const JANELA_MINUTOS = 15;
    const agora = new Date();
    const criadoEm = new Date(pedido.createdAt);
    const diffMs = agora - criadoEm;
    const diffMin = diffMs / 1000 / 60;
    if (diffMin > JANELA_MINUTOS) {
      throw new Error(
        `O prazo para pagamento expirou. O pedido foi criado há ${Math.floor(diffMin)} minutos. ` +
        `O limite é de ${JANELA_MINUTOS} minutos.`
      );
    }

    const t = await sequelize.transaction();
    try {
      // Recalcula o valor do pedido diretamente do banco (fonte da verdade)
      const itensPedido = await pedido.getItens();
      const valorRecalculado = itensPedido.reduce((acc, item) => acc + Number(item.subtotal), 0);

      // Cria o registro de pagamento
      const pagamento = await Pagamento.create(
        { pedidoId, forma, status, valor: valorRecalculado },
        { transaction: t }
      );

      // Se aprovado, avança o pedido para "confirmado"
      if (status === 'aprovado' && pedido.status === 'aguardando') {
        await pedido.update({ status: 'confirmado' }, { transaction: t });
      }

      await t.commit();

      return await Pagamento.findByPk(pagamento.id, {
        include: [{ association: 'pedido' }],
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
    return Pagamento.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          association: 'pedido',
          include: [{ association: 'cliente', attributes: { exclude: ['senha'] } }],
        },
      ],
    });
  }

  static async findById(id) {
    const pagamento = await Pagamento.findByPk(id, {
      include: [
        {
          association: 'pedido',
          include: [
            { association: 'cliente', attributes: { exclude: ['senha'] } },
            { association: 'itens', include: [{ association: 'produto' }] },
          ],
        },
      ],
    });
    if (!pagamento) throw new Error('Pagamento não encontrado.');
    return pagamento;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // UPDATE – Alterar status do pagamento (ex: pendente → aprovado)
  // ────────────────────────────────────────────────────────────────────────────

  static async update(id, req) {
    const { status } = req.body;
    const pagamento = await Pagamento.findByPk(id, {
      include: [{ association: 'pedido', include: [{ association: 'pagamentos' }] }],
    });
    if (!pagamento) throw new Error('Pagamento não encontrado.');

    // RN02 – Se tentar aprovar, verificar se já há outro aprovado
    if (status === 'aprovado') {
      const outroAprovado = pagamento.pedido.pagamentos.some(
        (p) => p.id !== pagamento.id && p.status === 'aprovado'
      );
      if (outroAprovado) {
        throw new Error('Já existe um pagamento aprovado para este pedido.');
      }
    }

    const t = await sequelize.transaction();
    try {
      await pagamento.update({ status }, { transaction: t });

      // Se aprovado e pedido ainda aguardando, confirmar pedido
      if (status === 'aprovado' && pagamento.pedido.status === 'aguardando') {
        await pagamento.pedido.update({ status: 'confirmado' }, { transaction: t });
      }

      await t.commit();
      return this.findById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────────────────────────────────

  static async remove(id) {
    const pagamento = await Pagamento.findByPk(id);
    if (!pagamento) throw new Error('Pagamento não encontrado.');
    if (pagamento.status === 'aprovado') {
      throw new Error('Não é possível remover um pagamento já aprovado.');
    }
    await pagamento.destroy();
    return { mensagem: 'Pagamento removido com sucesso.' };
  }
}

module.exports = PagamentoService;
