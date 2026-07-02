import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

export default function Avaliacoes() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterNota, setFilterNota] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const avaliacoes = state.avaliacoes.filter(a => {
    const cliente = state.clientes.find(c => c.id === a.clienteId)
    const matchSearch = !search ||
      (cliente?.nome.toLowerCase().includes(search.toLowerCase())) ||
      (a.comentario || '').toLowerCase().includes(search.toLowerCase())
    const notaMedia = ((a.notaComida || a.nota || 0) + (a.notaEntrega || a.nota || 0)) / (a.notaEntrega !== undefined ? 2 : 1)
    const matchNota = !filterNota || Math.round(notaMedia) === Number(filterNota)
    return matchSearch && matchNota
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function deleteAvaliacao(id) {
    dispatch({ type: 'DELETE_AVALIACAO', payload: id })
    toast('Avaliacao excluida', 'danger')
    setConfirmDelete(null)
  }

  function getMedia(a) {
    if (a.notaComida !== undefined && a.notaEntrega !== undefined) {
      return ((a.notaComida + a.notaEntrega) / 2).toFixed(1)
    }
    return (a.nota || 0).toFixed(1)
  }

  const mediaComida = avaliacoes.filter(a => a.notaComida !== undefined).length
    ? (avaliacoes.filter(a => a.notaComida !== undefined).reduce((s, a) => s + a.notaComida, 0) / avaliacoes.filter(a => a.notaComida !== undefined).length).toFixed(1)
    : '—'

  const mediaEntrega = avaliacoes.filter(a => a.notaEntrega !== undefined).length
    ? (avaliacoes.filter(a => a.notaEntrega !== undefined).reduce((s, a) => s + a.notaEntrega, 0) / avaliacoes.filter(a => a.notaEntrega !== undefined).length).toFixed(1)
    : '—'

  function stars(n) {
    const nota = Math.round(n || 0)
    return '⭐'.repeat(nota) + '☆'.repeat(Math.max(0, 5 - nota))
  }

  return (
    <AdminLayout title="Avaliacoes" subtitle="Acompanhe as avaliacoes dos clientes">
      <div className="stats-grid stats-grid-4 mb-4">
        <div className="stat-card"><div className="stat-icon yellow">⭐</div><div><div className="stat-value">{avaliacoes.length}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-icon green">🍕</div><div><div className="stat-value">{mediaComida}</div><div className="stat-label">Media Comida</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🛵</div><div><div className="stat-value">{mediaEntrega}</div><div className="stat-label">Media Entrega</div></div></div>
        <div className="stat-card"><div className="stat-icon red">😞</div><div><div className="stat-value">{avaliacoes.filter(a => (a.notaComida || a.nota || 5) <= 2).length}</div><div className="stat-label">Negativas (1-2)</div></div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente ou comentario..." />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterNota} onChange={e => setFilterNota(e.target.value)}>
            <option value="">Todas as notas</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Pedido</th>
                <th>Comida</th>
                <th>Entrega</th>
                <th>Comentario</th>
                <th>Data</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.map(a => {
                const cliente = state.clientes.find(c => c.id === a.clienteId)
                const entregador = a.entregadorId ? state.entregadores.find(e => e.id === a.entregadorId) : null
                const notaComida = a.notaComida ?? a.nota ?? 0
                const notaEntrega = a.notaEntrega ?? a.nota ?? 0
                const cls = n => n >= 4 ? 'badge-success' : n === 3 ? 'badge-warning' : 'badge-danger'
                const initials = cliente?.nome.split(' ').map(w => w[0]).slice(0, 2).join('') || '?'
                return (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-blue">{initials}</div>
                        <div>
                          <div className="font-semibold">{cliente?.nome || 'N/A'}</div>
                          <div className="text-xs text-muted">{cliente?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><span className="badge badge-gray">Pedido #{a.pedidoId}</span></div>
                      {entregador && <div className="text-xs text-muted mt-1">{entregador.nome}</div>}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className={`badge ${cls(notaComida)}`}>{notaComida}/5</span>
                        <span style={{ fontSize: '0.7rem' }}>{stars(notaComida)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className={`badge ${cls(notaEntrega)}`}>{notaEntrega}/5</span>
                        <span style={{ fontSize: '0.7rem' }}>{stars(notaEntrega)}</span>
                      </div>
                    </td>
                    <td className="text-sm" style={{ maxWidth: 240 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.comentario || <span className="text-muted">Sem comentario</span>}
                      </div>
                    </td>
                    <td className="text-sm text-muted">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(a)}>🗑️</button>
                    </td>
                  </tr>
                )
              })}
              {avaliacoes.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 32 }}>Nenhuma avaliacao encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">Excluir Avaliacao</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Excluir a avaliacao <strong>#{confirmDelete.id}</strong> do cliente <strong>{state.clientes.find(c => c.id === confirmDelete.clienteId)?.nome}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => deleteAvaliacao(confirmDelete.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
