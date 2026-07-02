import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const STATUS_MAP = {
  aguardando: { label: '⏳ Aguardando', cls: 'badge-warning', pct: 10 },
  confirmado: { label: '✅ Confirmado', cls: 'badge-info', pct: 25 },
  preparando: { label: '👨‍🍳 Preparando', cls: 'badge-purple', pct: 50 },
  pronto: { label: '📦 Pronto', cls: 'badge-orange', pct: 70 },
  entregando: { label: '🛵 A caminho', cls: 'badge-info', pct: 85 },
  entregue: { label: '✅ Entregue', cls: 'badge-success', pct: 100 },
  cancelado: { label: '❌ Cancelado', cls: 'badge-danger', pct: 0 },
}

const METODO_MAP = { cartao_credito: '💳 Crédito', cartao_debito: '💳 Débito', pix: '📱 Pix', dinheiro: '💵 Dinheiro' }

function CheckoutFlow({ onSuccess }) {
  const { state, dispatch } = useApp()
  const [step, setStep] = useState(1)
  const [endereco, setEndereco] = useState(
    state.clientes.find(c => c.id === state.currentUser?.clienteId)?.endereco || ''
  )
  const [enderecoCustom, setEnderecoCustom] = useState('')
  const [bairro, setBairro] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [metodo, setMetodo] = useState('pix')

  const cart = state.cart
  const subtotal = cart.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const taxaEntrega = 5.00
  const total = subtotal + taxaEntrega
  const cliente = state.clientes.find(c => c.id === state.currentUser?.clienteId)
  const enderecoFinal = endereco === 'custom' ? enderecoCustom : endereco

  function confirmarPedido() {
    const pedidoId = Date.now()
    const pagamentoId = Date.now() + 1

    dispatch({
      type: 'ADD_PEDIDO',
      payload: {
        pedido: {
          id: pedidoId,
          clienteId: state.currentUser.clienteId,
          entregadorId: null,
          items: cart.map(i => ({ produtoId: i.produtoId, nome: i.nome, emoji: i.emoji, preco: i.preco, quantidade: i.quantidade })),
          status: 'aguardando',
          subtotal,
          taxaEntrega,
          total,
          enderecoEntrega: enderecoFinal,
          bairro: bairro || 'Centro',
          observacoes,
          createdAt: new Date().toISOString(),
        },
        pagamento: { id: pagamentoId, pedidoId, valor: total, metodo, status: 'pendente' },
      }
    })
    onSuccess(pedidoId)
  }

  if (step === 1) return (
    <div>
      <h3 className="font-bold mb-3">📍 Endereço de Entrega</h3>
      {cliente && (
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', border: '1.5px solid', borderColor: endereco === cliente.endereco ? 'var(--primary)' : 'var(--border)', borderRadius: 8, cursor: 'pointer', marginBottom: 10 }}>
          <input type="radio" name="end" value={cliente.endereco} checked={endereco === cliente.endereco} onChange={e => setEndereco(e.target.value)} />
          <div>
            <div className="font-semibold text-sm">📍 Endereço cadastrado</div>
            <div className="text-xs text-muted">{cliente.endereco}{cliente.cidade ? `, ${cliente.cidade}` : ''}</div>
          </div>
        </label>
      )}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', border: '1.5px solid', borderColor: endereco === 'custom' ? 'var(--primary)' : 'var(--border)', borderRadius: 8, cursor: 'pointer', marginBottom: 10 }}>
        <input type="radio" name="end" value="custom" checked={endereco === 'custom'} onChange={e => setEndereco(e.target.value)} />
        <div style={{ flex: 1 }}>
          <div className="font-semibold text-sm">📝 Outro endereço</div>
          {endereco === 'custom' && (
            <input className="form-control mt-2" value={enderecoCustom} onChange={e => setEnderecoCustom(e.target.value)} placeholder="Digite o endereço completo..." />
          )}
        </div>
      </label>
      <div className="form-group mt-3">
        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Bairro</label>
        <input className="form-control mt-1" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Ex: Centro, Vila Nova..." />
      </div>
      <div className="form-group mt-3">
        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Observacoes (opcional)</label>
        <textarea className="form-control mt-1" rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Ex: sem cebola, campainha não funciona..." />
      </div>
      <button className="btn btn-primary w-full mt-3" onClick={() => enderecoFinal && setStep(2)} disabled={!enderecoFinal}>
        Proximo: Pagamento →
      </button>
    </div>
  )

  if (step === 2) return (
    <div>
      <h3 className="font-bold mb-3">💳 Forma de Pagamento</h3>
      {[
        { key: 'pix', icon: '📱', label: 'Pix', sub: 'Instantâneo e sem taxas' },
        { key: 'cartao_credito', icon: '💳', label: 'Cartão de Crédito', sub: 'Aprovação imediata' },
        { key: 'cartao_debito', icon: '💳', label: 'Cartão de Débito', sub: 'Aprovação imediata' },
        { key: 'dinheiro', icon: '💵', label: 'Dinheiro', sub: 'Pague na entrega' },
      ].map(m => (
        <label key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid', borderColor: metodo === m.key ? 'var(--primary)' : 'var(--border)', borderRadius: 8, cursor: 'pointer', marginBottom: 10 }}>
          <input type="radio" name="metodo" value={m.key} checked={metodo === m.key} onChange={e => setMetodo(e.target.value)} />
          <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
          <div>
            <div className="font-semibold text-sm">{m.label}</div>
            <div className="text-xs text-muted">{m.sub}</div>
          </div>
        </label>
      ))}

      <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 14, marginTop: 16, marginBottom: 16 }}>
        <div className="cart-row"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
        <div className="cart-row"><span>Taxa de entrega</span><span>R$ {taxaEntrega.toFixed(2)}</span></div>
        <div className="cart-row total"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" onClick={() => setStep(1)}>← Voltar</button>
        <button className="btn btn-primary flex-1" onClick={confirmarPedido}>🚀 Confirmar Pedido</button>
      </div>
    </div>
  )
}

