const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Veiculo = sequelize.define('Veiculo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.ENUM('moto', 'bicicleta', 'carro'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Tipo de veículo é obrigatório' },
    },
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Modelo é obrigatório' },
    },
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: true,
    unique: true,
  },
  cor: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Cor é obrigatória' },
    },
  },
  ano: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Ano deve ser um número inteiro' },
      min: { args: [1990], msg: 'Ano inválido' },
    },
  },
  renavan: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('disponivel', 'em_uso', 'manutencao', 'indisponivel'),
    defaultValue: 'disponivel',
  },
  entregadorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'veiculos',
  timestamps: true,
});

module.exports = Veiculo;
