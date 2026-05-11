const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EnderecoEntrega = sequelize.define('EnderecoEntrega', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rua: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: { msg: 'Rua é obrigatória' } },
  },
  numero: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { notEmpty: { msg: 'Número é obrigatório' } },
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: { msg: 'Bairro é obrigatório' } },
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: { msg: 'Cidade é obrigatória' } },
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'enderecos_entrega',
  timestamps: true,
});

module.exports = EnderecoEntrega;
