export const USUARIOS = [
  { id: 1, email: 'admin@turbofood.com', senha: '123', role: 'admin', nome: 'Roni Herculano', clienteId: null, entregadorId: null },
  { id: 2, email: 'joao@turbofood.com', senha: '123', role: 'cliente', nome: 'Joao Silva', clienteId: 1, entregadorId: null },
  { id: 3, email: 'maria@turbofood.com', senha: '123', role: 'cliente', nome: 'Maria Santos', clienteId: 2, entregadorId: null },
  { id: 4, email: 'pedro@turbofood.com', senha: '123', role: 'cliente', nome: 'Pedro Costa', clienteId: 3, entregadorId: null },
  { id: 5, email: 'cozinha@turbofood.com', senha: '123', role: 'cozinha', nome: 'Cozinha', clienteId: null, entregadorId: null },
  { id: 6, email: 'carlos@turbofood.com', senha: '123', role: 'entregador', nome: 'Carlos Ferreira', clienteId: null, entregadorId: 1 },
  { id: 7, email: 'lucas@turbofood.com', senha: '123', role: 'entregador', nome: 'Lucas Mendes', clienteId: null, entregadorId: 2 },
]

export const initialData = {
  categorias: [
    { id: 1, nome: 'Pizzas', descricao: 'Pizzas artesanais feitas no forno a lenha' },
    { id: 2, nome: 'Lanches', descricao: 'Hamburgueres e sanduiches' },
    { id: 3, nome: 'Bebidas', descricao: 'Refrigerantes, sucos e agua' },
    { id: 4, nome: 'Sobremesas', descricao: 'Doces e sobremesas artesanais' },
    { id: 5, nome: 'Combos', descricao: 'Combinacoes especiais com desconto' },
  ],
  produtos: [
    { id: 1, nome: 'Pizza Margherita', descricao: 'Molho especial, mussarela, tomate cereja e manjericao fresco', preco: 42.90, categoriaId: 1, status: 'ativo', emoji: '🍕' },
    { id: 2, nome: 'Pizza Calabresa', descricao: 'Molho especial, mussarela, calabresa artesanal e cebola roxa', preco: 44.90, categoriaId: 1, status: 'ativo', emoji: '🍕' },
    { id: 3, nome: 'Pizza Frango Catupiry', descricao: 'Frango desfiado, catupiry original, milho e palmito', preco: 46.90, categoriaId: 1, status: 'ativo', emoji: '🍕' },
    { id: 4, nome: 'Pizza Portuguesa', descricao: 'Presunto, ovos cozidos, azeitona preta, cebola e pimentao', preco: 47.90, categoriaId: 1, status: 'ativo', emoji: '🍕' },
    { id: 5, nome: 'TurboSmash Burger', descricao: '2x blend 120g, queijo americano, alface, tomate e molho turbo', preco: 34.90, categoriaId: 2, status: 'ativo', emoji: '🍔' },
    { id: 6, nome: 'Bacon Smash', descricao: 'Blend 150g, queijo cheddar, bacon crocante, cebola caramelizada', preco: 38.90, categoriaId: 2, status: 'ativo', emoji: '🍔' },
    { id: 7, nome: 'Wrap Frango', descricao: 'Frango grelhado, cream cheese, alface, tomate e molho mostarda-mel', preco: 24.90, categoriaId: 2, status: 'ativo', emoji: '🌮' },
    { id: 8, nome: 'Coca-Cola 2L', descricao: 'Garrafa 2 litros gelada', preco: 12.00, categoriaId: 3, status: 'ativo', emoji: '🥤' },
    { id: 9, nome: 'Suco de Laranja', descricao: 'Natural, 500ml, sem acucar adicionado', preco: 10.00, categoriaId: 3, status: 'ativo', emoji: '🧃' },
    { id: 10, nome: 'Agua Mineral 500ml', descricao: 'Sem gas, garrafa individual gelada', preco: 4.00, categoriaId: 3, status: 'ativo', emoji: '💧' },
    { id: 11, nome: 'Petit Gateau', descricao: 'Com sorvete de creme e calda de chocolate quente', preco: 22.00, categoriaId: 4, status: 'ativo', emoji: '🍰' },
    { id: 12, nome: 'Sorvete 2 Bolas', descricao: 'Escolha 2 sabores: creme, chocolate, morango ou flocos', preco: 14.00, categoriaId: 4, status: 'inativo', emoji: '🍨' },
    { id: 13, nome: 'Combo Familia', descricao: '2 pizzas grandes + 2 refrigerantes 2L. Economia de R$ 11,80!', preco: 89.90, categoriaId: 5, status: 'ativo', emoji: '🎁' },
    { id: 14, nome: 'Combo Casal', descricao: '1 pizza grande + 1 bebida 2L + 1 sobremesa', preco: 62.90, categoriaId: 5, status: 'ativo', emoji: '🎁' },
  ],
  clientes: [
    { id: 1, nome: 'Joao Silva', email: 'joao@turbofood.com', telefone: '(11) 99999-1111', cpf: '111.111.111-11', endereco: 'Rua das Flores, 123 - Centro', cidade: 'Sao Paulo', cep: '01310-100' },
    { id: 2, nome: 'Maria Santos', email: 'maria@turbofood.com', telefone: '(11) 99999-2222', cpf: '222.222.222-22', endereco: 'Av. Presidente Vargas, 456 - Bairro Novo', cidade: 'Sao Paulo', cep: '01320-000' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@turbofood.com', telefone: '(11) 99999-3333', cpf: '333.333.333-33', endereco: 'Rua C, 789 - Vila Nova', cidade: 'Sao Paulo', cep: '01330-000' },
  ],
  veiculos: [
    { id: 1, tipo: 'moto', placa: 'ABC-1234', modelo: 'Honda CG 160', ano: '2021', cor: 'Vermelho', renavam: '12345678901' },
    { id: 2, tipo: 'moto', placa: 'DEF-5678', modelo: 'Honda Biz 125', ano: '2020', cor: 'Azul', renavam: '98765432109' },
    { id: 3, tipo: 'moto', placa: 'GHI-9012', modelo: 'Yamaha Fan 125', ano: '2022', cor: 'Preto', renavam: '11223344556' },
    { id: 4, tipo: 'moto', placa: 'JKL-3456', modelo: 'Honda PCX 150', ano: '2023', cor: 'Branco', renavam: '55443322110' },
    { id: 5, tipo: 'moto', placa: 'MNO-7890', modelo: 'Titan 160', ano: '2019', cor: 'Cinza', renavam: '99887766554' },
  ],
  entregadores: [
    { id: 1, nome: 'Carlos Ferreira', email: 'carlos@turbofood.com', telefone: '(28) 99111-2222', cpf: '111.222.333-44', cnh: 'ES 1234567', categoriaCnh: 'A', validadeCnh: '2027-12-31', veiculoId: 1, status: 'disponivel', senha: '123' },
    { id: 2, nome: 'Lucas Mendes', email: 'lucas@turbofood.com', telefone: '(28) 99333-4444', cpf: '222.333.444-55', cnh: 'ES 7654321', categoriaCnh: 'A', validadeCnh: '2026-08-15', veiculoId: 2, status: 'disponivel', senha: '123' },
    { id: 3, nome: 'Paulo Andrade', email: 'paulo@turbofood.com', telefone: '(28) 99555-6666', cpf: '333.444.555-66', cnh: 'ES 9988776', categoriaCnh: 'AB', validadeCnh: '2025-03-20', veiculoId: 3, status: 'disponivel', senha: '123' },
    { id: 4, nome: 'Marcos Rocha', email: 'marcos@turbofood.com', telefone: '(28) 99777-8888', cpf: '444.555.666-77', cnh: 'ES 1122334', categoriaCnh: 'A', validadeCnh: '2028-05-10', veiculoId: 4, status: 'disponivel', senha: '123' },
    { id: 5, nome: 'Fernando Santos', email: 'fernando@turbofood.com', telefone: '(28) 99999-0000', cpf: '555.666.777-88', cnh: 'ES 5544332', categoriaCnh: 'A', validadeCnh: '2026-11-30', veiculoId: 5, status: 'inativo', senha: '123' },
  ],
  pedidos: [
    {
      id: 1, clienteId: 1, entregadorId: 1,
      items: [
        { produtoId: 1, nome: 'Pizza Margherita', emoji: '🍕', preco: 42.90, quantidade: 1 },
        { produtoId: 8, nome: 'Coca-Cola 2L', emoji: '🥤', preco: 12.00, quantidade: 2 },
      ],
      status: 'entregue', subtotal: 66.90, taxaEntrega: 5.00, total: 71.90,
      enderecoEntrega: 'Rua das Flores, 123 - Centro', bairro: 'Centro', observacoes: '',
      createdAt: '2026-06-20T14:30:00'
    },
    {
      id: 2, clienteId: 2, entregadorId: 1,
      items: [
        { produtoId: 5, nome: 'TurboSmash Burger', emoji: '🍔', preco: 34.90, quantidade: 2 },
      ],
      status: 'entregue', subtotal: 69.80, taxaEntrega: 7.00, total: 76.80,
      enderecoEntrega: 'Av. Presidente Vargas, 456 - Bairro Novo', bairro: 'Bairro Novo', observacoes: '',
      createdAt: '2026-06-20T15:00:00'
    },
    {
      id: 3, clienteId: 3, entregadorId: null,
      items: [
        { produtoId: 13, nome: 'Combo Familia', emoji: '🎁', preco: 89.90, quantidade: 1 },
      ],
      status: 'pronto', subtotal: 89.90, taxaEntrega: 5.00, total: 94.90,
      enderecoEntrega: 'Rua C, 789 - Vila Nova', bairro: 'Vila Nova', observacoes: '',
      createdAt: '2026-06-25T11:30:00'
    },
    {
      id: 4, clienteId: 1, entregadorId: null,
      items: [
        { produtoId: 2, nome: 'Pizza Calabresa', emoji: '🍕', preco: 44.90, quantidade: 1 },
        { produtoId: 9, nome: 'Suco de Laranja', emoji: '🧃', preco: 10.00, quantidade: 1 },
      ],
      status: 'pronto', subtotal: 54.90, taxaEntrega: 5.00, total: 59.90,
      enderecoEntrega: 'Rua das Flores, 123 - Centro', bairro: 'Centro', observacoes: '',
      createdAt: '2026-06-25T12:00:00'
    },
    {
      id: 5, clienteId: 2, entregadorId: null,
      items: [
        { produtoId: 6, nome: 'Bacon Smash', emoji: '🍔', preco: 38.90, quantidade: 1 },
      ],
      status: 'preparando', subtotal: 38.90, taxaEntrega: 5.00, total: 43.90,
      enderecoEntrega: 'Av. Presidente Vargas, 456 - Bairro Novo', bairro: 'Bairro Novo', observacoes: '',
      createdAt: '2026-06-25T12:30:00'
    },
  ],
  pagamentos: [
    { id: 1, pedidoId: 1, valor: 71.90, metodo: 'cartao_credito', status: 'aprovado' },
    { id: 2, pedidoId: 2, valor: 76.80, metodo: 'pix', status: 'aprovado' },
    { id: 3, pedidoId: 3, valor: 94.90, metodo: 'dinheiro', status: 'pendente' },
    { id: 4, pedidoId: 4, valor: 59.90, metodo: 'pix', status: 'pendente' },
    { id: 5, pedidoId: 5, valor: 43.90, metodo: 'cartao_credito', status: 'pendente' },
  ],
  // Modelo novo: uma entrega pode conter ate 5 pedidos (batch delivery)
  entregas: [
    {
      id: 1,
      entregadorId: 1,
      pedidoIds: [1, 2],        // batch com 2 pedidos
      status: 'entregue',
      dataInicio: '2026-06-20T14:35:00',
      dataFim: '2026-06-20T15:30:00',
      observacao: 'Entrega realizada sem problemas'
    },
  ],
  avaliacoes: [
    { id: 1, pedidoId: 1, clienteId: 1, entregadorId: 1, notaComida: 5, notaEntrega: 5, comentario: 'Pizza chegou quentinha e entregador muito educado.', createdAt: '2026-06-20T15:45:00' },
    { id: 2, pedidoId: 2, clienteId: 2, entregadorId: 1, notaComida: 4, notaEntrega: 5, comentario: 'Hamburguer otimo, chegou um pouco frio.', createdAt: '2026-06-20T16:00:00' },
  ],
  cart: [],
  currentUser: null,
}
