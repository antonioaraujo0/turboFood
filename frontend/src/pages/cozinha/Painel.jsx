import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const COLUNAS = [
  { key: 'aguardando', label: '⏳ Novos Pedidos', color: 'var(--warning)', next: 'confirmado', nextLabel: 'Confirmar' },
  { key: 'confirmado', label: '✅ Confirmados', color: 'var(--info)', next: 'preparando', nextLabel: 'Iniciar Preparo' },
  { key: 'preparando', label: '👨‍🍳 Em Preparo', color: 'var(--purple)', next: 'pronto', nextLabel: 'Marcar Pronto' },
  { key: 'pronto', label: '📦 Prontos', color: 'var(--success)', next: null, nextLabel: null },
]

export default function CozinhaPainel() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [clock, setClock] = useState('')

  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  function updateStatus(pedidoId, status) {
    dispatch({ type: 'UPDATE_PEDIDO_STATUS', payload: { id: pedidoId, status } })
  }

  function getElapsed(createdAt) {
    const mins = Math.floor((Date.now() - new Date(createdAt)) / 60000)
    if (mins < 60) return `${mins} min`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  function isUrgente(createdAt) {
    return (Date.now() - new Date(createdAt)) > 20 * 60000
  }

  function logout() {
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const pedidosAtivos = state.pedidos.filter(p =>
    ['aguardando', 'confirmado', 'preparando', 'pronto'].includes(p.status)
  )

  return (
    <div className="kitchen-body">
      <div className="kitchen-header">
        <div className="kitchen-logo">
          <div className="kitchen-logo-icon">⚡</div>
          TurboFood – Cozinha
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="kitchen-clock">{clock}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            <span>⏳ {state.pedidos.filter(p => p.status === 'aguardando').length} novos</span>
            <span>👨‍🍳 {state.pedidos.filter(p => p.status === 'preparando').length} preparando</span>
            <span>📦 {state.pedidos.filter(p => p.status === 'pronto').length} prontos</span>
            <span>✅ {state.pedidos.filter(p => p.status === 'entregue').length} entregues</span>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={logout}>🚪 Sair</button>
        </div>
      </div>

      <div className="kitchen-content">
        {COLUNAS.map(col => {
          const pedidos = pedidosAtivos.filter(p => p.status === col.key)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          return (
            <div key={col.key} className="kitchen-col">
              <div className="kitchen-col-header">
                <span className="kitchen-col-title" style={{ color: col.color }}>{col.label}</span>
                <span className="kitchen-col-count">{pedidos.length}</span>
              </div>
              <div className="kitchen-cards">
                {pedidos.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                    Nenhum pedido
                  </div>
                )}
                {pedidos.map(p => {
                  const cliente = state.clientes.find(c => c.id === p.clienteId)
                  const urgente = isUrgente(p.createdAt)
                  return (
                    <div key={p.id} className={`kitchen-card ${urgente ? 'urgente' : col.key === 'pronto' ? 'pronto' : 'novo'}`}>
                      <div className="kitchen-card-top">
                        <span className="kitchen-order-id">
                          #{p.id} – {cliente?.nome?.split(' ')[0] || 'Cliente'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {urgente && <span style={{ fontSize: '0.65rem', background: 'var(--danger)', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>⚠ URGENTE</span>}
                          <span className="kitchen-time">{getElapsed(p.createdAt)}</span>
                        </div>
                      </div>

                      <div className="kitchen-items">
                        {p.items.map((item, i) => (
                          <div key={i}>{item.emoji} {item.nome} <strong>x{item.quantidade}</strong></div>
                        ))}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                        📍 {p.enderecoEntrega?.substring(0, 35)}...
                      </div>

                      <div className="kitchen-card-actions">
                        {col.next && (
                          <button
                            className={`kitchen-btn ${col.next === 'pronto' ? 'kitchen-btn-success' : 'kitchen-btn-primary'}`}
                            onClick={() => updateStatus(p.id, col.next)}
                          >
                            {col.nextLabel} →
                          </button>
                        )}
                        {col.key === 'pronto' && (
                          <button
                            className="kitchen-btn kitchen-btn-success"
                            style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--success)' }}
                            onClick={() => updateStatus(p.id, 'entregando')}
                          >
                            🛵 Saiu para entrega
                          </button>
                        )}
                        <button
                          className="kitchen-btn"
                          style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', flex: '0 0 auto', padding: '7px 10px' }}
                          onClick={() => updateStatus(p.id, 'cancelado')}
                          title="Cancelar pedido"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
