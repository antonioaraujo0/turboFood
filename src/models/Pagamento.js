const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pagamento = sequelize.define('Pagamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  forma: {
    type: DataTypes.ENUM('credito', 'debito', 'pix'),
    allowNull: false,
    validate: { notNull: { msg: 'Forma de pagamento é obrigatória' } },
  },
  status: {
    type: DataTypes.ENUM('pendente', 'aprovado', 'recusado'),
    defaultValue: 'pendente',
  },
  pedidoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { notNull: { msg: 'Pedido é obrigatório' } },
  },
}, {
  tableName: 'pagamentos',
  timestamps: true,
});

module.exports = Pagamento;
