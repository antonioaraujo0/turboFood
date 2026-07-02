import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { validarCriacaoEntrega } from '../../utils/entregaRules'

const STATUS_OPTS = ['aguardando', 'confirmado', 'preparando', 'pronto', 'entregando', 'entregue', 'cancelado']
const STATUS_MAP = {
  aguardando: { label: 'Aguardando', cls: 'badge-warning' },
  confirmado: { label: 'Confirmado', cls: 'badge-info' },
  preparando: { label: 'Preparando', cls: 'badge-purple' },
  pronto: { label: 'Pronto', cls: 'badge-orange' },
  entregando: { label: 'Entregando', cls: 'badge-info' },
  entregue: { label: 'Entregue', cls: 'badge-success' },
  cancelado: { label: 'Cancelado', cls: 'badge-danger' },
}

export default function Pedidos() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [criarEntregaModal, setCriarEntregaModal] = useState(null)
  const [criarEntregadorId, setCriarEntregadorId] = useState('')

  const pedidos = state.pedidos.filter(p => {
    const cliente = state.clientes.find(c => c.id === p.clienteId)
    const matchSearch = !search ||
      String(p.id).includes(search) ||
      (cliente?.nome.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchStatus
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function updateStatus(id, status) {
    dispatch({ type: 'UPDATE_PEDIDO_STATUS', payload: { id, status } })
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
    toast(`Status atualizado para ${STATUS_MAP[status]?.label || status}`)
  }

  function deletePedido(id) {
    dispatch({ type: 'DELETE_PEDIDO', payload: id })
    setConfirmDelete(null)
    if (selected?.id === id) setSelected(null)
    toast('Pedido excluido', 'danger')
  }

  function criarEntrega() {
    if (!criarEntregadorId || !criarEntregaModal) return
    const entregadorId = Number(criarEntregadorId)
    const validacao = validarCriacaoEntrega(entregadorId, state.entregas)
    if (!validacao.valido) return
    dispatch({
      type: 'ADD_ENTREGA',
      payload: {
        id: Date.now(),
        entregadorId,
        pedidoIds: [criarEntregaModal.id],
        status: 'pendente',
        observacao: '',
      }
    })
    toast('Entrega criada com sucesso!')
    setCriarEntregaModal(null)
    setCriarEntregadorId('')
  }

  const entregadoresAtivos = state.entregadores.filter(e => e.status !== 'inativo')

  return (
    <AdminLayout title="Pedidos" subtitle="Gerencie todos os pedidos">
      <div className="stats-grid stats-grid-4 mb-4">
        {['aguardando', 'preparando', 'entregando', 'entregue'].map(s => (
          <div key={s} className="stat-card">
            <div className={`stat-icon ${s === 'aguardando' ? 'yellow' : s === 'preparando' ? 'purple' : s === 'entregando' ? 'blue' : 'green'}`}>
              {s === 'aguardando' ? '⏳' : s === 'preparando' ? '👨‍🍳' : s === 'entregando' ? '🛵' : '✅'}
            </div>
            <div>
              <div className="stat-value">{state.pedidos.filter(p => p.status === s).length}</div>
              <div className="stat-label">{STATUS_MAP[s].label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="status-tabs">
        <button className={`status-tab${filterStatus === '' ? ' active' : ''}`} onClick={() => setFilterStatus('')}>
          Todos ({state.pedidos.length})
        </button>
        {STATUS_OPTS.map(s => {
          const cnt = state.pedidos.filter(p => p.status === s).length
          return cnt > 0 ? (
            <button key={s} className={`status-tab${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
              {STATUS_MAP[s].label} ({cnt})
            </button>
          ) : null
        })}
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por ID ou cliente..." />
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/entregas')}>
          🚚 Gerenciar Entregas
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => {
                const cliente = state.clientes.find(c => c.id === p.clienteId)
                const s = STATUS_MAP[p.status] || { label: p.status, cls: 'badge-gray' }
                return (
                  <tr key={p.id}>
                    <td className="font-semibold">#{p.id}</td>
                    <td>
                      <div className="font-semibold">{cliente?.nome || 'N/A'}</div>
                      <div className="text-xs text-muted">{p.enderecoEntrega}</div>
                    </td>
                    <td className="text-sm">{p.items.map(i => `${i.nome} x${i.quantidade}`).join(', ')}</td>
                    <td className="font-semibold">R$ {p.total.toFixed(2)}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td className="text-sm text-muted">{new Date(p.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelected(p)} title="Ver detalhes">👁️</button>
                        {p.status === 'pronto' && !p.entregadorId && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => { setCriarEntregaModal(p); setCriarEntregadorId('') }}
                            title="Criar Entrega"
                          >🚚</button>
                        )}
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(p)} title="Excluir">🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {pedidos.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 32 }}>Nenhum pedido encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exibindo {pedidos.length} pedido(s)</span>
        </div>
      </div>

      {/* Modal detalhe */}
      {selected && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">📋 Pedido #{selected.id}</span>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-section-title">Informações</div>
                <div className="detail-row">
                  <span className="detail-label">Cliente</span>
                  <span className="detail-value">{state.clientes.find(c => c.id === selected.clienteId)?.nome || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Endereco</span>
                  <span className="detail-value">{selected.enderecoEntrega}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Entregador</span>
                  <span className="detail-value">{state.entregadores.find(e => e.id === selected.entregadorId)?.nome || 'Nao atribuido'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Data</span>
                  <span className="detail-value">{new Date(selected.createdAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">Itens do Pedido</div>
                {selected.items.map((item, i) => (
                  <div key={i} className="detail-row">
                    <span className="detail-label">{item.emoji} {item.nome} x{item.quantidade}</span>
                    <span className="detail-value">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                <div className="detail-row">
                  <span className="detail-label">Taxa de entrega</span>
                  <span className="detail-value">R$ {selected.taxaEntrega?.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total</span>
                  <span className="detail-value font-bold text-primary">R$ {selected.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">Alterar Status</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {STATUS_OPTS.map(s => (
                    <button
                      key={s}
                      className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => updateStatus(selected.id, s)}
                    >
                      {STATUS_MAP[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {selected.status === 'pronto' && !selected.entregadorId && (
                <div className="detail-section">
                  <div className="detail-section-title">Entrega</div>
                  <p className="text-sm text-muted mb-2">Este pedido esta pronto e aguarda atribuicao de entregador.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { setSelected(null); setCriarEntregaModal(selected); setCriarEntregadorId('') }}
                  >
                    🚚 Criar Entrega para este Pedido
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: 8 }}
                    onClick={() => navigate('/admin/entregas')}
                  >
                    Ver tela de Entregas
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setConfirmDelete(selected); setSelected(null) }}>🗑️ Excluir</button>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal criar entrega */}
      {criarEntregaModal && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setCriarEntregaModal(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">🚚 Criar Entrega</span>
              <button className="modal-close" onClick={() => setCriarEntregaModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-3">
                Pedido #{criarEntregaModal.id} &mdash; {state.clientes.find(c => c.id === criarEntregaModal.clienteId)?.nome}
              </p>
              <div className="form-group">
                <label className="form-label req">Entregador</label>
                <select className="form-control" value={criarEntregadorId} onChange={e => setCriarEntregadorId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {entregadoresAtivos.map(e => {
                    const v = validarCriacaoEntrega(e.id, state.entregas)
                    return (
                      <option key={e.id} value={e.id} disabled={!v.valido}>
                        {e.nome} ({e.status === 'disponivel' ? 'disponivel' : e.status === 'em_entrega' ? 'em entrega' : e.status}){!v.valido ? ' – jornada maxima' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
              {criarEntregadorId && (() => {
                const v = validarCriacaoEntrega(Number(criarEntregadorId), state.entregas)
                if (!v.valido) return <p className="text-xs text-danger mt-2">{v.motivo}</p>
                if (v.horas > 0) return <p className="text-xs text-muted mt-2">Jornada atual: {v.horas.toFixed(1)}h de 8h</p>
                return null
              })()}
              <p className="text-xs text-muted mt-3">
                Para agrupar varios pedidos em uma entrega, use a{' '}
                <span
                  style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setCriarEntregaModal(null); navigate('/admin/entregas') }}
                >
                  tela de Entregas
                </span>.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCriarEntregaModal(null)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={criarEntrega}
                disabled={!criarEntregadorId || !validarCriacaoEntrega(Number(criarEntregadorId), state.entregas).valido}
              >
                🚚 Criar Entrega
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusao */}
      {confirmDelete && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">🗑️ Confirmar Exclusao</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Deseja excluir o <strong>Pedido #{confirmDelete.id}</strong>? Esta acao nao pode ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => deletePedido(confirmDelete.id)}>🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
