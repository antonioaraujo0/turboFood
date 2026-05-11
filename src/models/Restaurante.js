import { Model, DataTypes } from 'sequelize';

class Restaurante extends Model {
  static init(sequelize) {
    super.init({
      nomeFantasia: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Nome Fantasia deve ser preenchido!" },
          len: { args: [2, 100], msg: "Nome Fantasia deve ter entre 2 e 100 caracteres!" }
        }
      },
      cnpj: {
        type: DataTypes.STRING,
        unique: { msg: "CNPJ já cadastrado!" },
        validate: {
          notEmpty: { msg: "CNPJ deve ser preenchido!" },
          is: { args: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, msg: "CNPJ inválido!" }
        }
      },
      aberto: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, { sequelize, modelName: 'restaurante', tableName: 'restaurantes' });
  }

  static associate(models) {
    this.hasMany(models.Entregador, { foreignKey: 'restauranteId', as: 'entregadores' });
    this.hasMany(models.Pedido, { foreignKey: 'restauranteId', as: 'pedidos' });
  }
}

export { Restaurante };