export default function MeusPedidos() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [view, setView] = useState('lista') // lista | checkout | success
  const [successPedidoId, setSuccessPedidoId] = useState(null)
  const [avaliacaoModal, setAvaliacaoModal] = useState(null)
  const [avalNotaComida, setAvalNotaComida] = useState(5)
  const [avalNotaEntrega, setAvalNotaEntrega] = useState(5)
  const [avalComentario, setAvalComentario] = useState('')

  const clienteId = state.currentUser?.clienteId
  const meusPedidos = state.pedidos
    .filter(p => p.clienteId === clienteId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const cartCount = state.cart.reduce((s, i) => s + i.quantidade, 0)

  function handleSuccess(pedidoId) {
    setSuccessPedidoId(pedidoId)
    setView('success')
  }

  function submitAvaliacao(pedidoId) {
    const pedido = state.pedidos.find(p => p.id === pedidoId)
    dispatch({
      type: 'ADD_AVALIACAO',
      payload: {
        id: Date.now(),
        pedidoId,
        clienteId,
        entregadorId: pedido?.entregadorId || null,
        notaComida: avalNotaComida,
        notaEntrega: avalNotaEntrega,
        comentario: avalComentario,
        createdAt: new Date().toISOString(),
      }
    })
    setAvaliacaoModal(null)
    setAvalNotaComida(5)
    setAvalNotaEntrega(5)
    setAvalComentario('')
  }

  function jaAvaliou(pedidoId) {
    return state.avaliacoes.some(a => a.pedidoId === pedidoId && a.clienteId === clienteId)
  }

  function logout() {
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  return (
    <div className="customer-body">
      <nav className="customer-nav">
        <div className="customer-nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            <span className="nav-logo-name">Turbo<span>Food</span></span>
          </div>
          <div className="nav-actions" style={{ marginLeft: 'auto' }}>
            <button
              className="icon-btn"
              onClick={() => navigate('/cliente/cardapio')}
              title="Cardápio"
              style={{ background: 'var(--white)', border: '1.5px solid var(--border)' }}
            >🍽️</button>
            <button
              className="cart-btn"
              onClick={() => { navigate('/cliente/cardapio') }}
            >
              🛒 <span className="cart-count">{cartCount}</span>
            </button>
            <button className="icon-btn" onClick={logout} title="Sair">🚪</button>
          </div>
        </div>
      </nav>

      <div className="menu-content" style={{ maxWidth: 700 }}>
        {view === 'success' && (
          <div className="success-screen">
            <span className="success-icon">🎉</span>
            <div className="success-title">Pedido Realizado!</div>
            <div className="success-subtitle">
              Pedido #{successPedidoId} foi enviado para a cozinha. Acompanhe o status abaixo!
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => { setView('lista'); setSuccessPedidoId(null) }}>
                📋 Meus Pedidos
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/cliente/cardapio')}>
                🍽️ Voltar ao Cardápio
              </button>
            </div>
          </div>
        )}

        {view === 'checkout' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <button className="btn btn-ghost" onClick={() => setView('lista')}>← Voltar</button>
              <h2 className="font-bold">🚀 Finalizar Pedido</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              <div className="card card-body">
                <CheckoutFlow onSuccess={handleSuccess} />
              </div>
              <div className="card card-body">
                <div className="detail-section-title mb-3">Resumo do Pedido</div>
                {state.cart.map(item => (
                  <div key={item.produtoId} className="detail-row">
                    <span className="detail-label">{item.emoji} {item.nome} x{item.quantidade}</span>
                    <span className="detail-value">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                {state.cart.length === 0 && (
                  <p className="text-sm text-muted">Carrinho vazio. <a href="/cliente/cardapio" onClick={e => { e.preventDefault(); navigate('/cliente/cardapio') }}>Adicione itens.</a></p>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'lista' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
              <h2 className="font-bold" style={{ fontSize: '1.3rem' }}>📋 Meus Pedidos</h2>
              {cartCount > 0 && (
                <button className="btn btn-primary" onClick={() => setView('checkout')}>
                  🛒 Finalizar ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
                </button>
              )}
              {cartCount === 0 && (
                <button className="btn btn-secondary" onClick={() => navigate('/cliente/cardapio')}>
                  🍽️ Ver Cardápio
                </button>
              )}
            </div>

            {meusPedidos.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-icon">📋</span>
                <div className="empty-state-title">Nenhum pedido ainda</div>
                <div className="empty-state-desc">Faça seu primeiro pedido pelo cardápio!</div>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/cliente/cardapio')}>
                  🍽️ Ver Cardápio
                </button>
              </div>
            )}

            {meusPedidos.map(pedido => {
              const s = STATUS_MAP[pedido.status] || { label: pedido.status, cls: 'badge-gray', pct: 0 }
              const pagamento = state.pagamentos.find(p => p.pedidoId === pedido.id)
              const avaliado = jaAvaliou(pedido.id)
              return (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-header">
                    <div>
                      <span className="pedido-id">Pedido #{pedido.id}</span>
                      <div className="pedido-date">{new Date(pedido.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </div>

                  <div className="pedido-items">
                    {pedido.items.map(i => `${i.emoji} ${i.nome} x${i.quantidade}`).join(' · ')}
                  </div>

                  {pedido.status !== 'cancelado' && (
                    <div className="status-bar mb-3">
                      <div className="status-fill" style={{ width: `${s.pct}%` }} />
                    </div>
                  )}

                  <div className="detail-row" style={{ border: 'none', padding: '2px 0' }}>
                    <span className="detail-label">📍 {pedido.enderecoEntrega}</span>
                  </div>
                  {pagamento && (
                    <div className="detail-row" style={{ border: 'none', padding: '2px 0' }}>
                      <span className="detail-label">{METODO_MAP[pagamento.metodo]}</span>
                      <span className={`badge ${pagamento.status === 'aprovado' ? 'badge-success' : pagamento.status === 'pendente' ? 'badge-warning' : 'badge-danger'}`}>
                        {pagamento.status}
                      </span>
                    </div>
                  )}

                  <div className="pedido-footer mt-2">
                    <span className="pedido-total">R$ {pedido.total.toFixed(2)}</span>
                    {pedido.status === 'entregue' && !avaliado && (
                      <button className="btn btn-sm btn-secondary" onClick={() => { setAvaliacaoModal(pedido); setAvalNotaComida(5); setAvalNotaEntrega(5); setAvalComentario('') }}>
                        ⭐ Avaliar
                      </button>
                    )}
                    {avaliado && <span className="badge badge-success">✓ Avaliado</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Avaliação */}
      {avaliacaoModal && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setAvaliacaoModal(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">⭐ Avaliar Pedido #{avaliacaoModal.id}</span>
              <button className="modal-close" onClick={() => setAvaliacaoModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-3">
                <label className="form-label">Nota para a Comida</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setAvalNotaComida(n)}
                      style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                        filter: n <= avalNotaComida ? 'none' : 'grayscale(1)',
                        transform: n <= avalNotaComida ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }}>
                      ⭐
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted mt-1">{avalNotaComida} de 5 estrelas</div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Nota para a Entrega</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setAvalNotaEntrega(n)}
                      style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                        filter: n <= avalNotaEntrega ? 'none' : 'grayscale(1)',
                        transform: n <= avalNotaEntrega ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }}>
                      ⭐
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted mt-1">{avalNotaEntrega} de 5 estrelas</div>
              </div>
              <div className="form-group">
                <label className="form-label">Comentario (opcional)</label>
                <textarea className="form-control" value={avalComentario} onChange={e => setAvalComentario(e.target.value)} rows={3} placeholder="Como foi sua experiencia?" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAvaliacaoModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => submitAvaliacao(avaliacaoModal.id)}>⭐ Enviar Avaliacao</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
