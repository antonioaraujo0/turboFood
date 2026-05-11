const { Categoria, Produto } = require('../models');

// GET /categorias
const listar = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['ordem', 'ASC'], ['nome', 'ASC']], // RF02: personalizada + alfabética
      include: [{ model: Produto, as: 'produtos', attributes: ['id'] }],
    });
    const result = categorias.map(c => ({
      ...c.toJSON(),
      totalProdutos: c.produtos.length,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar categorias', detalhe: error.message });
  }
};

// GET /categorias/:id
const buscarPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: [{ model: Produto, as: 'produtos' }],
    });
    if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar categoria', detalhe: error.message });
  }
};

// POST /categorias
const criar = async (req, res) => {
  try {
    const { nome, descricao, icone } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'Nome da categoria é obrigatório' });
    }

    // Unicidade do nome (RN)
    const existente = await Categoria.findOne({ where: { nome: nome.trim() } });
    if (existente) {
      return res.status(409).json({ erro: 'Já existe uma categoria com este nome' });
    }

    const categoria = await Categoria.create({ nome: nome.trim(), descricao, icone });
    res.status(201).json(categoria);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao criar categoria', detalhe: error.message });
  }
};

// PUT /categorias/:id
const atualizar = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada' });

    const { nome, descricao, icone, ativo } = req.body;

    // Unicidade do nome (RN) - exceto a própria categoria
    if (nome && nome.trim() !== categoria.nome) {
      const existente = await Categoria.findOne({ where: { nome: nome.trim() } });
      if (existente) {
        return res.status(409).json({ erro: 'Já existe uma categoria com este nome' });
      }
    }

    await categoria.update({ nome: nome ? nome.trim() : categoria.nome, descricao, icone, ativo });
    res.json(categoria);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao atualizar categoria', detalhe: error.message });
  }
};

// DELETE /categorias/:id
const remover = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: [{ model: Produto, as: 'produtos' }],
    });
    if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada' });

    // Bloqueio de remoção com produtos vinculados (RN)
    if (categoria.produtos && categoria.produtos.length > 0) {
      return res.status(409).json({
        erro: 'Não é possível remover uma categoria que possui produtos vinculados',
      });
    }

    await categoria.destroy();
    res.json({ mensagem: 'Categoria removida com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover categoria', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
