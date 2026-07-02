import { createContext, useContext, useReducer, useEffect } from 'react'
import { initialData } from '../data/mockData'
import { MAX_PEDIDOS_POR_ENTREGA, MAX_HORAS_CONSECUTIVAS, calcularHorasConsecutivas } from '../utils/entregaRules'

const AppContext = createContext()

function reducer(state, action) {
  switch (action.type) {

    case 'LOGIN': return { ...state, currentUser: action.payload }
    case 'LOGOUT': return { ...state, currentUser: null, cart: [] }

    // --- Categorias ---
    case 'ADD_CATEGORIA': return { ...state, categorias: [...state.categorias, action.payload] }
    case 'UPDATE_CATEGORIA': return { ...state, categorias: state.categorias.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CATEGORIA': return { ...state, categorias: state.categorias.filter(c => c.id !== action.payload) }

    // --- Produtos ---
    case 'ADD_PRODUTO': return { ...state, produtos: [...state.produtos, action.payload] }
    case 'UPDATE_PRODUTO': return { ...state, produtos: state.produtos.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PRODUTO': return { ...state, produtos: state.produtos.filter(p => p.id !== action.payload) }
    case 'TOGGLE_PRODUTO_STATUS': return {
      ...state,
      produtos: state.produtos.map(p => p.id === action.payload
        ? { ...p, status: p.status === 'ativo' ? 'inativo' : 'ativo' }
        : p)
    }

    // --- Clientes ---
    case 'ADD_CLIENTE': return { ...state, clientes: [...state.clientes, action.payload] }
    case 'UPDATE_CLIENTE': return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CLIENTE': return { ...state, clientes: state.clientes.filter(c => c.id !== action.payload) }

    // --- Entregadores ---
    case 'ADD_ENTREGADOR': return { ...state, entregadores: [...state.entregadores, action.payload] }
    case 'UPDATE_ENTREGADOR': return { ...state, entregadores: state.entregadores.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'DELETE_ENTREGADOR': return { ...state, entregadores: state.entregadores.filter(e => e.id !== action.payload) }

    // --- Veiculos ---
    case 'ADD_VEICULO': return { ...state, veiculos: [...state.veiculos, action.payload] }
    case 'UPDATE_VEICULO': return { ...state, veiculos: state.veiculos.map(v => v.id === action.payload.id ? action.payload : v) }
    case 'DELETE_VEICULO': return { ...state, veiculos: state.veiculos.filter(v => v.id !== action.payload) }

    // --- Pedidos ---
    case 'ADD_PEDIDO': {
      // Cria pedido + pagamento. Entrega e criada separadamente pelo admin.
      return {
        ...state,
        pedidos: [...state.pedidos, action.payload.pedido],
        pagamentos: [...state.pagamentos, action.payload.pagamento],
        cart: [],
      }
    }
    case 'UPDATE_PEDIDO_STATUS': return {
      ...state,
      pedidos: state.pedidos.map(p => p.id === action.payload.id ? { ...p, status: action.payload.status } : p)
    }
    case 'DELETE_PEDIDO': return { ...state, pedidos: state.pedidos.filter(p => p.id !== action.payload) }

    // --- Pagamentos ---
    case 'UPDATE_PAGAMENTO_STATUS': return {
      ...state,
      pagamentos: state.pagamentos.map(p => p.id === action.payload.id ? { ...p, status: action.payload.status } : p)
    }

    // --- Entregas (batch: 1-5 pedidos por entrega) ---
    case 'ADD_ENTREGA': {
      const entrega = action.payload
      // Valida regras de negocio
      const horas = calcularHorasConsecutivas(entrega.entregadorId, state.entregas)
      if (horas >= MAX_HORAS_CONSECUTIVAS) return state // bloqueado por regra de 8h
      if (entrega.pedidoIds.length > MAX_PEDIDOS_POR_ENTREGA) return state // max 5 pedidos

      return {
        ...state,
        entregas: [...state.entregas, { ...entrega, dataInicio: new Date().toISOString() }],
        pedidos: state.pedidos.map(p =>
          entrega.pedidoIds.includes(p.id)
            ? { ...p, status: 'entregando', entregadorId: entrega.entregadorId }
            : p
        ),
        entregadores: state.entregadores.map(e =>
          e.id === entrega.entregadorId ? { ...e, status: 'em_entrega' } : e
        ),
      }
    }

    case 'UPDATE_ENTREGA_STATUS': {
      const { id, status, dataFim } = action.payload
      const entrega = state.entregas.find(e => e.id === id)
      if (!entrega) return state

      const updatedEntregas = state.entregas.map(e => e.id === id ? { ...e, ...action.payload } : e)

      let updatedPedidos = state.pedidos
      let updatedEntregadores = state.entregadores

      if (status === 'entregue') {
        updatedPedidos = state.pedidos.map(p =>
          entrega.pedidoIds.includes(p.id) ? { ...p, status: 'entregue' } : p
        )
        // Libera entregador se nao tem outras entregas ativas
        const outrasAtivas = state.entregas.filter(e =>
          e.id !== id && e.entregadorId === entrega.entregadorId &&
          ['pendente', 'em_andamento'].includes(e.status)
        )
        if (outrasAtivas.length === 0) {
          updatedEntregadores = state.entregadores.map(e =>
            e.id === entrega.entregadorId ? { ...e, status: 'disponivel' } : e
          )
        }
      }

      if (status === 'cancelada') {
        updatedPedidos = state.pedidos.map(p =>
          entrega.pedidoIds.includes(p.id) ? { ...p, status: 'pronto', entregadorId: null } : p
        )
        const outrasAtivas = state.entregas.filter(e =>
          e.id !== id && e.entregadorId === entrega.entregadorId &&
          ['pendente', 'em_andamento'].includes(e.status)
        )
        if (outrasAtivas.length === 0) {
          updatedEntregadores = state.entregadores.map(e =>
            e.id === entrega.entregadorId ? { ...e, status: 'disponivel' } : e
          )
        }
      }

      return {
        ...state,
        entregas: updatedEntregas,
        pedidos: updatedPedidos,
        entregadores: updatedEntregadores,
      }
    }

    case 'ADD_PEDIDO_TO_ENTREGA': {
      const { entregaId, pedidoId } = action.payload
      const entrega = state.entregas.find(e => e.id === entregaId)
      if (!entrega) return state
      if (entrega.pedidoIds.length >= MAX_PEDIDOS_POR_ENTREGA) return state
      if (entrega.status !== 'pendente') return state

      return {
        ...state,
        entregas: state.entregas.map(e =>
          e.id === entregaId ? { ...e, pedidoIds: [...e.pedidoIds, pedidoId] } : e
        ),
        pedidos: state.pedidos.map(p =>
          p.id === pedidoId ? { ...p, status: 'entregando', entregadorId: entrega.entregadorId } : p
        ),
      }
    }

    case 'REMOVE_PEDIDO_FROM_ENTREGA': {
      const { entregaId, pedidoId } = action.payload
      const entrega = state.entregas.find(e => e.id === entregaId)
      if (!entrega || entrega.status !== 'pendente') return state

      return {
        ...state,
        entregas: state.entregas.map(e =>
          e.id === entregaId ? { ...e, pedidoIds: e.pedidoIds.filter(id => id !== pedidoId) } : e
        ),
        pedidos: state.pedidos.map(p =>
          p.id === pedidoId ? { ...p, status: 'pronto', entregadorId: null } : p
        ),
      }
    }

    case 'DELETE_ENTREGA': {
      const entrega = state.entregas.find(e => e.id === action.payload)
      if (!entrega) return state
      return {
        ...state,
        entregas: state.entregas.filter(e => e.id !== action.payload),
        pedidos: state.pedidos.map(p =>
          entrega.pedidoIds.includes(p.id) ? { ...p, status: 'pronto', entregadorId: null } : p
        ),
      }
    }

    // --- Avaliacoes ---
    case 'ADD_AVALIACAO': return { ...state, avaliacoes: [...state.avaliacoes, action.payload] }
    case 'DELETE_AVALIACAO': return { ...state, avaliacoes: state.avaliacoes.filter(a => a.id !== action.payload) }

    // --- Carrinho ---
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.produtoId === action.payload.produtoId)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i => i.produtoId === action.payload.produtoId
            ? { ...i, quantidade: i.quantidade + 1 } : i)
        }
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantidade: 1 }] }
    }
    case 'REMOVE_FROM_CART': return { ...state, cart: state.cart.filter(i => i.produtoId !== action.payload) }
    case 'UPDATE_CART_QTY': {
      if (action.payload.quantidade <= 0) {
        return { ...state, cart: state.cart.filter(i => i.produtoId !== action.payload.produtoId) }
      }
      return {
        ...state,
        cart: state.cart.map(i => i.produtoId === action.payload.produtoId
          ? { ...i, quantidade: action.payload.quantidade } : i)
      }
    }
    case 'CLEAR_CART': return { ...state, cart: [] }

    default: return state
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('turbofood_state_v2')
    return saved ? JSON.parse(saved) : initialData
  } catch {
    return initialData
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem('turbofood_state_v2', JSON.stringify(state))
    } catch {}
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
