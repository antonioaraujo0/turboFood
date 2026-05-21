const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { sequelize } = require("./models");

const categoriaRoutes = require("./routes/categoriaRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const entregadorRoutes = require("./routes/entregadorRoutes");
const veiculoRoutes = require("./routes/veiculoRoutes");
const enderecoEntregaRoutes = require("./routes/enderecoEntregaRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");
const entregaRoutes = require("./routes/entregaRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const authRoutes = require("./routes/authRoutes");
const relatorioEntregaRoutes = require("./routes/relatorioEntregaRoutes");
const relatorioAvaliacaoRoutes = require("./routes/relatorioAvaliacaoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SGPE - TurboFood API",
      version: "1.0.0",
      description:
        "Sistema de Gestão de Pedidos Exclusivos - TurboFood\n" +
        "API RESTful — Cadastros básicos + Casos de Uso com Transações Sequelize.\n\n" +
        "**Casos de Uso implementados:**\n" +
        "- **Pedido [RF29]**: RN01 Endereço pertence ao cliente | RN02 Estoque suficiente\n" +
        "- **Pagamento [RF33]**: RN01 Máx. 1 pagamento aprovado | RN02 Aprovação confirma pedido\n" +
        "- **Cozinha [RF37]**: RN01 Bloqueio sem pagamento aprovado | RN02 Progressão de status\n" +
        "- **Entrega [RF41]**: RN01 Limite 5 pedidos | RN02 Jornada 8h | RN03 Entregador disponível\n" +
        "- **Avaliação [RF51]**: RN04 Uma avaliação por pedido | RN05 Deslig. < 2★ | RN06 Bônus > 4.5★\n" +
        "- **Login [RF25]**: RN01 Bloqueio 5 tentativas | RN02 Níveis de acesso",
      contact: {
        name: "JARR - Logistics & Innovation",
        url: "https://github.com/ravarmes",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Servidor de Desenvolvimento",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas de cadastro
app.use("/categorias", categoriaRoutes);
app.use("/produtos", produtoRoutes);
app.use("/clientes", clienteRoutes);
app.use("/entregadores", entregadorRoutes);
app.use("/veiculos", veiculoRoutes);
app.use("/enderecos", enderecoEntregaRoutes);

// Rotas de processos de negócio (casos de uso)
app.use("/pedidos", pedidoRoutes);
app.use("/pagamentos", pagamentoRoutes);
app.use("/entrega", entregaRoutes);
app.use("/avaliacoes", avaliacaoRoutes);

// Autenticação (RF25-RF28)
app.use("/auth", authRoutes);

// Relatórios de entrega (REL01, REL02)
app.use("/relatorios", relatorioEntregaRoutes);
app.use("/relatorios/avaliacoes", relatorioAvaliacaoRoutes);
app.get("/", (req, res) => {
  res.json({
    sistema: "SGPE - TurboFood",
    versao: "1.0.0",
    empresa: "JARR - Logistics & Innovation",
    documentacao: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      cadastros: {
        categorias: "/categorias",
        produtos: "/produtos",
        clientes: "/clientes",
        entregadores: "/entregadores",
        veiculos: "/veiculos",
        enderecos: "/enderecos",
      },
      processosDeNegocio: {
        pedidos: "/pedidos",
        pagamentos: "/pagamentos",
        entrega: "/entrega",
      },
    },
  });
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("✅ Banco de dados sincronizado (SQLite)");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao banco de dados:", err);
  });
