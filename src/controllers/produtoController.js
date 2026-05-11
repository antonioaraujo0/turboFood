const { Produto, Categoria } = require('../models');

// GET /produtos
const listar = async (req, res) => {
  try {
    const { categoriaId } = req.query;
    const where = categoriaId ? { categoriaId } : {};

    const produtos = await Produto.findAll({
      where,
      order: [['nome', 'ASC']],
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nome'] }],
    });
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar produtos', detalhe: error.message });
  }
};

// GET /produtos/:id
const buscarPorId = async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id, {
      include: [{ model: Categoria, as: 'categoria' }],
    });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produto', detalhe: error.message });
  }
};

// POST /produtos
const criar = async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, urlImagem, disponivel, categoriaId } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'Nome do produto é obrigatório' });
    }

    // Categoria obrigatória (RN)
    if (!categoriaId) {
      return res.status(400).json({ erro: 'Categoria é obrigatória' });
    }

    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    // Preço positivo (RN)
    if (!preco || parseFloat(preco) <= 0) {
      return res.status(400).json({ erro: 'Preço deve ser maior que zero' });
    }

    const produto = await Produto.create({
      nome: nome.trim(), descricao, preco, estoque: estoque || 0, urlImagem, disponivel, categoriaId,
    });

    const produtoComCategoria = await Produto.findByPk(produto.id, {
      include: [{ model: Categoria, as: 'categoria' }],
    });
    res.status(201).json(produtoComCategoria);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao criar produto', detalhe: error.message });
  }
};

// PUT /produtos/:id
const atualizar = async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const { nome, descricao, preco, estoque, urlImagem, disponivel, categoriaId } = req.body;

    if (categoriaId) {
      const categoria = await Categoria.findByPk(categoriaId);
      if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    if (preco !== undefined && parseFloat(preco) <= 0) {
      return res.status(400).json({ erro: 'Preço deve ser maior que zero' });
    }

    await produto.update({ nome, descricao, preco, estoque, urlImagem, disponivel, categoriaId });

    const produtoAtualizado = await Produto.findByPk(produto.id, {
      include: [{ model: Categoria, as: 'categoria' }],
    });
    res.json(produtoAtualizado);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: error.message });
  }
};

// DELETE /produtos/:id
const remover = async (req, res) => {
  try {
    const { ItemPedido } = require('../models');
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    // RNF02 – Se o produto estiver vinculado a pedidos históricos, apenas desativa
    // (soft-delete via paranoid); caso contrário, remove fisicamente.
    const vinculado = await ItemPedido.count({ where: { produtoId: produto.id } });
    if (vinculado > 0) {
      // Soft-delete: marca deletedAt e torna indisponível, preservando histórico de vendas
      await produto.update({ disponivel: false });
      await produto.destroy(); // paranoid=true → apenas seta deletedAt
      return res.json({ mensagem: 'Produto desativado (vinculado a pedidos históricos). Registro preservado.' });
    }

    await produto.destroy({ force: true }); // sem histórico: remove fisicamente
    res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover produto', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
