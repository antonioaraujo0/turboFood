require("dotenv").config();

const sequelize = require("./config/database");

const Categoria = require("./models/Categoria");
const Produto = require("./models/Produto");
const EnderecoEntrega = require("./models/EnderecoEntrega");
const Cliente = require("./models/Cliente");
const Veiculo = require("./models/Veiculo");
const Entregador = require("./models/Entregador");
const Pedido = require("./models/Pedido");
const ItemPedido = require("./models/ItemPedido");
const Pagamento = require("./models/Pagamento");
const Avaliacao = require("./models/Avaliacao");
const Entrega = require("./models/Entrega");

(async () => {
  await sequelize.sync({ force: true });

  // ─── CATEGORIAS ───────────────────────────────────────────────
  const cat1 = await Categoria.create({
    nome: "Lanches",
    descricao: "Hambúrgueres e sanduíches",
    ordem: 1,
  });
  const cat2 = await Categoria.create({
    nome: "Pizzas",
    descricao: "Pizzas tradicionais",
    ordem: 2,
  });
  const cat3 = await Categoria.create({
    nome: "Bebidas",
    descricao: "Bebidas geladas",
    ordem: 3,
  });
  const cat4 = await Categoria.create({
    nome: "Sobremesas",
    descricao: "Doces e sobremesas",
    ordem: 4,
  });
  const cat5 = await Categoria.create({
    nome: "Saudável",
    descricao: "Opções fitness",
    ordem: 5,
  });

  // ─── PRODUTOS ─────────────────────────────────────────────────
  const prod1 = await Produto.create({
    nome: "X-Burguer",
    descricao: "Hambúrguer artesanal com queijo e alface",
    preco: 25.9,
    estoque: 50,
    disponivel: true,
    categoriaId: cat1.id,
  });
  const prod2 = await Produto.create({
    nome: "X-Bacon",
    descricao: "Hambúrguer com bacon crocante e cheddar",
    preco: 29.9,
    estoque: 50,
    disponivel: true,
    categoriaId: cat1.id,
  });
  const prod3 = await Produto.create({
    nome: "Pizza Margherita",
    descricao: "Molho de tomate, mussarela e manjericão",
    preco: 49.9,
    estoque: 20,
    disponivel: true,
    categoriaId: cat2.id,
  });
  const prod4 = await Produto.create({
    nome: "Pizza Calabresa",
    descricao: "Molho de tomate, calabresa e cebola",
    preco: 52.9,
    estoque: 20,
    disponivel: true,
    categoriaId: cat2.id,
  });
  const prod5 = await Produto.create({
    nome: "Coca-Cola 350ml",
    descricao: "Refrigerante gelado",
    preco: 6.0,
    estoque: 100,
    disponivel: true,
    categoriaId: cat3.id,
  });
  const prod6 = await Produto.create({
    nome: "Suco de Laranja",
    descricao: "Suco natural 500ml",
    preco: 9.9,
    estoque: 30,
    disponivel: true,
    categoriaId: cat3.id,
  });
  const prod7 = await Produto.create({
    nome: "Pudim de Leite",
    descricao: "Pudim caseiro com calda de caramelo",
    preco: 12.0,
    estoque: 15,
    disponivel: true,
    categoriaId: cat4.id,
  });
  const prod8 = await Produto.create({
    nome: "Açaí 500ml",
    descricao: "Açaí cremoso com granola e banana",
    preco: 22.0,
    estoque: 0,
    disponivel: false,
    categoriaId: cat4.id,
  });
  const prod9 = await Produto.create({
    nome: "Bowl Proteico",
    descricao: "Frango grelhado, arroz integral e legumes",
    preco: 35.0,
    estoque: 25,
    disponivel: true,
    categoriaId: cat5.id,
  });
  const prod10 = await Produto.create({
    nome: "Salada Caesar",
    descricao: "Alface, croutons, parmesão e molho caesar",
    preco: 28.0,
    estoque: 25,
    disponivel: true,
    categoriaId: cat5.id,
  });

  // ─── CLIENTES ─────────────────────────────────────────────────
  const cli1 = await Cliente.create({
    nomeCompleto: "Ana Paula Souza",
    cpf: "111.111.111-11",
    email: "ana@email.com",
    telefone: "(27) 99111-1111",
    senha: "senha123",
  });
  const cli2 = await Cliente.create({
    nomeCompleto: "Bruno Martins",
    cpf: "222.222.222-22",
    email: "bruno@email.com",
    telefone: "(27) 99222-2222",
    senha: "senha123",
  });
  const cli3 = await Cliente.create({
    nomeCompleto: "Carla Ferreira",
    cpf: "333.333.333-33",
    email: "carla@email.com",
    telefone: "(27) 99333-3333",
    senha: "senha123",
  });
  const cli4 = await Cliente.create({
    nomeCompleto: "Diego Almeida",
    cpf: "444.444.444-44",
    email: "diego@email.com",
    telefone: "(27) 99444-4444",
    senha: "senha123",
  });
  const cli5 = await Cliente.create({
    nomeCompleto: "Eduarda Costa",
    cpf: "555.555.555-55",
    email: "eduarda@email.com",
    telefone: "(27) 99555-5555",
    senha: "senha123",
  });

  // ─── ENDEREÇOS DE ENTREGA ─────────────────────────────────────
  const end1 = await EnderecoEntrega.create({
    rua: "Rua Sete de Setembro",
    numero: "101",
    bairro: "Centro",
    cidade: "Vitória",
    clienteId: cli1.id,
  });
  const end2 = await EnderecoEntrega.create({
    rua: "Av. Champagnat",
    numero: "245",
    bairro: "Jardim América",
    cidade: "Vila Velha",
    clienteId: cli2.id,
  });
  const end3 = await EnderecoEntrega.create({
    rua: "Rua Graciano Neves",
    numero: "88",
    bairro: "Bento Ferreira",
    cidade: "Vitória",
    clienteId: cli3.id,
  });
  const end4 = await EnderecoEntrega.create({
    rua: "Av. Dante Michelini",
    numero: "512",
    bairro: "Praia do Canto",
    cidade: "Vitória",
    clienteId: cli4.id,
  });
  const end5 = await EnderecoEntrega.create({
    rua: "Rua Itaparica",
    numero: "30",
    bairro: "Itaparica",
    cidade: "Vila Velha",
    clienteId: cli5.id,
  });

  // ─── VEÍCULOS ─────────────────────────────────────────────────
  const vei1 = await Veiculo.create({
    tipo: "moto",
    modelo: "Honda CG 160",
    placa: "ABC-1234",
    cor: "Vermelha",
    ano: 2021,
    renavan: "11111111111",
  });
  const vei2 = await Veiculo.create({
    tipo: "moto",
    modelo: "Yamaha Factor",
    placa: "DEF-5678",
    cor: "Preta",
    ano: 2020,
    renavan: "22222222222",
  });
  const vei3 = await Veiculo.create({
    tipo: "moto",
    modelo: "Biz 125",
    placa: "GHI-9012",
    cor: "Branca",
    ano: 2019,
    renavan: "33333333333",
  });
  const vei4 = await Veiculo.create({
    tipo: "bicicleta",
    modelo: "Caloi 10",
    placa: null,
    cor: "Azul",
    ano: 2022,
    renavan: null,
  });
  const vei5 = await Veiculo.create({
    tipo: "moto",
    modelo: "Titan 160",
    placa: "MNO-7890",
    cor: "Cinza",
    ano: 2023,
    renavan: "55555555555",
  });

  // ─── ENTREGADORES ─────────────────────────────────────────────
  const ent1 = await Entregador.create({
    nomeCompleto: "Fernando Lima",
    cpf: "666.666.666-66",
    email: "fernando@email.com",
    telefone: "(27) 99666-6666",
    cnh: "11111111111",
    tipoVeiculo: "moto",
    senha: "senha123",
  });
  const ent2 = await Entregador.create({
    nomeCompleto: "Gustavo Pereira",
    cpf: "777.777.777-77",
    email: "gustavo@email.com",
    telefone: "(27) 99777-7777",
    cnh: "22222222222",
    tipoVeiculo: "moto",
    senha: "senha123",
  });
  const ent3 = await Entregador.create({
    nomeCompleto: "Helena Rocha",
    cpf: "888.888.888-88",
    email: "helena@email.com",
    telefone: "(27) 99888-8888",
    cnh: "33333333333",
    tipoVeiculo: "moto",
    senha: "senha123",
    status: "inativo",
  });
  const ent4 = await Entregador.create({
    nomeCompleto: "Igor Nascimento",
    cpf: "999.999.999-99",
    email: "igor@email.com",
    telefone: "(27) 99999-9999",
    cnh: "44444444444",
    tipoVeiculo: "bicicleta",
    senha: "senha123",
  });
  const ent5 = await Entregador.create({
    nomeCompleto: "Juliana Matos",
    cpf: "101.010.101-01",
    email: "juliana@email.com",
    telefone: "(27) 99101-0101",
    cnh: "55555555555",
    tipoVeiculo: "moto",
    senha: "senha123",
  });

  // Vincula veículos aos entregadores
  await vei1.update({ entregadorId: ent1.id });
  await vei2.update({ entregadorId: ent2.id });
  await vei3.update({ entregadorId: ent3.id });
  await vei4.update({ entregadorId: ent4.id });
  await vei5.update({ entregadorId: ent5.id });

  // ─── PEDIDOS ──────────────────────────────────────────────────
  const ped1 = await Pedido.create({
    total: 61.8,
    status: "entregue",
    formaPagamento: "pix",
    clienteId: cli1.id,
    enderecoEntregaId: end1.id,
    entregadorId: ent1.id,
  });
  const ped2 = await Pedido.create({
    total: 49.9,
    status: "entregue",
    formaPagamento: "credito",
    clienteId: cli2.id,
    enderecoEntregaId: end2.id,
    entregadorId: ent3.id,
  });
  const ped3 = await Pedido.create({
    total: 35.0,
    status: "em_preparo",
    formaPagamento: "debito",
    clienteId: cli3.id,
    enderecoEntregaId: end3.id,
  });
  const ped4 = await Pedido.create({
    total: 82.8,
    status: "saiu_para_entrega",
    formaPagamento: "pix",
    clienteId: cli4.id,
    enderecoEntregaId: end4.id,
    entregadorId: ent4.id,
  });
  const ped5 = await Pedido.create({
    total: 22.0,
    status: "aguardando",
    formaPagamento: "pix",
    clienteId: cli5.id,
    enderecoEntregaId: end5.id,
  });
  const ped6 = await Pedido.create({
    total: 57.9,
    status: "confirmado",
    formaPagamento: "credito",
    clienteId: cli1.id,
    enderecoEntregaId: end1.id,
  });

  // ─── ITENS DE PEDIDO ──────────────────────────────────────────
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 25.9,
    subtotal: 25.9,
    pedidoId: ped1.id,
    produtoId: prod1.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 29.9,
    subtotal: 29.9,
    pedidoId: ped1.id,
    produtoId: prod2.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 6.0,
    subtotal: 6.0,
    pedidoId: ped1.id,
    produtoId: prod5.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 49.9,
    subtotal: 49.9,
    pedidoId: ped2.id,
    produtoId: prod3.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 35.0,
    subtotal: 35.0,
    pedidoId: ped3.id,
    produtoId: prod9.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 52.9,
    subtotal: 52.9,
    pedidoId: ped4.id,
    produtoId: prod4.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 29.9,
    subtotal: 29.9,
    pedidoId: ped4.id,
    produtoId: prod2.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 22.0,
    subtotal: 22.0,
    pedidoId: ped5.id,
    produtoId: prod8.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 25.9,
    subtotal: 25.9,
    pedidoId: ped6.id,
    produtoId: prod1.id,
  });
  await ItemPedido.create({
    quantidade: 2,
    precoUnitario: 6.0,
    subtotal: 12.0,
    pedidoId: ped6.id,
    produtoId: prod5.id,
  });
  await ItemPedido.create({
    quantidade: 1,
    precoUnitario: 12.0,
    subtotal: 12.0,
    pedidoId: ped6.id,
    produtoId: prod7.id,
  });

  // ─── PAGAMENTOS ───────────────────────────────────────────────
  await Pagamento.create({
    valor: 61.8,
    forma: "pix",
    status: "aprovado",
    pedidoId: ped1.id,
  });
  await Pagamento.create({
    valor: 49.9,
    forma: "credito",
    status: "aprovado",
    pedidoId: ped2.id,
  });
  await Pagamento.create({
    valor: 35.0,
    forma: "debito",
    status: "aprovado",
    pedidoId: ped3.id,
  });
  await Pagamento.create({
    valor: 82.8,
    forma: "pix",
    status: "aprovado",
    pedidoId: ped4.id,
  });
  await Pagamento.create({
    valor: 22.0,
    forma: "pix",
    status: "pendente",
    pedidoId: ped5.id,
  });
  await Pagamento.create({
    valor: 57.9,
    forma: "credito",
    status: "pendente",
    pedidoId: ped6.id,
  });

  // ─── AVALIAÇÕES ───────────────────────────────────────────────
  await Avaliacao.create({
    notaComida: 5,
    notaEntrega: 5,
    comentario: "Entrega rápida e lanche delicioso!",
    pedidoId: ped1.id,
    clienteId: cli1.id,
  });
  await Avaliacao.create({
    notaComida: 4,
    notaEntrega: 3,
    comentario: "Pizza boa, mas demorou um pouco.",
    pedidoId: ped2.id,
    clienteId: cli2.id,
  });
  await Avaliacao.create({
    notaComida: 3,
    notaEntrega: 4,
    comentario: "Comida ok, embalagem veio amassada.",
    pedidoId: ped3.id,
    clienteId: cli3.id,
  });
  await Avaliacao.create({
    notaComida: 5,
    notaEntrega: 5,
    comentario: "Perfeito! Voltarei a pedir com certeza.",
    pedidoId: ped4.id,
    clienteId: cli4.id,
  });
  await Avaliacao.create({
    notaComida: 2,
    notaEntrega: 2,
    comentario: "Açaí chegou derretido, fiquei decepcionado.",
    pedidoId: ped5.id,
    clienteId: cli5.id,
  });

  // ─── ENTREGAS (concluídas nas últimas 24h, para os relatórios) ──
  const h = (horas) => new Date(Date.now() - horas * 60 * 60 * 1000);

  // ent1 — 1h trabalhada (saída -2h → conclusão -1h)
  const entrega1 = await Entrega.create({
    entregadorId: ent1.id,
    status: "ENTREGUE",
    dataSaida: h(2),
    dataConclusao: h(1),
  });
  await ped1.update({ entregaId: entrega1.id });

  // ent2 — 4h trabalhadas (saída -5h → conclusão -1h)
  const entrega2 = await Entrega.create({
    entregadorId: ent2.id,
    status: "ENTREGUE",
    dataSaida: h(5),
    dataConclusao: h(1),
  });
  await ped2.update({ entregaId: entrega2.id });

  // ent4 — 1h trabalhada (saída -3h → conclusão -2h)
  const entrega3 = await Entrega.create({
    entregadorId: ent4.id,
    status: "ENTREGUE",
    dataSaida: h(3),
    dataConclusao: h(2),
  });
  await ped4.update({ entregaId: entrega3.id });

  // ent5 — entrega concluída há 8 DIAS (para demonstrar avaliação com sucesso,
  // pois a RN02 exige > 7 dias). ped6 ainda não tem avaliação.
  const entrega4 = await Entrega.create({
    entregadorId: ent5.id,
    status: "ENTREGUE",
    dataSaida: h(8 * 24 + 1),
    dataConclusao: h(8 * 24),
  });
  await ped6.update({ entregaId: entrega4.id });

  console.log("✅ Banco de dados populado com sucesso!");
  process.exit(0);
})();
