import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const navLinks = [
  { to: '/admin/dashboard', icon: '🏠', label: 'Dashboard', section: 'Principal' },
  { to: '/admin/pedidos', icon: '📋', label: 'Pedidos', section: 'Principal' },
  { to: '/admin/pagamentos', icon: '💳', label: 'Pagamentos', section: 'Principal' },
  { to: '/admin/entregas', icon: '🚚', label: 'Entregas', section: 'Principal' },
  { to: '/admin/categorias', icon: '🏷️', label: 'Categorias', section: 'Cadastros' },
  { to: '/admin/produtos', icon: '🍕', label: 'Produtos', section: 'Cadastros' },
  { to: '/admin/clientes', icon: '👥', label: 'Clientes', section: 'Cadastros' },
  { to: '/admin/entregadores', icon: '🛵', label: 'Entregadores', section: 'Cadastros' },
  { to: '/admin/veiculos', icon: '🚗', label: 'Veículos', section: 'Cadastros' },
  { to: '/admin/avaliacoes', icon: '⭐', label: 'Avaliações', section: 'Relatórios' },
  { to: '/admin/relatorios', icon: '📊', label: 'Relatórios', section: 'Relatórios' },
]

export default function AdminLayout({ children, title, subtitle }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pendingOrders = state.pedidos.filter(p => p.status === 'aguardando').length
  const pedidosProntosSemEntrega = state.pedidos.filter(p => p.status === 'pronto' && !p.entregadorId).length
  const entregasAtivas = state.entregas.filter(e => e.status === 'em_andamento').length

  function logout() {
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const sections = ['Principal', 'Cadastros', 'Relatórios']
  const initials = state.currentUser?.nome
    ? state.currentUser.nome.split(' ').map(w => w[0]).slice(0, 2).join('')
    : 'AD'

  return (
    <div className="layout">
      <div className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/admin/dashboard" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar-logo-icon">⚡</div>
          <div>
            <span className="sidebar-logo-name">TurboFood</span>
            <span className="sidebar-logo-sub">Administrador</span>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="sidebar-section-title">{section}</div>
              {navLinks.filter(l => l.section === section).map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="icon">{link.icon}</span>
                  {link.label}
                  {link.label === 'Pedidos' && pendingOrders > 0 && (
                    <span className="sidebar-badge">{pendingOrders}</span>
                  )}
                  {link.label === 'Entregas' && pedidosProntosSemEntrega > 0 && (
                    <span className="sidebar-badge">{pedidosProntosSemEntrega}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{state.currentUser?.nome}</div>
              <div className="sidebar-user-role">Gerente</div>
            </div>
            <button className="sidebar-logout-btn" onClick={logout} title="Sair">🚪</button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <button className="sidebar-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="top-bar-title" style={{ marginLeft: 12 }}>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="top-bar-right">
            <button className="icon-btn" title="Notificações">
              🔔
              {pendingOrders > 0 && <span className="dot">{pendingOrders}</span>}
            </button>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
