const express = require('express');
const cors = require('cors');

const categoriaRoutes = require('./modules/categorias/routes/categoriaRoutes');
const produtoRoutes = require('./modules/produtos/routes/produtoRoutes');
const clienteRoutes = require('./modules/clientes/routes/clienteRoutes');
const entregadorRoutes = require('./modules/entregadores/routes/entregadorRoutes');
const veiculoRoutes = require('./modules/veiculos/routes/veiculoRoutes');
const enderecoRoutes = require('./modules/enderecos/routes/enderecoEntregaRoutes');
const pedidoRoutes = require('./modules/pedidos/routes/pedidoRoutes');
const pagamentoRoutes = require('./modules/pagamentos/routes/pagamentoRoutes');
const entregaRoutes = require('./modules/entregas/routes/entregaRoutes');
const avaliacaoRoutes = require('./modules/avaliacoes/routes/avaliacaoRoutes');
const authRoutes = require('./modules/auth/routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/categorias', categoriaRoutes);
app.use('/produtos', produtoRoutes);
app.use('/clientes', clienteRoutes);
app.use('/entregadores', entregadorRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/enderecos', enderecoRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/pagamentos', pagamentoRoutes);
app.use('/entrega', entregaRoutes);
app.use('/avaliacoes', avaliacaoRoutes);
app.use('/auth', authRoutes);

module.exports = app;