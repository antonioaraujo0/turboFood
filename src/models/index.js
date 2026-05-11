const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const Categoria = require("./Categoria");
const Produto = require("./Produto");
const Endereco = require("./EnderecoEntrega");
const Cliente = require("./Cliente");
const Restaurante = require("./Restaurante");
const Veiculo = require("./Veiculo");
const Entregador = require("./Entregador");
const Pedido = require("./Pedido");
const ItemPedido = require("./ItemPedido");
const Entrega = require("./Entrega");
const Pagamento = require("./Pagamento");
const Avaliacao = require("./Avaliacao");

const models = {
  Categoria,
  Produto,
  Endereco,
  Cliente,
  Restaurante,
  Veiculo,
  Entregador,
  Pedido,
  ItemPedido,
  Entrega,
  Pagamento,
  Avaliacao,
};

// Configura associações se cada model tiver um método associate
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
