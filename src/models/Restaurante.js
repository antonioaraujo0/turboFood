const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Restaurante = sequelize.define(
  "Restaurante",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeFantasia: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nome Fantasia deve ser preenchido!" },
        len: {
          args: [2, 100],
          msg: "Nome Fantasia deve ter entre 2 e 100 caracteres!",
        },
      },
    },
    cnpj: {
      type: DataTypes.STRING,
      unique: { msg: "CNPJ já cadastrado!" },
      validate: {
        notEmpty: { msg: "CNPJ deve ser preenchido!" },
        is: {
          args: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
          msg: "CNPJ inválido!",
        },
      },
    },
    aberto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "restaurantes",
    timestamps: true,
  }
);

module.exports = Restaurante;
