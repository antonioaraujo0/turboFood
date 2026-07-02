const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Entrega agrupa de 1 a 5 pedidos (RN01) atribuídos a um entregador.
// As associações são definidas centralmente em models/index.js.
const Entrega = sequelize.define(
  "Entrega",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dataSaida: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dataConclusao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("AGUARDANDO", "EM_ROTA", "ENTREGUE", "FALHOU"),
      allowNull: false,
      defaultValue: "AGUARDANDO",
    },
    motivoFalha: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    entregadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "entregas",
    timestamps: true,
  }
);

module.exports = Entrega;
