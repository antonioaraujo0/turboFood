// -----------------------------------------------------------------------------
// Cliente HTTP do TurboFood
//
// A URL base vem da variável de ambiente VITE_API_URL (definida no .env do
// frontend e no painel do Render). Ex.: https://turbofood-api.onrender.com
//
// Se VITE_API_URL não estiver definida, o app continua funcionando em modo
// offline (mock/localStorage) — ver AppContext.
// -----------------------------------------------------------------------------

export const API_URL = import.meta.env.VITE_API_URL || ''

export const apiAtivo = Boolean(API_URL)

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const texto = await res.text()
  const dados = texto ? JSON.parse(texto) : null

  if (!res.ok) {
    // O backend responde { erro: '...' } nas validações de regra de negócio.
    const msg = (dados && (dados.erro || dados.detalhe)) || `Erro ${res.status}`
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
  }

  return dados
}

// Helpers CRUD genéricos
const crud = (recurso) => ({
  listar: () => request(`/${recurso}`),
  buscar: (id) => request(`/${recurso}/${id}`),
  criar: (body) => request(`/${recurso}`, { method: 'POST', body }),
  atualizar: (id, body) => request(`/${recurso}/${id}`, { method: 'PUT', body }),
  remover: (id) => request(`/${recurso}/${id}`, { method: 'DELETE' }),
})

export const api = {
  request,

  auth: {
    login: (email, senha) =>
      request('/auth/login', { method: 'POST', body: { email, senha } }),
  },

  categorias: crud('categorias'),
  produtos: crud('produtos'),
  clientes: crud('clientes'),
  entregadores: crud('entregadores'),
  veiculos: crud('veiculos'),
  enderecos: crud('enderecos'),
  pedidos: crud('pedidos'),
  pagamentos: crud('pagamentos'),
  avaliacoes: crud('avaliacoes'),

  // -------------------------------------------------------------------------
  // Entrega — aqui vivem as regras de negócio RN01 e RN02 (validadas no
  // backend, dentro de uma transação Sequelize).
  //   RN01: uma entrega pode ter no máximo 5 pedidos.
  //   RN02: um entregador não pode passar de 8h de trabalho em 24h.
  // -------------------------------------------------------------------------
  entregas: {
    listar: (filtros = {}) => {
      const qs = new URLSearchParams(filtros).toString()
      return request(`/entrega${qs ? `?${qs}` : ''}`)
    },
    buscar: (id) => request(`/entrega/${id}`),
    // pedidosIds: array de 1 a 5 ids. Lança erro se violar RN01/RN02.
    criar: (entregadorId, pedidosIds) =>
      request('/entrega', { method: 'POST', body: { entregadorId, pedidosIds } }),
    adicionarPedido: (entregaId, pedidoId) =>
      request(`/entrega/${entregaId}/pedidos`, { method: 'POST', body: { pedidoId } }),
    iniciar: (id) => request(`/entrega/${id}/iniciar`, { method: 'POST' }),
    finalizar: (id) => request(`/entrega/${id}/finalizar`, { method: 'POST' }),
    falhar: (id, motivoFalha) =>
      request(`/entrega/${id}/falhar`, { method: 'POST', body: { motivoFalha } }),
    // RN02: consulta as horas trabalhadas / disponíveis nas últimas 24h.
    jornada: (entregadorId) =>
      request(`/entrega/entregador/${entregadorId}/jornada`),
  },

  // Relatórios
  relatorios: {
    entregasConcluidas: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/entregas-concluidas${qs ? `?${qs}` : ''}`)
    },
    horasTrabalhadas: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/horas-trabalhadas${qs ? `?${qs}` : ''}`)
    },
    produtos: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/produtos${qs ? `?${qs}` : ''}`)
    },
    pedidos: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/pedidos${qs ? `?${qs}` : ''}`)
    },
    entregadores: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/entregadores${qs ? `?${qs}` : ''}`)
    },
    categorias: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/categorias${qs ? `?${qs}` : ''}`)
    },
    clientes: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/clientes${qs ? `?${qs}` : ''}`)
    },
    pagamentos: (q = {}) => {
      const qs = new URLSearchParams(q).toString()
      return request(`/relatorios/pagamentos${qs ? `?${qs}` : ''}`)
    },
    // Relatórios analíticos de avaliação (por período; datas YYYY-MM-DD)
    avaliacoesPorBairro: (inicio, termino) =>
      request(`/relatorios/avaliacoes/bairro/${inicio}/${termino}`),
    desempenhoEntregadores: (inicio, termino) =>
      request(`/relatorios/avaliacoes/entregadores/${inicio}/${termino}`),
  },
}

export default api
