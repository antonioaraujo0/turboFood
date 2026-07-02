import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Cardapio() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [addedId, setAddedId] = useState(null)

  const produtosAtivos = state.produtos.filter(p => p.status === 'ativo')

  const filteredProdutos = produtosAtivos.filter(p => {
    const matchCat = catFilter === 0 || p.categoriaId === catFilter
    const matchSearch = !search ||
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.descricao.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function addToCart(produto) {
    dispatch({ type: 'ADD_TO_CART', payload: { produtoId: produto.id, nome: produto.nome, emoji: produto.emoji, preco: produto.preco } })
    setAddedId(produto.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  function updateQty(produtoId, quantidade) {
    dispatch({ type: 'UPDATE_CART_QTY', payload: { produtoId, quantidade } })
  }

  function removeFromCart(produtoId) {
    dispatch({ type: 'REMOVE_FROM_CART', payload: produtoId })
  }

  const cartTotal = state.cart.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const taxaEntrega = 5.00
  const cartCount = state.cart.reduce((s, i) => s + i.quantidade, 0)

  function logout() {
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const categorias = [{ id: 0, nome: '🍽️ Todos' }, ...state.categorias.map(c => ({ ...c, nome: `${['🍕', '🍔', '🥤', '🍰', '🎁'][c.id - 1] || '🍴'} ${c.nome}` }))]

  const categoriasFiltradas = catFilter === 0
    ? state.categorias.filter(c => produtosAtivos.some(p => p.categoriaId === c.id))
    : [state.categorias.find(c => c.id === catFilter)].filter(Boolean)

  return (
    <div className="customer-body">
      <nav className="customer-nav">
        <div className="customer-nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            <span className="nav-logo-name">Turbo<span>Food</span></span>
          </div>

          <div className="nav-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar pizza, lanche, bebida..."
            />
          </div>

          <div className="nav-actions">
            <button
              className="icon-btn"
              onClick={() => navigate('/cliente/meus-pedidos')}
              title="Meus Pedidos"
              style={{ textDecoration: 'none', background: 'var(--white)', border: '1.5px solid var(--border)' }}
            >📋</button>
            <button className="icon-btn" onClick={logout} title="Sair">🚪</button>
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒 Carrinho <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="category-bar">
        <div className="category-bar-inner">
          {categorias.map(c => (
            <button
              key={c.id}
              className={`cat-pill${catFilter === c.id ? ' active' : ''}`}
              onClick={() => setCatFilter(c.id)}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-content">
        {catFilter === 0 && !search && (
          <div className="promo-banner">
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: 4 }}>🎉 Promoção especial!</p>
              <h2>Combo Família por R$ 89,90</h2>
              <p>2 pizzas grandes + 2 refrigerantes 2L</p>
            </div>
            <button
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)' }}
              onClick={() => {
                const combo = state.produtos.find(p => p.nome === 'Combo Família')
                if (combo) addToCart(combo)
              }}
            >
              Pedir Agora 🚀
            </button>
          </div>
        )}

        {filteredProdutos.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <div className="empty-state-title">Nenhum produto encontrado</div>
            <div className="empty-state-desc">Tente uma busca diferente ou selecione outra categoria.</div>
          </div>
        )}

        {categoriasFiltradas.map(cat => {
          const prods = filteredProdutos.filter(p => p.categoriaId === cat.id)
          if (prods.length === 0) return null
          const emojiMap = { 1: '🍕', 2: '🍔', 3: '🥤', 4: '🍰', 5: '🎁' }
          return (
            <section key={cat.id} className="products-section">
              <h2 className="section-title">
                <span className="section-title-icon">{emojiMap[cat.id] || '🍴'}</span>
                {cat.nome}
              </h2>
              <div className="products-grid">
                {prods.map(p => {
                  const cartItem = state.cart.find(i => i.produtoId === p.id)
                  return (
                    <div key={p.id} className="product-card">
                      <div className="product-card-img">{p.emoji}</div>
                      <div className="product-card-body">
                        <div className="product-card-name">{p.nome}</div>
                        <div className="product-card-desc">{p.descricao}</div>
                        <div className="product-card-footer">
                          <span className="product-price">R$ {p.preco.toFixed(2)}</span>
                          {cartItem ? (
                            <div className="qty-control">
                              <button className="qty-btn" onClick={() => updateQty(p.id, cartItem.quantidade - 1)}>−</button>
                              <span className="qty-value">{cartItem.quantidade}</span>
                              <button className="qty-btn" onClick={() => updateQty(p.id, cartItem.quantidade + 1)}>+</button>
                            </div>
                          ) : (
                            <button
                              className={`add-btn${addedId === p.id ? ' added' : ''}`}
                              onClick={() => addToCart(p)}
                            >
                              {addedId === p.id ? '✓' : '+'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* CART OVERLAY */}
      <div className={`cart-sidebar-overlay${cartOpen ? ' show' : ''}`} onClick={() => setCartOpen(false)} />

      {/* CART SIDEBAR */}
      <div className={`cart-sidebar${cartOpen ? ' show' : ''}`}>
        <div className="cart-header">
          <h3 className="font-bold text-lg">🛒 Meu Carrinho</h3>
          <button className="modal-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="cart-items">
          {state.cart.length === 0 && (
            <div className="cart-empty">
              <span className="empty-icon">🛒</span>
              <p>Seu carrinho está vazio.</p>
              <p className="text-xs text-muted mt-2">Adicione itens do cardápio!</p>
            </div>
          )}
          {state.cart.map(item => (
            <div key={item.produtoId} className="cart-item">
              <div className="cart-item-img">{item.emoji}</div>
              <div className="flex-1">
                <div className="cart-item-name">{item.nome}</div>
                <div className="cart-item-price">R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                <div className="qty-control mt-2">
                  <button className="qty-btn" onClick={() => updateQty(item.produtoId, item.quantidade - 1)}>−</button>
                  <span className="qty-value">{item.quantidade}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.produtoId, item.quantidade + 1)}>+</button>
                </div>
              </div>
              <button className="cart-remove-btn" onClick={() => removeFromCart(item.produtoId)}>✕</button>
            </div>
          ))}
        </div>

        {state.cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-row"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
              <div className="cart-row"><span>Taxa de entrega</span><span>R$ {taxaEntrega.toFixed(2)}</span></div>
              <div className="cart-row total">
                <span>Total</span>
                <span>R$ {(cartTotal + taxaEntrega).toFixed(2)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-xl w-full"
              style={{ marginBottom: 8 }}
              onClick={() => { setCartOpen(false); navigate('/cliente/meus-pedidos') }}
            >
              🚀 Finalizar Pedido
            </button>
            <button className="btn btn-ghost w-full" onClick={() => setCartOpen(false)}>
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
