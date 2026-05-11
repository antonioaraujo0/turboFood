const { EnderecoEntrega, Cliente } = require('../models');

const listar = async (req, res) => {
  try {
    const enderecos = await EnderecoEntrega.findAll({
      include: [{ association: 'cliente', attributes: { exclude: ['senha'] } }],
    });
    res.json(enderecos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar endereços', detalhe: error.message });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const endereco = await EnderecoEntrega.findByPk(req.params.id, {
      include: [{ association: 'cliente', attributes: { exclude: ['senha'] } }],
    });
    if (!endereco) return res.status(404).json({ erro: 'Endereço não encontrado' });
    res.json(endereco);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar endereço', detalhe: error.message });
  }
};

const criar = async (req, res) => {
  try {
    const { clienteId, rua, numero, complemento, bairro, cidade } = req.body;
    if (!clienteId || !rua || !numero || !bairro || !cidade) {
      return res.status(400).json({ erro: 'clienteId, rua, numero, bairro e cidade são obrigatórios' });
    }
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
    const endereco = await EnderecoEntrega.create({ clienteId, rua, numero, complemento, bairro, cidade });
    res.status(201).json(endereco);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map((e) => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao criar endereço', detalhe: error.message });
  }
};

const atualizar = async (req, res) => {
  try {
    const endereco = await EnderecoEntrega.findByPk(req.params.id);
    if (!endereco) return res.status(404).json({ erro: 'Endereço não encontrado' });
    await endereco.update(req.body);
    res.json(endereco);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar endereço', detalhe: error.message });
  }
};

const remover = async (req, res) => {
  try {
    const endereco = await EnderecoEntrega.findByPk(req.params.id, {
      include: [{ association: 'pedidos' }],
    });
    if (!endereco) return res.status(404).json({ erro: 'Endereço não encontrado' });
    if (endereco.pedidos && endereco.pedidos.length > 0) {
      return res.status(409).json({ erro: 'Endereço vinculado a pedidos. Remoção bloqueada.' });
    }
    await endereco.destroy();
    res.json({ mensagem: 'Endereço removido com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover endereço', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
