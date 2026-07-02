const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Entregador = sequelize.define('Entregador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nomeCompleto: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome completo é obrigatório' },
    },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Email inválido' },
      notEmpty: { msg: 'Email é obrigatório' },
    },
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Telefone é obrigatório' },
    },
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'CPF é obrigatório' },
    },
  },
  cnh: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'CNH é obrigatória' },
    },
  },
  tipoVeiculo: {
    type: DataTypes.ENUM('moto', 'bicicleta', 'carro'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Tipo de veículo é obrigatório' },
    },
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Senha deve ter pelo menos 6 caracteres' },
    },
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'em_entrega'),
    defaultValue: 'ativo',
  },
  // Contagem de avaliações recebidas (RN01 avaliação: desligamento após 50).
  totalAvaliacoes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'entregadores',
  timestamps: true,
  hooks: {
    beforeCreate: async (entregador) => {
      entregador.senha = await bcrypt.hash(entregador.senha, 10);
    },
    beforeUpdate: async (entregador) => {
      if (entregador.changed('senha')) {
        entregador.senha = await bcrypt.hash(entregador.senha, 10);
      }
    },
  },
});

module.exports = Entregador;
