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

// ---------------------------------------------------------------------------
// Associações centrais
// Todos os models usam sequelize.define (CommonJS). As relações abaixo definem
// os aliases (`as`) usados pelos includes nos controllers/services.
// ---------------------------------------------------------------------------

// Categoria 1—N Produto
Categoria.hasMany(Produto, { foreignKey: "categoriaId", as: "produtos" });
Produto.belongsTo(Categoria, { foreignKey: "categoriaId", as: "categoria" });

// Cliente 1—N EnderecoEntrega
Cliente.hasMany(Endereco, { foreignKey: "clienteId", as: "enderecos" });
Endereco.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });

// Cliente 1—N Pedido
Cliente.hasMany(Pedido, { foreignKey: "clienteId", as: "pedidos" });
Pedido.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });

// EnderecoEntrega 1—N Pedido
Endereco.hasMany(Pedido, { foreignKey: "enderecoEntregaId", as: "pedidos" });
Pedido.belongsTo(Endereco, {
  foreignKey: "enderecoEntregaId",
  as: "enderecoEntrega",
});

// Entregador 1—1 Veiculo
Entregador.hasOne(Veiculo, { foreignKey: "entregadorId", as: "veiculo" });
Veiculo.belongsTo(Entregador, { foreignKey: "entregadorId", as: "entregador" });

// Entregador 1—N Pedido (entregador atribuído ao pedido)
Entregador.hasMany(Pedido, { foreignKey: "entregadorId", as: "pedidos" });
Pedido.belongsTo(Entregador, { foreignKey: "entregadorId", as: "entregador" });

// Pedido 1—N ItemPedido
Pedido.hasMany(ItemPedido, { foreignKey: "pedidoId", as: "itens" });
ItemPedido.belongsTo(Pedido, { foreignKey: "pedidoId", as: "pedido" });

// Produto 1—N ItemPedido
Produto.hasMany(ItemPedido, { foreignKey: "produtoId", as: "itens" });
ItemPedido.belongsTo(Produto, { foreignKey: "produtoId", as: "produto" });

// Pedido 1—N Pagamento
Pedido.hasMany(Pagamento, { foreignKey: "pedidoId", as: "pagamentos" });
Pagamento.belongsTo(Pedido, { foreignKey: "pedidoId", as: "pedido" });

// Pedido 1—1 Avaliacao
Pedido.hasOne(Avaliacao, { foreignKey: "pedidoId", as: "avaliacao" });
Avaliacao.belongsTo(Pedido, { foreignKey: "pedidoId", as: "pedido" });

// Cliente 1—N Avaliacao
Cliente.hasMany(Avaliacao, { foreignKey: "clienteId", as: "avaliacoes" });
Avaliacao.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });

// Entrega 1—N Pedido (RN01: até 5 pedidos por entrega)
Entrega.hasMany(Pedido, { foreignKey: "entregaId", as: "pedidos" });
Pedido.belongsTo(Entrega, { foreignKey: "entregaId", as: "entrega" });

// Entregador 1—N Entrega
Entregador.hasMany(Entrega, { foreignKey: "entregadorId", as: "entregas" });
Entrega.belongsTo(Entregador, { foreignKey: "entregadorId", as: "entregador" });

module.exports = {
  sequelize,
  Sequelize,
  ...models,
  // alias adicional para quem referencia pelo nome do arquivo
  EnderecoEntrega: Endereco,
};
