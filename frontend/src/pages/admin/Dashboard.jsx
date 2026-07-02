import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const STATUS_MAP = {
  aguardando: { label: 'Aguardando', cls: 'badge-warning' },
  confirmado: { label: 'Confirmado', cls: 'badge-info' },
  preparando: { label: 'Preparando', cls: 'badge-purple' },
  pronto: { label: 'Pronto', cls: 'badge-orange' },
  entregando: { label: 'Entregando', cls: 'badge-info' },
  entregue: { label: 'Entregue', cls: 'badge-success' },
  cancelado: { label: 'Cancelado', cls: 'badge-danger' },
}

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const { pedidos, clientes, entregadores, entregas, pagamentos } = state

  const totalPedidos = pedidos.length
  const pedidosHoje = pedidos.filter(p => p.createdAt?.startsWith('2026-06-25')).length
  const receita = pagamentos.filter(p => p.status === 'aprovado').reduce((s, p) => s + p.valor, 0)
  const disponiveis = entregadores.filter(e => e.status === 'disponivel').length
  const recentes = [...pedidos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <AdminLayout title="🏠 Dashboard" subtitle="Visão geral do sistema">
      <div className="stats-grid stats-grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-icon orange">📋</div>
          <div>
            <div className="stat-value">{pedidosHoje}</div>
            <div className="stat-label">Pedidos Hoje</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div>
            <div className="stat-value">R$ {receita.toFixed(0)}</div>
            <div className="stat-label">Receita Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <div className="stat-value">{clientes.length}</div>
            <div className="stat-label">Clientes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">🛵</div>
          <div>
            <div className="stat-value">{disponiveis}</div>
            <div className="stat-label">Entregadores Livres</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div className="card">
          <div className="card-header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>📋 Pedidos Recentes</strong>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/admin/pedidos')}>Ver todos →</button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map(p => {
                  const cliente = state.clientes.find(c => c.id === p.clienteId)
                  const s = STATUS_MAP[p.status] || { label: p.status, cls: 'badge-gray' }
                  return (
                    <tr key={p.id}>
                      <td className="font-semibold">#{p.id}</td>
                      <td>{cliente?.nome || 'N/A'}</td>
                      <td className="font-semibold">R$ {p.total.toFixed(2)}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td className="text-sm text-muted">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  )
                })}
                {recentes.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 24 }}>Nenhum pedido encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>🛵 Entregadores Ativos</strong>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/admin/entregadores')}>Ver todos →</button>
          </div>
          <div style={{ padding: 16 }}>
            {entregadores.filter(e => e.status !== 'inativo').map(e => {
              const cls = e.status === 'disponivel' ? 'badge-success' : e.status === 'em_entrega' ? 'badge-info' : 'badge-warning'
              const label = e.status === 'disponivel' ? '✓ Disponível' : e.status === 'em_entrega' ? '🛵 Em Entrega' : '⏸ Inativo'
              const initials = e.nome.split(' ').map(w => w[0]).slice(0, 2).join('')
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="avatar avatar-orange">{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold text-sm">{e.nome}</div>
                    <div className="text-xs text-muted">{e.telefone}</div>
                  </div>
                  <span className={`badge ${cls}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 20 }}>
        {[
          { label: 'Total de Pedidos', value: totalPedidos, icon: '📋', onClick: () => navigate('/admin/pedidos') },
          { label: 'Entregas Concluídas', value: entregas.filter(e => e.status === 'entregue').length, icon: '✅', onClick: () => navigate('/admin/relatorios') },
          { label: 'Avaliações', value: state.avaliacoes.length, icon: '⭐', onClick: () => navigate('/admin/avaliacoes') },
        ].map(item => (
          <div key={item.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={item.onClick}>
            <div className="stat-icon orange">{item.icon}</div>
            <div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
