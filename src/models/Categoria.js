const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Nome da categoria é obrigatório' },
      // RNF01 – Limitação de Nomenclatura: máx. 30 caracteres (interface móvel)
      len: { args: [2, 30], msg: 'Nome deve ter entre 2 e 30 caracteres' },
    },
  },
  ordem: {
    // RF02 – Ordenação Personalizada: permite definir posição no cardápio
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'categorias',
  timestamps: true,
});

module.exports = Categoria;
