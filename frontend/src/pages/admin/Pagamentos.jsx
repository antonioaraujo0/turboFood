import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

const METODO_MAP = { cartao_credito: '💳 Crédito', cartao_debito: '💳 Débito', pix: '📱 Pix', dinheiro: '💵 Dinheiro' }
const STATUS_CLS = { pendente: 'badge-warning', aprovado: 'badge-success', recusado: 'badge-danger' }
const STATUS_LABEL = { pendente: '⏳ Pendente', aprovado: '✅ Aprovado', recusado: '❌ Recusado' }

export default function Pagamentos() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  function updateStatus(id, status) {
    dispatch({ type: 'UPDATE_PAGAMENTO_STATUS', payload: { id, status } })
    toast(status === 'aprovado' ? 'Pagamento aprovado!' : status === 'recusado' ? 'Pagamento recusado' : 'Status atualizado', status === 'aprovado' ? 'success' : status === 'recusado' ? 'danger' : 'info')
  }

  const pagamentos = state.pagamentos.filter(p => {
    const pedido = state.pedidos.find(o => o.id === p.pedidoId)
    const cliente = state.clientes.find(c => c.id === pedido?.clienteId)
    const matchSearch = !search ||
      String(p.pedidoId).includes(search) ||
      (cliente?.nome.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalAprovado = pagamentos.filter(p => p.status === 'aprovado').reduce((s, p) => s + p.valor, 0)
  const totalPendente = pagamentos.filter(p => p.status === 'pendente').reduce((s, p) => s + p.valor, 0)

  return (
    <AdminLayout title="💳 Pagamentos" subtitle="Gerencie os pagamentos e aprovações">
      <div className="stats-grid stats-grid-3 mb-4">
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value">R$ {totalAprovado.toFixed(2)}</div>
            <div className="stat-label">Valor Aprovado</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div>
            <div className="stat-value">R$ {totalPendente.toFixed(2)}</div>
            <div className="stat-label">Valor Pendente</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div>
            <div className="stat-value">{state.pagamentos.filter(p => p.status === 'recusado').length}</div>
            <div className="stat-label">Recusados</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por pedido ou cliente..." />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="recusado">Recusado</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Método</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map(p => {
                const pedido = state.pedidos.find(o => o.id === p.pedidoId)
                const cliente = state.clientes.find(c => c.id === pedido?.clienteId)
                return (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.id}</td>
                    <td>
                      <span className="badge badge-gray">Pedido #{p.pedidoId}</span>
                    </td>
                    <td>{cliente?.nome || 'N/A'}</td>
                    <td className="font-semibold">R$ {p.valor.toFixed(2)}</td>
                    <td>{METODO_MAP[p.metodo] || p.metodo}</td>
                    <td>
                      <span className={`badge ${STATUS_CLS[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {p.status === 'pendente' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => updateStatus(p.id, 'aprovado')}>
                              ✅ Aprovar
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => updateStatus(p.id, 'recusado')}>
                              ❌ Recusar
                            </button>
                          </>
                        )}
                        {p.status === 'aprovado' && (
                          <button className="btn btn-sm btn-danger" onClick={() => updateStatus(p.id, 'recusado')}>
                            ❌ Estornar
                          </button>
                        )}
                        {p.status === 'recusado' && (
                          <button className="btn btn-sm btn-success" onClick={() => updateStatus(p.id, 'aprovado')}>
                            ✅ Reverter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {pagamentos.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 32 }}>Nenhum pagamento encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
