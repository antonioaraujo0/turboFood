import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { calcularHorasConsecutivas, formatHoras, getAlertLevel, MAX_HORAS_CONSECUTIVAS } from '../../utils/entregaRules'

export default function EntregadorPainel() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [page, setPage] = useState('painel')

  const entregadorId = state.currentUser?.entregadorId
  const entregador = state.entregadores.find(e => e.id === entregadorId)
  const veiculo = entregador ? state.veiculos.find(v => v.id === entregador.veiculoId) : null

  const minhasEntregas = state.entregas.filter(e =>
    e.entregadorId === entregadorId && ['pendente', 'em_andamento'].includes(e.status)
  )
  const entregasFeitas = state.entregas.filter(e =>
    e.entregadorId === entregadorId && e.status === 'entregue'
  )

  const horasConsecutivas = calcularHorasConsecutivas(entregadorId, state.entregas)
  const alertLevel = getAlertLevel(horasConsecutivas)

  const minhasAvaliacoes = state.avaliacoes.filter(a => a.entregadorId === entregadorId)
  const mediaAvaliacao = minhasAvaliacoes.length
    ? (minhasAvaliacoes.reduce((s, a) => s + (a.notaEntrega ?? a.nota ?? 0), 0) / minhasAvaliacoes.length).toFixed(1)
    : null
  const totalEntregas = entregasFeitas.length
  const baixaAvaliacao = mediaAvaliacao !== null && Number(mediaAvaliacao) < 2.0 && totalEntregas >= 50

  function toggleStatus() {
    if (!entregador) return
    const newStatus = entregador.status === 'disponivel' ? 'inativo' : 'disponivel'
    dispatch({ type: 'UPDATE_ENTREGADOR', payload: { ...entregador, status: newStatus } })
  }

  function iniciarEntrega(entregaId) {
    dispatch({ type: 'UPDATE_ENTREGA_STATUS', payload: { id: entregaId, status: 'em_andamento' } })
  }

  function confirmarEntrega(entregaId) {
    dispatch({ type: 'UPDATE_ENTREGA_STATUS', payload: { id: entregaId, status: 'entregue', dataFim: new Date().toISOString() } })
  }

  function logout() {
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const initials = entregador?.nome.split(' ').map(w => w[0]).slice(0, 2).join('') || 'EN'
  const isDisponivel = entregador?.status === 'disponivel'

  const navLinks = [
    { id: 'painel', icon: '🏠', label: 'Painel' },
    { id: 'ativas', icon: '🛵', label: 'Em Andamento', badge: minhasEntregas.length },
    { id: 'historico', icon: '📋', label: 'Historico' },
  ]

  function EntregaCard({ entrega, compact = false }) {
    const pedidos = (entrega.pedidoIds || [])
      .map(pid => state.pedidos.find(p => p.id === pid))
      .filter(Boolean)
    const totalValor = pedidos.reduce((s, p) => s + p.total, 0)

    return (
      <div className={`delivery-card ${entrega.status === 'em_andamento' ? 'active' : ''}`}>
        <div className="delivery-card-header">
          <div>
            <div className="font-bold">Entrega #{entrega.id} &mdash; {pedidos.length} pedido(s)</div>
            <div className="text-xs text-muted">{pedidos.map(p => `#${p.id}`).join(', ')}</div>
          </div>
          <span className={`badge ${entrega.status === 'em_andamento' ? 'badge-info' : entrega.status === 'entregue' ? 'badge-success' : 'badge-warning'}`}>
            {entrega.status === 'em_andamento' ? 'A caminho' : entrega.status === 'entregue' ? 'Entregue' : 'Aguardando inicio'}
          </span>
        </div>
        {!compact && pedidos.map((pedido, idx) => {
          const cliente = state.clientes.find(c => c.id === pedido.clienteId)
          return (
            <div key={pedido.id} style={{ borderTop: idx === 0 ? '1px solid var(--border)' : '1px dashed var(--border)', paddingTop: 8, marginTop: 8 }}>
              <div className="text-sm font-semibold">Pedido #{pedido.id} &mdash; {cliente?.nome}</div>
              <div className="delivery-address" style={{ marginTop: 4 }}>
                <span>Endereco:</span>
                <span>{pedido.enderecoEntrega}</span>
              </div>
              <div className="delivery-items-list text-xs">
                {pedido.items.map(i => `${i.emoji} ${i.nome} x${i.quantidade}`).join(' · ')}
              </div>
              {pedido.observacoes && (
                <div className="text-xs" style={{ color: 'var(--warning)', marginTop: 4 }}>💬 {pedido.observacoes}</div>
              )}
            </div>
          )
        })}
        {entrega.observacao && (
          <div className="text-xs text-muted mt-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 6 }}>
            Obs: {entrega.observacao}
          </div>
        )}
        {!compact && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {entrega.status === 'pendente' && (
              <button className="btn btn-primary btn-sm" onClick={() => iniciarEntrega(entrega.id)}>
                Iniciar Entrega
              </button>
            )}
            {entrega.status === 'em_andamento' && (
              <button className="btn btn-success btn-sm" onClick={() => confirmarEntrega(entrega.id)}>
                ✅ Confirmar Todos Entregues
              </button>
            )}
            <div style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--primary)', alignSelf: 'center' }}>
              R$ {totalValor.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="del-layout">
      <aside className="del-sidebar">
        <div className="del-sidebar-logo">
          <div className="del-sidebar-logo-icon">⚡</div>
          <div>
            <div className="del-sidebar-logo-name">TurboFood</div>
            <div className="del-sidebar-logo-sub">Entregador</div>
          </div>
        </div>
        <nav className="del-nav">
          {navLinks.map(l => (
            <button key={l.id} className={`del-nav-link${page === l.id ? ' active' : ''}`} onClick={() => setPage(l.id)}>
              <span>{l.icon}</span>
              {l.label}
              {l.badge > 0 && <span className="del-nav-badge">{l.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="del-sidebar-footer">
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,107,53,0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entregador?.nome}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Entregador</div>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }} onClick={logout} title="Sair">🚪</button>
        </div>
      </aside>

      <div className="del-main">
        <div className="del-topbar">
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>
              {page === 'painel' ? '🏠 Painel' : page === 'ativas' ? '🛵 Em Andamento' : '📋 Historico'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {horasConsecutivas > 0 && (
              <span className={`badge ${alertLevel === 'danger' ? 'badge-danger' : alertLevel === 'warning' ? 'badge-warning' : 'badge-success'}`}>
                ⏱️ {formatHoras(horasConsecutivas)}
              </span>
            )}
            <span className={`badge ${isDisponivel ? 'badge-success' : entregador?.status === 'em_entrega' ? 'badge-info' : 'badge-warning'}`}>
              {isDisponivel ? 'Disponivel' : entregador?.status === 'em_entrega' ? 'Em Entrega' : 'Indisponivel'}
            </span>
          </div>
        </div>

        <div className="del-content">
          {baixaAvaliacao && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', color: '#dc2626', marginBottom: 16, fontSize: '0.85rem' }}>
              ⚠️ Sua avaliacao esta abaixo de 2.0 ({mediaAvaliacao}) com {totalEntregas}+ entregas. Risco de desligamento.
            </div>
          )}
          {alertLevel === 'danger' && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', color: '#dc2626', marginBottom: 16, fontSize: '0.85rem' }}>
              ⛔ Jornada maxima atingida! {formatHoras(horasConsecutivas)} de trabalho consecutivo (limite {MAX_HORAS_CONSECUTIVAS}h).
            </div>
          )}
          {alertLevel === 'warning' && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '12px 16px', color: '#d97706', marginBottom: 16, fontSize: '0.85rem' }}>
              ⚠️ {formatHoras(horasConsecutivas)} de jornada. Limite e {MAX_HORAS_CONSECUTIVAS}h.
            </div>
          )}

          {page === 'painel' && (
            <>
              <div className="card card-body mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,107,53,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-bold" style={{ fontSize: '1.05rem' }}>{entregador?.nome}</div>
                    <div className="text-sm text-muted">{entregador?.telefone} · {entregador?.email}</div>
                    {veiculo && <div className="text-xs text-muted">Veiculo: {veiculo.modelo} ({veiculo.placa})</div>}
                    {mediaAvaliacao && <div className="text-xs mt-1">⭐ Avaliacao media: <strong>{mediaAvaliacao}</strong>/5 ({minhasAvaliacoes.length} avaliacoes)</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className={`badge ${isDisponivel ? 'badge-success' : entregador?.status === 'em_entrega' ? 'badge-info' : 'badge-warning'}`}>
                      {isDisponivel ? 'Disponivel' : entregador?.status === 'em_entrega' ? 'Em Entrega' : 'Indisponivel'}
                    </span>
                    {entregador?.status !== 'em_entrega' && (
                      <button className={`btn btn-sm ${isDisponivel ? 'btn-secondary' : 'btn-success'}`} onClick={toggleStatus}>
                        {isDisponivel ? 'Ficar Indisponivel' : 'Ficar Disponivel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="stats-grid stats-grid-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon green">✅</div>
                  <div><div className="stat-value">{entregasFeitas.length}</div><div className="stat-label">Rotas Concluidas</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue">🛵</div>
                  <div><div className="stat-value">{minhasEntregas.length}</div><div className="stat-label">Em Andamento</div></div>
                </div>
                <div className="stat-card">
                  <div className={`stat-icon ${alertLevel === 'danger' ? 'red' : alertLevel === 'warning' ? 'yellow' : 'green'}`}>⏱️</div>
                  <div><div className="stat-value">{horasConsecutivas > 0 ? formatHoras(horasConsecutivas) : '0h'}</div><div className="stat-label">Jornada Atual</div></div>
                </div>
              </div>

              <h3 className="font-bold mb-3" style={{ fontSize: '0.95rem' }}>Entregas Ativas</h3>
              {minhasEntregas.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <span className="empty-state-icon">📦</span>
                  <div className="empty-state-title">Nenhuma entrega ativa</div>
                  <div className="empty-state-desc">O admin atribuira entregas em breve.</div>
                </div>
              ) : (
                minhasEntregas.map(e => <EntregaCard key={e.id} entrega={e} />)
              )}
            </>
          )}

          {page === 'ativas' && (
            <>
              <p className="text-sm text-muted mb-3">Gerencie suas entregas em andamento.</p>
              {minhasEntregas.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <span className="empty-state-icon">🛵</span>
                  <div className="empty-state-title">Nenhuma entrega ativa</div>
                </div>
              ) : (
                minhasEntregas.map(e => <EntregaCard key={e.id} entrega={e} />)
              )}
            </>
          )}

          {page === 'historico' && (
            <>
              <p className="text-sm text-muted mb-3">Todas as suas entregas concluidas e canceladas.</p>
              <div className="card">
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Entrega</th>
                        <th>Pedidos</th>
                        <th>Inicio</th>
                        <th>Fim</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.entregas.filter(e => e.entregadorId === entregadorId && !['pendente', 'em_andamento'].includes(e.status)).length === 0 && (
                        <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 32 }}>Nenhuma entrega no historico</td></tr>
                      )}
                      {state.entregas
                        .filter(e => e.entregadorId === entregadorId && !['pendente', 'em_andamento'].includes(e.status))
                        .sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio))
                        .map(entrega => (
                          <tr key={entrega.id}>
                            <td className="font-semibold">#{entrega.id}</td>
                            <td>
                              {(entrega.pedidoIds || []).map(pid => `#${pid}`).join(', ')}
                              <span className="badge badge-info" style={{ marginLeft: 6 }}>{(entrega.pedidoIds || []).length} ped.</span>
                            </td>
                            <td className="text-sm text-muted">{new Date(entrega.dataInicio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="text-sm text-muted">{entrega.dataFim ? new Date(entrega.dataFim).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td>
                              <span className={`badge ${entrega.status === 'entregue' ? 'badge-success' : 'badge-danger'}`}>
                                {entrega.status === 'entregue' ? '✅ Entregue' : 'Cancelada'}
                              </span>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
