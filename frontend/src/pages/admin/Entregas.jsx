import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import {
  MAX_PEDIDOS_POR_ENTREGA,
  MAX_HORAS_CONSECUTIVAS,
  ALERTA_HORAS,
  calcularHorasConsecutivas,
  validarCriacaoEntrega,
  formatHoras,
  getAlertLevel,
} from '../../utils/entregaRules'

const STATUS_CLS = {
  pendente: 'badge-warning',
  em_andamento: 'badge-info',
  entregue: 'badge-success',
  cancelada: 'badge-danger',
}
const STATUS_LABEL = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
}

function minutesDiff(start, end) {
  if (!start) return null
  return Math.round((new Date(end || Date.now()) - new Date(start)) / 60000)
}

export default function Entregas() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [modalCreate, setModalCreate] = useState(false)
  const [modalDetail, setModalDetail] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Formulario nova entrega
  const [selectedEntregadorId, setSelectedEntregadorId] = useState('')
  const [selectedPedidoIds, setSelectedPedidoIds] = useState([])
  const [observacao, setObservacao] = useState('')

  // Pedidos prontos sem entregador
  const pedidosProntos = state.pedidos.filter(p => p.status === 'pronto' && !p.entregadorId)

  const entregas = state.entregas.filter(e => {
    const entregador = state.entregadores.find(en => en.id === e.entregadorId)
    const matchSearch = !search ||
      String(e.id).includes(search) ||
      (entregador?.nome.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !filterStatus || e.status === filterStatus
    return matchSearch && matchStatus
  }).sort((a, b) => new Date(b.dataInicio || 0) - new Date(a.dataInicio || 0))

  // Validacoes de negocio para entregador selecionado
  const validacao = selectedEntregadorId
    ? validarCriacaoEntrega(Number(selectedEntregadorId), state.entregas)
    : null

  const horasEntregador = selectedEntregadorId
    ? calcularHorasConsecutivas(Number(selectedEntregadorId), state.entregas)
    : 0

  const alertLevel = getAlertLevel(horasEntregador)

  function togglePedido(pedidoId) {
    setSelectedPedidoIds(prev =>
      prev.includes(pedidoId)
        ? prev.filter(id => id !== pedidoId)
        : prev.length < MAX_PEDIDOS_POR_ENTREGA
          ? [...prev, pedidoId]
          : prev
    )
  }

  function criarEntrega() {
    if (!selectedEntregadorId || selectedPedidoIds.length === 0) return
    if (!validacao?.valido) return

    dispatch({
      type: 'ADD_ENTREGA',
      payload: {
        id: Date.now(),
        entregadorId: Number(selectedEntregadorId),
        pedidoIds: selectedPedidoIds,
        status: 'em_andamento',
        dataInicio: new Date().toISOString(),
        dataFim: null,
        observacao,
      }
    })
    toast('Entrega criada!')
    setModalCreate(false)
    setSelectedEntregadorId('')
    setSelectedPedidoIds([])
    setObservacao('')
  }

  function confirmarEntrega(entrega) {
    dispatch({
      type: 'UPDATE_ENTREGA_STATUS',
      payload: { id: entrega.id, status: 'entregue', dataFim: new Date().toISOString() }
    })
    toast('Entrega confirmada!')
    setModalDetail(prev => prev ? { ...prev, status: 'entregue', dataFim: new Date().toISOString() } : null)
  }

  function cancelarEntrega(entrega) {
    dispatch({ type: 'UPDATE_ENTREGA_STATUS', payload: { id: entrega.id, status: 'cancelada' } })
    toast('Entrega cancelada', 'danger')
    setModalDetail(null)
  }

  function deleteEntrega(id) {
    dispatch({ type: 'DELETE_ENTREGA', payload: id })
    toast('Entrega excluída', 'danger')
    setConfirmDelete(null)
    setModalDetail(null)
  }

  function adicionarPedidoEntrega(entregaId, pedidoId) {
    dispatch({ type: 'ADD_PEDIDO_TO_ENTREGA', payload: { entregaId, pedidoId } })
    setModalDetail(prev => prev ? { ...prev, pedidoIds: [...prev.pedidoIds, pedidoId] } : null)
  }

  function removerPedidoEntrega(entregaId, pedidoId) {
    dispatch({ type: 'REMOVE_PEDIDO_FROM_ENTREGA', payload: { entregaId, pedidoId } })
    setModalDetail(prev => prev ? { ...prev, pedidoIds: prev.pedidoIds.filter(id => id !== pedidoId) } : null)
  }

  const totalEntregas = state.entregas.length
  const emAndamento = state.entregas.filter(e => e.status === 'em_andamento').length
  const concluidas = state.entregas.filter(e => e.status === 'entregue').length

  // Entregadores com violacao de 8h
  const violacoes8h = state.entregadores.filter(en => {
    const h = calcularHorasConsecutivas(en.id, state.entregas)
    return h >= MAX_HORAS_CONSECUTIVAS
  })

  // Pedidos prontos aguardando entrega
  const aguardandoEntrega = state.pedidos.filter(p => p.status === 'pronto' && !p.entregadorId).length

  return (
    <AdminLayout title="🚚 Entregas" subtitle="Gestao e atribuicao de entregas - Max 5 pedidos / 8h consecutivas">

      {/* Alerta de violacoes */}
      {violacoes8h.length > 0 && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#991b1b' }}>
              Violacao de Regra de Negocio: {violacoes8h.length} entregador(es) com 8h+ consecutivas
            </div>
            <div className="text-xs" style={{ color: '#b91c1c' }}>
              {violacoes8h.map(e => e.nome).join(', ')} — necessario descanso antes de nova atribuicao
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid stats-grid-4 mb-4">
        <div className="stat-card"><div className="stat-icon orange">🚚</div><div><div className="stat-value">{totalEntregas}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🛵</div><div><div className="stat-value">{emAndamento}</div><div className="stat-label">Em Andamento</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div><div className="stat-value">{concluidas}</div><div className="stat-label">Concluidas</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">📦</div><div><div className="stat-value">{aguardandoEntrega}</div><div className="stat-label">Aguardando Atribuicao</div></div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por ID ou entregador..." />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="entregue">Entregue</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button
            className="btn btn-primary"
            onClick={() => { setModalCreate(true); setSelectedEntregadorId(''); setSelectedPedidoIds([]); setObservacao('') }}
            disabled={pedidosProntos.length === 0}
            title={pedidosProntos.length === 0 ? 'Sem pedidos prontos para entrega' : 'Criar nova entrega'}
          >
            + Nova Entrega
          </button>
        </div>
      </div>

      {pedidosProntos.length > 0 && (
        <div style={{ background: 'var(--info-light)', border: '1px solid #93c5fd', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: '0.875rem', color: '#1e40af' }}>
          📦 <strong>{pedidosProntos.length} pedido(s) prontos</strong> aguardando atribuicao de entrega.
          <button className="btn btn-sm btn-primary" style={{ marginLeft: 12 }} onClick={() => { setModalCreate(true); setSelectedEntregadorId(''); setSelectedPedidoIds(pedidosProntos.slice(0, MAX_PEDIDOS_POR_ENTREGA).map(p => p.id)); setObservacao('') }}>
            Atribuir todos
          </button>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Entregador</th>
                <th>Pedidos</th>
                <th>Status</th>
                <th>Inicio</th>
                <th>Duracao</th>
                <th>Regra 8h</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {entregas.map(entrega => {
                const entregador = state.entregadores.find(e => e.id === entrega.entregadorId)
                const mins = minutesDiff(entrega.dataInicio, entrega.dataFim)
                const horas = calcularHorasConsecutivas(entrega.entregadorId, state.entregas)
                const nivel = getAlertLevel(horas)
                const inicioCls = entregador?.nome.split(' ').map(w => w[0]).slice(0, 2).join('') || '??'
                return (
                  <tr key={entrega.id}>
                    <td className="font-semibold">#{entrega.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-orange">{inicioCls}</div>
                        <div>
                          <div className="font-semibold text-sm">{entregador?.nome || 'N/A'}</div>
                          <div className="text-xs text-muted">{entregador?.telefone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{entrega.pedidoIds.length} pedido(s)</span>
                      {entrega.pedidoIds.length >= MAX_PEDIDOS_POR_ENTREGA && (
                        <span className="badge badge-warning" style={{ marginLeft: 4 }}>MAX</span>
                      )}
                    </td>
                    <td><span className={`badge ${STATUS_CLS[entrega.status]}`}>{STATUS_LABEL[entrega.status]}</span></td>
                    <td className="text-sm text-muted">
                      {entrega.dataInicio ? new Date(entrega.dataInicio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="text-sm">
                      {mins !== null ? `${mins} min` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${nivel === 'danger' ? 'badge-danger' : nivel === 'warning' ? 'badge-warning' : 'badge-success'}`}>
                        {formatHoras(horas)}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setModalDetail({ ...entrega })} title="Ver detalhes">👁️</button>
                        {entrega.status === 'em_andamento' && (
                          <button className="btn btn-sm btn-success" onClick={() => confirmarEntrega(entrega)} title="Confirmar entrega">✅</button>
                        )}
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(entrega)} title="Excluir">🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {entregas.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 32 }}>Nenhuma entrega encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL: NOVA ENTREGA ===== */}
      {modalCreate && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModalCreate(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">🚚 Nova Entrega</span>
              <button className="modal-close" onClick={() => setModalCreate(false)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Regras de negocio info */}
              <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                📋 <strong>Regras:</strong> Maximo de {MAX_PEDIDOS_POR_ENTREGA} pedidos por entrega &bull; Entregador nao pode ultrapassar {MAX_HORAS_CONSECUTIVAS}h consecutivas
              </div>

              {/* 1. Selecionar entregador */}
              <div className="form-group mb-4">
                <label className="form-label req">1. Selecionar Entregador</label>
                <select
                  className="form-control"
                  value={selectedEntregadorId}
                  onChange={e => { setSelectedEntregadorId(e.target.value); setSelectedPedidoIds([]) }}
                >
                  <option value="">Selecione o entregador...</option>
                  {state.entregadores.filter(e => e.status !== 'em_entrega').map(e => {
                    const h = calcularHorasConsecutivas(e.id, state.entregas)
                    const nivel = getAlertLevel(h)
                    const bloqueado = nivel === 'danger'
                    return (
                      <option key={e.id} value={e.id} disabled={bloqueado}>
                        {e.nome} — {formatHoras(h)} {bloqueado ? '[BLOQUEADO 8h]' : nivel === 'warning' ? '[ATENCAO]' : '[OK]'} {e.status === 'inativo' ? '[Inativo]' : ''}
                      </option>
                    )
                  })}
                </select>

                {selectedEntregadorId && (
                  <div style={{ marginTop: 8 }}>
                    {alertLevel === 'danger' && (
                      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem', color: '#991b1b' }}>
                        🚫 <strong>Bloqueado:</strong> Este entregador ja trabalhou {formatHoras(horasEntregador)} consecutivas. Necessario descanso de pelo menos 30 minutos.
                      </div>
                    )}
                    {alertLevel === 'warning' && (
                      <div style={{ background: 'var(--warning-light)', border: '1px solid #fcd34d', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem', color: '#92400e' }}>
                        ⚠️ <strong>Atencao:</strong> Este entregador ja trabalhou {formatHoras(horasEntregador)} (proximo do limite de 8h).
                      </div>
                    )}
                    {alertLevel === 'ok' && (
                      <div style={{ background: 'var(--success-light)', border: '1px solid #6ee7b7', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem', color: '#065f46' }}>
                        ✅ Entregador disponivel — {formatHoras(horasEntregador)} de jornada acumulada.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Selecionar pedidos */}
              <div className="form-group mb-4">
                <label className="form-label req">
                  2. Selecionar Pedidos ({selectedPedidoIds.length}/{MAX_PEDIDOS_POR_ENTREGA})
                </label>
                {pedidosProntos.length === 0 && (
                  <div className="empty-state" style={{ padding: 16 }}>
                    <div className="text-sm text-muted">Nenhum pedido com status "Pronto" disponivel para atribuicao.</div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', marginTop: 8 }}>
                  {pedidosProntos.map(p => {
                    const cliente = state.clientes.find(c => c.id === p.clienteId)
                    const selecionado = selectedPedidoIds.includes(p.id)
                    const maxAtingido = !selecionado && selectedPedidoIds.length >= MAX_PEDIDOS_POR_ENTREGA
                    return (
                      <label
                        key={p.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                          border: '1.5px solid', borderColor: selecionado ? 'var(--primary)' : 'var(--border)',
                          borderRadius: 8, cursor: maxAtingido ? 'not-allowed' : 'pointer',
                          background: selecionado ? 'var(--primary-bg)' : 'var(--white)',
                          opacity: maxAtingido ? 0.5 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => togglePedido(p.id)}
                          disabled={maxAtingido}
                        />
                        <div style={{ flex: 1 }}>
                          <div className="font-semibold text-sm">Pedido #{p.id} — {cliente?.nome}</div>
                          <div className="text-xs text-muted">
                            {p.items.map(i => `${i.emoji} ${i.nome} x${i.quantidade}`).join(' · ')}
                          </div>
                          <div className="text-xs text-muted">📍 {p.enderecoEntrega}</div>
                        </div>
                        <div className="font-semibold text-sm text-primary">R$ {p.total.toFixed(2)}</div>
                      </label>
                    )
                  })}
                </div>
                {selectedPedidoIds.length >= MAX_PEDIDOS_POR_ENTREGA && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--warning)', marginTop: 6 }}>
                    Limite de {MAX_PEDIDOS_POR_ENTREGA} pedidos por entrega atingido.
                  </div>
                )}
              </div>

              {/* 3. Observacao */}
              <div className="form-group">
                <label className="form-label">3. Observacao (opcional)</label>
                <textarea className="form-control" value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} placeholder="Ex: Levar troco para R$100..." />
              </div>

              {/* Resumo */}
              {selectedPedidoIds.length > 0 && (
                <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, marginTop: 12, fontSize: '0.85rem' }}>
                  <strong>Resumo da entrega:</strong>
                  <div>Entregador: {state.entregadores.find(e => e.id === Number(selectedEntregadorId))?.nome || '—'}</div>
                  <div>Pedidos: {selectedPedidoIds.length}</div>
                  <div>Total a receber: R$ {pedidosProntos.filter(p => selectedPedidoIds.includes(p.id)).reduce((s, p) => s + p.total, 0).toFixed(2)}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalCreate(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={criarEntrega}
                disabled={!selectedEntregadorId || selectedPedidoIds.length === 0 || alertLevel === 'danger'}
              >
                🚚 Criar Entrega
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: DETALHES DA ENTREGA ===== */}
      {modalDetail && (() => {
        const entregaAtual = state.entregas.find(e => e.id === modalDetail.id) || modalDetail
        const entregador = state.entregadores.find(e => e.id === entregaAtual.entregadorId)
        const pedidosDaEntrega = state.pedidos.filter(p => entregaAtual.pedidoIds.includes(p.id))
        const pedidosAdicionaveis = pedidosProntos.filter(p => !entregaAtual.pedidoIds.includes(p.id))
        const podeAdicionar = entregaAtual.status === 'pendente' && entregaAtual.pedidoIds.length < MAX_PEDIDOS_POR_ENTREGA
        const mins = minutesDiff(entregaAtual.dataInicio, entregaAtual.dataFim)
        const horas = calcularHorasConsecutivas(entregaAtual.entregadorId, state.entregas)

        return (
          <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModalDetail(null)}>
            <div className="modal modal-lg">
              <div className="modal-header">
                <span className="modal-title">🚚 Entrega #{entregaAtual.id}</span>
                <button className="modal-close" onClick={() => setModalDetail(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <div className="detail-section-title">Entregador</div>
                    <div className="detail-row"><span className="detail-label">Nome</span><span className="detail-value">{entregador?.nome}</span></div>
                    <div className="detail-row"><span className="detail-label">Telefone</span><span className="detail-value">{entregador?.telefone}</span></div>
                    <div className="detail-row">
                      <span className="detail-label">Jornada Acumulada</span>
                      <span className={`badge ${getAlertLevel(horas) === 'danger' ? 'badge-danger' : getAlertLevel(horas) === 'warning' ? 'badge-warning' : 'badge-success'}`}>
                        {formatHoras(horas)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="detail-section-title">Entrega</div>
                    <div className="detail-row"><span className="detail-label">Status</span><span className={`badge ${STATUS_CLS[entregaAtual.status]}`}>{STATUS_LABEL[entregaAtual.status]}</span></div>
                    <div className="detail-row"><span className="detail-label">Inicio</span><span className="detail-value">{entregaAtual.dataInicio ? new Date(entregaAtual.dataInicio).toLocaleString('pt-BR') : '—'}</span></div>
                    <div className="detail-row"><span className="detail-label">Fim</span><span className="detail-value">{entregaAtual.dataFim ? new Date(entregaAtual.dataFim).toLocaleString('pt-BR') : '—'}</span></div>
                    <div className="detail-row"><span className="detail-label">Duracao</span><span className="detail-value">{mins !== null ? `${mins} min` : '—'}</span></div>
                    {entregaAtual.observacao && <div className="detail-row"><span className="detail-label">Obs</span><span className="detail-value text-sm">{entregaAtual.observacao}</span></div>}
                  </div>
                </div>

                <div className="detail-section-title">
                  Pedidos desta entrega ({entregaAtual.pedidoIds.length}/{MAX_PEDIDOS_POR_ENTREGA})
                </div>
                {pedidosDaEntrega.map(p => {
                  const cliente = state.clientes.find(c => c.id === p.clienteId)
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div className="font-semibold text-sm">Pedido #{p.id} — {cliente?.nome}</div>
                        <div className="text-xs text-muted">{p.items.map(i => `${i.emoji} ${i.nome} x${i.quantidade}`).join(' · ')}</div>
                        <div className="text-xs text-muted">📍 {p.enderecoEntrega}</div>
                      </div>
                      <span className="font-semibold text-sm text-primary">R$ {p.total.toFixed(2)}</span>
                      {entregaAtual.status === 'pendente' && (
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => removerPedidoEntrega(entregaAtual.id, p.id)}
                          title="Remover pedido desta entrega"
                        >✕</button>
                      )}
                    </div>
                  )
                })}

                {podeAdicionar && pedidosAdicionaveis.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div className="detail-section-title">Adicionar pedido (ate {MAX_PEDIDOS_POR_ENTREGA - entregaAtual.pedidoIds.length} restante(s))</div>
                    {pedidosAdicionaveis.map(p => {
                      const cliente = state.clientes.find(c => c.id === p.clienteId)
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ flex: 1 }}>
                            <div className="font-semibold text-sm">Pedido #{p.id} — {cliente?.nome}</div>
                            <div className="text-xs text-muted">{p.items.map(i => `${i.emoji} ${i.nome} x${i.quantidade}`).join(' · ')}</div>
                          </div>
                          <button className="btn btn-sm btn-primary" onClick={() => adicionarPedidoEntrega(entregaAtual.id, p.id)}>
                            + Adicionar
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {entregaAtual.status === 'em_andamento' && (
                  <>
                    <button className="btn btn-danger" onClick={() => cancelarEntrega(entregaAtual)}>Cancelar Entrega</button>
                    <button className="btn btn-success" onClick={() => confirmarEntrega(entregaAtual)}>✅ Confirmar Entrega</button>
                  </>
                )}
                <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(entregaAtual)}>🗑️</button>
                <button className="btn btn-secondary" onClick={() => setModalDetail(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Confirmar exclusao */}
      {confirmDelete && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">Excluir Entrega</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Excluir a entrega <strong>#{confirmDelete.id}</strong>? Os pedidos vinculados voltarao ao status "Pronto".</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => deleteEntrega(confirmDelete.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
