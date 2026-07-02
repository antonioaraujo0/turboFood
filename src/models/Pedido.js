const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM(
      'aguardando',
      'confirmado',
      'em_preparo',
      'pronto',
      'saiu_para_entrega',
      'entregue',
      'cancelado'
    ),
    defaultValue: 'aguardando',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  formaPagamento: {
    type: DataTypes.ENUM('credito', 'debito', 'pix'),
    allowNull: false,
    validate: { notNull: { msg: 'Forma de pagamento é obrigatória' } },
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { notNull: { msg: 'Cliente é obrigatório' } },
  },
  enderecoEntregaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { notNull: { msg: 'Endereço de entrega é obrigatório' } },
  },
  entregadorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  entregaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'pedidos',
  timestamps: true,
});

module.exports = Pedido;
