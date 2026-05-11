const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Cliente = sequelize.define('Cliente', {
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
      len: { args: [11, 14], msg: 'CPF inválido' },
    },
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Senha deve ter pelo menos 6 caracteres' },
    },
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'clientes',
  timestamps: true,
  hooks: {
    beforeCreate: async (cliente) => {
      cliente.senha = await bcrypt.hash(cliente.senha, 10);
    },
    beforeUpdate: async (cliente) => {
      if (cliente.changed('senha')) {
        cliente.senha = await bcrypt.hash(cliente.senha, 10);
      }
    },
  },
});

Cliente.prototype.verificarSenha = async function (senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = Cliente;
