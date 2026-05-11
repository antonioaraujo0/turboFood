const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Avaliacao = sequelize.define(
  "Avaliacao",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    notaComida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "Nota da comida deve ser entre 1 e 5" },
        max: { args: [5], msg: "Nota da comida deve ser entre 1 e 5" },
      },
    },
    notaEntrega: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "Nota da entrega deve ser entre 1 e 5" },
        max: { args: [5], msg: "Nota da entrega deve ser entre 1 e 5" },
      },
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: { notNull: { msg: "Pedido é obrigatório" } },
    },
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "avaliacoes",
    timestamps: true,
  },
);

module.exports = Avaliacao;
