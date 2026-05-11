import { Model, DataTypes } from 'sequelize';

class Entrega extends Model {
  static init(sequelize) {
    super.init({
      dataSaida: {
        type: DataTypes.DATE,
        validate: {
          isDate: { msg: "Data de saída inválida!" }
        }
      },
      dataConclusao: {
        type: DataTypes.DATE,
        validate: {
          isDate: { msg: "Data de conclusão inválida!" }
        }
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Status da Entrega deve ser preenchido!" },
          isIn: {
            args: [['AGUARDANDO', 'EM_ROTA', 'ENTREGUE', 'FALHOU']],
            msg: "Status inválido!"
          }
        }
      }
    }, { sequelize, modelName: 'entrega', tableName: 'entregas' });
  }

  static associate(models) {
    this.belongsTo(models.Pedido, { foreignKey: 'pedidoId', as: 'pedido' });
    this.belongsTo(models.Entregador, { foreignKey: 'entregadorId', as: 'entregador' });
  }
}

export { Entrega };
