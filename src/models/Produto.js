const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome do produto é obrigatório' },
    },
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Preço deve ser um número decimal' },
      min: { args: [0.01], msg: 'Preço deve ser maior que zero' },
    },
  },
  estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: { msg: 'Estoque deve ser um número inteiro' },
      min: { args: [0], msg: 'Estoque não pode ser negativo' },
    },
  },
  urlImagem: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  disponivel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // RNF02 – Soft-delete: ao excluir produto vinculado a pedidos antigos,
  // o registro não é apagado fisicamente; apenas marcado com deletedAt.
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'Categoria é obrigatória' },
    },
  },
}, {
  tableName: 'produtos',
  timestamps: true,
  // paranoid: soft-delete — registro não é apagado fisicamente se vinculado a pedidos (RNF02)
  paranoid: true,
});

module.exports = Produto;
