import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { USUARIOS } from '../data/mockData'

const ROLES = [
  { key: 'admin', icon: '👨‍💼', label: 'Administrador' },
  { key: 'cliente', icon: '👤', label: 'Cliente' },
  { key: 'cozinha', icon: '👨‍🍳', label: 'Cozinha' },
  { key: 'entregador', icon: '🛵', label: 'Entregador' },
]

const ROLE_DEFAULTS = {
  admin: { email: 'admin@turbofood.com', redirect: '/admin/dashboard' },
  cliente: { email: 'joao@turbofood.com', redirect: '/cliente/cardapio' },
  cozinha: { email: 'cozinha@turbofood.com', redirect: '/cozinha/painel' },
  entregador: { email: 'carlos@turbofood.com', redirect: '/entregador/painel' },
}

export default function Login() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState(ROLE_DEFAULTS.admin.email)
  const [senha, setSenha] = useState('123')
  const [erro, setErro] = useState('')

  function selectRole(r) {
    setRole(r)
    setEmail(ROLE_DEFAULTS[r].email)
    setSenha('123')
    setErro('')
  }

  function handleLogin(e) {
    e.preventDefault()
    const user = USUARIOS.find(u => u.email === email && u.senha === senha && u.role === role)
    if (!user) {
      setErro('E-mail ou senha inválidos para o perfil selecionado.')
      return
    }
    dispatch({ type: 'LOGIN', payload: user })
    navigate(ROLE_DEFAULTS[role].redirect)
  }

  return (
    <div className="login-body">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon">⚡</div>
            <span className="login-logo-name">TurboFood</span>
          </div>
          <p className="login-tagline">Sistema de Gestão de Pedidos e Delivery</p>
        </div>

        <div className="login-body-area">
          <p className="text-sm text-muted mb-4 text-center">Selecione seu perfil de acesso:</p>

          <div className="role-selector mb-4">
            {ROLES.map(r => (
              <button
                key={r.key}
                className={`role-btn${role === r.key ? ' active' : ''}`}
                type="button"
                onClick={() => selectRole(r.key)}
              >
                <span className="role-icon">{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label className="form-label req">E-mail</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label req">Senha</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="form-control"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {erro && (
              <div style={{ background: 'var(--danger-light)', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16 }}>
                ⚠️ {erro}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-xl w-full">
              ⚡ Entrar no Sistema
            </button>
          </form>

          <Link to="/integrado" className="btn w-full" style={{ marginTop: 12, background: '#111', color: '#fff', textAlign: 'center', display: 'block', padding: '12px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            🔌 Demonstração integrada ao backend
          </Link>

          <div style={{ marginTop: 20, padding: 14, background: 'var(--gray-50)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong>Credenciais de demonstração (senha: 123)</strong><br />
            Admin: admin@turbofood.com · Cliente: joao@turbofood.com<br />
            Cozinha: cozinha@turbofood.com · Entregador: carlos@turbofood.com
          </div>
        </div>

        <div className="login-footer">
          <p className="text-sm text-muted">TurboFood © 2026 – Sistema de Gestão</p>
        </div>
      </div>
    </div>
  )
}
