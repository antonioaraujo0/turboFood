import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { calcularHorasConsecutivas, formatHoras, getAlertLevel, MAX_HORAS_CONSECUTIVAS, MAX_PEDIDOS_POR_ENTREGA, ALERTA_HORAS } from '../../utils/entregaRules'

function minutesDiff(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 60000)
}

export default function Relatorios() {
  const { state } = useApp()
  const { pedidos, pagamentos, entregas, produtos, clientes, entregadores, avaliacoes } = state

  const entregasFeitas = entregas.filter(e => e.status === 'entregue')
  const receitaTotal = pagamentos.filter(p => p.status === 'aprovado').reduce((s, p) => s + p.valor, 0)
  const ticketMedio = pagamentos.filter(p => p.status === 'aprovado').length
    ? receitaTotal / pagamentos.filter(p => p.status === 'aprovado').length
    : 0
  const tempoMedio = entregasFeitas.filter(e => e.dataInicio && e.dataFim).length
    ? entregasFeitas.filter(e => e.dataInicio && e.dataFim)
        .reduce((s, e) => s + minutesDiff(e.dataInicio, e.dataFim), 0)
      / entregasFeitas.filter(e => e.dataInicio && e.dataFim).length
    : 0
  const mediaAvaliacao = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + ((a.notaComida ?? a.nota ?? 0) + (a.notaEntrega ?? a.nota ?? 0)) / (a.notaEntrega !== undefined ? 2 : 1), 0) / avaliacoes.length).toFixed(1)
    : '—'

  // Pedidos por bairro
  const bairroCount = {}
  pedidos.forEach(p => { if (p.bairro) bairroCount[p.bairro] = (bairroCount[p.bairro] || 0) + 1 })
  const maxBairro = Math.max(1, ...Object.values(bairroCount))

  // Produtos mais pedidos
  const produtoCount = {}
  pedidos.forEach(p => {
    p.items.forEach(item => {
      produtoCount[item.produtoId] = (produtoCount[item.produtoId] || 0) + item.quantidade
    })
  })
  const topProdutos = Object.entries(produtoCount)
    .map(([id, qty]) => ({ produto: produtos.find(p => p.id === Number(id)), qty }))
    .filter(r => r.produto)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  // Entregadores com mais entregas
  const entregadorCount = {}
  entregasFeitas.forEach(e => {
    entregadorCount[e.entregadorId] = (entregadorCount[e.entregadorId] || 0) + 1
  })
  const topEntregadores = Object.entries(entregadorCount)
    .map(([id, count]) => ({ entregador: entregadores.find(e => e.id === Number(id)), count }))
    .filter(r => r.entregador)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Status dos pedidos
  const statusCount = {}
  pedidos.forEach(p => { statusCount[p.status] = (statusCount[p.status] || 0) + 1 })

  const posClassMap = ['gold', 'silver', 'bronze']

  // Business rules metrics
  const jornadaEntregadores = entregadores.map(e => ({
    ...e,
    horas: calcularHorasConsecutivas(e.id, entregas),
  })).sort((a, b) => b.horas - a.horas)

  const totalPedidosEmEntregas = entregas.reduce((s, e) => s + (e.pedidoIds?.length || 0), 0)
  const mediaPedidosPorEntrega = entregas.length ? (totalPedidosEmEntregas / entregas.length).toFixed(1) : '0'
  const entregasLoteCheio = entregas.filter(e => (e.pedidoIds?.length || 0) >= MAX_PEDIDOS_POR_ENTREGA).length
  const entregadoresEmAlerta = jornadaEntregadores.filter(e => e.horas >= ALERTA_HORAS).length
  const entregadoresEmViolacao = jornadaEntregadores.filter(e => e.horas >= MAX_HORAS_CONSECUTIVAS).length
  const complianceRate = entregas.length
    ? ((entregas.filter(e => (e.pedidoIds?.length || 0) <= MAX_PEDIDOS_POR_ENTREGA).length / entregas.length) * 100).toFixed(0)
    : 100

  return (
    <AdminLayout title="📊 Relatórios" subtitle="Análise completa das operações">
      <div className="stats-grid stats-grid-4 mb-4">
        <div className="stat-card"><div className="stat-icon green">💰</div><div><div className="stat-value">R$ {receitaTotal.toFixed(0)}</div><div className="stat-label">Receita Total</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🧾</div><div><div className="stat-value">R$ {ticketMedio.toFixed(2)}</div><div className="stat-label">Ticket Médio</div></div></div>
        <div className="stat-card"><div className="stat-icon orange">⏱️</div><div><div className="stat-value">{tempoMedio > 0 ? `${Math.round(tempoMedio)} min` : '—'}</div><div className="stat-label">Tempo Médio Entrega</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⭐</div><div><div className="stat-value">{mediaAvaliacao}</div><div className="stat-label">Avaliação Média</div></div></div>
      </div>

      <div className="stats-grid stats-grid-4 mb-4">
        <div className="stat-card"><div className="stat-icon blue">📋</div><div><div className="stat-value">{pedidos.length}</div><div className="stat-label">Total de Pedidos</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div><div className="stat-value">{entregasFeitas.length}</div><div className="stat-label">Entregas Concluídas</div></div></div>
        <div className="stat-card"><div className="stat-icon orange">👥</div><div><div className="stat-value">{clientes.length}</div><div className="stat-label">Clientes</div></div></div>
        <div className="stat-card"><div className="stat-icon purple">⭐</div><div><div className="stat-value">{avaliacoes.length}</div><div className="stat-label">Avaliações</div></div></div>
      </div>

      <div className="report-grid">
        <div className="report-card">
          <div className="report-card-title">🏆 Produtos Mais Pedidos</div>
          {topProdutos.length === 0 && <p className="text-sm text-muted">Sem dados</p>}
          {topProdutos.map((r, i) => (
            <div key={r.produto.id} className="ranking-item">
              <div className={`ranking-pos ${posClassMap[i] || ''}`}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="font-semibold text-sm">{r.produto.emoji} {r.produto.nome}</div>
                <div className="text-xs text-muted">{r.produto.categoriaId && state.categorias.find(c => c.id === r.produto.categoriaId)?.nome}</div>
              </div>
              <span className="badge badge-orange">{r.qty} unid.</span>
            </div>
          ))}
        </div>

        <div className="report-card">
          <div className="report-card-title">🛵 Top Entregadores</div>
          {topEntregadores.length === 0 && <p className="text-sm text-muted">Sem dados de entrega</p>}
          {topEntregadores.map((r, i) => (
            <div key={r.entregador.id} className="ranking-item">
              <div className={`ranking-pos ${posClassMap[i] || ''}`}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="font-semibold text-sm">{r.entregador.nome}</div>
                <div className="text-xs text-muted">{r.entregador.telefone}</div>
              </div>
              <span className="badge badge-info">{r.count} entregas</span>
            </div>
          ))}
        </div>

        <div className="report-card">
          <div className="report-card-title">📋 Status dos Pedidos</div>
          {['aguardando', 'confirmado', 'preparando', 'pronto', 'entregando', 'entregue', 'cancelado'].map(s => {
            const count = statusCount[s] || 0
            if (count === 0) return null
            const clsMap = { aguardando: 'badge-warning', confirmado: 'badge-info', preparando: 'badge-purple', pronto: 'badge-orange', entregando: 'badge-info', entregue: 'badge-success', cancelado: 'badge-danger' }
            return (
              <div key={s} className="detail-row">
                <span className="detail-label" style={{ textTransform: 'capitalize' }}>{s}</span>
                <span className={`badge ${clsMap[s]}`}>{count}</span>
              </div>
            )
          })}
        </div>

        <div className="report-card">
          <div className="report-card-title">💳 Pagamentos</div>
          {['aprovado', 'pendente', 'recusado'].map(s => {
            const pags = pagamentos.filter(p => p.status === s)
            const total = pags.reduce((sum, p) => sum + p.valor, 0)
            const clsMap = { aprovado: 'badge-success', pendente: 'badge-warning', recusado: 'badge-danger' }
            return (
              <div key={s} className="detail-row">
                <span className="detail-label" style={{ textTransform: 'capitalize' }}>
                  {s} ({pags.length})
                </span>
                <span className={`badge ${clsMap[s]}`}>R$ {total.toFixed(2)}</span>
              </div>
            )
          })}
        </div>

        <div className="report-card">
          <div className="report-card-title">🚚 Relatório de Entregas</div>
          <div className="detail-row">
            <span className="detail-label">Total de Entregas</span>
            <span className="detail-value">{entregas.length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Concluídas</span>
            <span className="detail-value text-success">{entregasFeitas.length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Em Andamento</span>
            <span className="detail-value">{entregas.filter(e => e.status === 'em_andamento').length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Pendentes</span>
            <span className="detail-value">{entregas.filter(e => e.status === 'pendente').length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tempo Médio</span>
            <span className="detail-value">{tempoMedio > 0 ? `${Math.round(tempoMedio)} min` : 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Taxa de Conclusão</span>
            <span className="detail-value">
              {entregas.length > 0 ? `${((entregasFeitas.length / entregas.length) * 100).toFixed(0)}%` : '—'}
            </span>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-title">📍 Pedidos por Bairro</div>
          {Object.keys(bairroCount).length === 0 && <p className="text-sm text-muted">Sem dados</p>}
          {Object.entries(bairroCount).sort((a, b) => b[1] - a[1]).map(([bairro, count]) => (
            <div key={bairro} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="text-sm font-semibold" style={{ minWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bairro}</span>
              <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 4, height: 8 }}>
                <div style={{ width: `${(count / maxBairro) * 100}%`, background: 'var(--primary)', borderRadius: 4, height: '100%', transition: 'width 0.4s' }} />
              </div>
              <span className="badge badge-info">{count}</span>
            </div>
          ))}
        </div>

        <div className="report-card">
          <div className="report-card-title">⭐ Distribuicao de Avaliacoes</div>
          {[5, 4, 3, 2, 1].map(nota => {
            const count = avaliacoes.filter(a => Math.round(((a.notaComida ?? a.nota ?? 0) + (a.notaEntrega ?? a.nota ?? 0)) / (a.notaEntrega !== undefined ? 2 : 1)) === nota).length
            const pct = avaliacoes.length ? ((count / avaliacoes.length) * 100).toFixed(0) : 0
            return (
              <div key={nota} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', minWidth: 20 }}>{nota}⭐</span>
                <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${pct}%`, background: 'var(--warning)', borderRadius: 4, height: '100%', transition: 'width 0.4s' }} />
                </div>
                <span className="text-xs text-muted">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <h2 className="font-bold" style={{ fontSize: '1.1rem', marginBottom: 4 }}>Regras de Negocio</h2>
        <p className="text-sm text-muted">Conformidade com as regras operacionais de jornada e capacidade de lote.</p>
      </div>

      <div className="stats-grid stats-grid-4 mb-4">
        <div className="stat-card">
          <div className={`stat-icon ${entregadoresEmViolacao > 0 ? 'red' : 'green'}`}>⏱️</div>
          <div>
            <div className="stat-value">{entregadoresEmViolacao}</div>
            <div className="stat-label">Entregadores em Violacao de Jornada</div>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${entregadoresEmAlerta > 0 ? 'yellow' : 'green'}`}>⚠️</div>
          <div>
            <div className="stat-value">{entregadoresEmAlerta}</div>
            <div className="stat-label">Entregadores em Alerta (6h+)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div>
            <div className="stat-value">{mediaPedidosPorEntrega}</div>
            <div className="stat-label">Media de Pedidos por Entrega</div>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${Number(complianceRate) < 100 ? 'yellow' : 'green'}`}>✅</div>
          <div>
            <div className="stat-value">{complianceRate}%</div>
            <div className="stat-label">Conformidade de Lote</div>
          </div>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-card" style={{ gridColumn: 'span 2' }}>
          <div className="report-card-title">⏱️ Jornada por Entregador</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th>Entregador</th>
                  <th>Status</th>
                  <th>Jornada Consecutiva</th>
                  <th>Entregas Feitas</th>
                  <th>Situacao</th>
                </tr>
              </thead>
              <tbody>
                {jornadaEntregadores.map(e => {
                  const level = getAlertLevel(e.horas)
                  const feitas = entregas.filter(en => en.entregadorId === e.id && en.status === 'entregue').length
                  return (
                    <tr key={e.id}>
                      <td className="font-semibold">{e.nome}</td>
                      <td><span className={`badge ${e.status === 'disponivel' ? 'badge-success' : e.status === 'em_entrega' ? 'badge-info' : 'badge-warning'}`}>{e.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 4, height: 8, minWidth: 80 }}>
                            <div style={{
                              width: `${Math.min((e.horas / MAX_HORAS_CONSECUTIVAS) * 100, 100)}%`,
                              background: level === 'danger' ? 'var(--danger)' : level === 'warning' ? 'var(--warning)' : 'var(--success)',
                              borderRadius: 4, height: '100%', transition: 'width 0.4s'
                            }} />
                          </div>
                          <span className="text-xs" style={{ minWidth: 50 }}>{e.horas > 0 ? formatHoras(e.horas) : '0h'}</span>
                        </div>
                      </td>
                      <td>{feitas}</td>
                      <td>
                        {level === 'danger' && <span className="badge badge-danger">Violacao 8h</span>}
                        {level === 'warning' && <span className="badge badge-warning">Alerta 6h+</span>}
                        {level === 'ok' && <span className="badge badge-success">OK</span>}
                      </td>
                    </tr>
                  )
                })}
                {jornadaEntregadores.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted">Nenhum entregador cadastrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-title">📦 Distribuicao de Lotes</div>
          {[1, 2, 3, 4, 5].map(n => {
            const count = entregas.filter(e => (e.pedidoIds?.length || 0) === n).length
            const pct = entregas.length ? ((count / entregas.length) * 100).toFixed(0) : 0
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', minWidth: 60 }}>{n} pedido{n > 1 ? 's' : ''}</span>
                <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${pct}%`, background: n === MAX_PEDIDOS_POR_ENTREGA ? 'var(--primary)' : 'var(--info)', borderRadius: 4, height: '100%', transition: 'width 0.4s' }} />
                </div>
                <span className="text-xs text-muted">{count}</span>
              </div>
            )
          })}
          <div className="detail-row mt-3">
            <span className="detail-label">Lotes no maximo (5 ped.)</span>
            <span className="badge badge-orange">{entregasLoteCheio}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total de pedidos em rotas</span>
            <span className="detail-value">{totalPedidosEmEntregas}</span>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-title">⚖️ Resumo de Conformidade</div>
          <div className="detail-row">
            <span className="detail-label">Limite de jornada</span>
            <span className="detail-value">{MAX_HORAS_CONSECUTIVAS}h consecutivas</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Limite de lote</span>
            <span className="detail-value">{MAX_PEDIDOS_POR_ENTREGA} pedidos/entrega</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Alerta de jornada</span>
            <span className="detail-value">{ALERTA_HORAS}h+</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Entregadores regulares</span>
            <span className="badge badge-success">{jornadaEntregadores.filter(e => getAlertLevel(e.horas) === 'ok').length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Em alerta</span>
            <span className="badge badge-warning">{entregadoresEmAlerta}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Em violacao</span>
            <span className="badge badge-danger">{entregadoresEmViolacao}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Taxa de conformidade</span>
            <span className={`badge ${Number(complianceRate) === 100 ? 'badge-success' : 'badge-warning'}`}>{complianceRate}%</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
