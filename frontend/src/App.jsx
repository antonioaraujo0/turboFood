import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Pedidos from './pages/admin/Pedidos'
import Pagamentos from './pages/admin/Pagamentos'
import Categorias from './pages/admin/Categorias'
import Produtos from './pages/admin/Produtos'
import Clientes from './pages/admin/Clientes'
import Entregadores from './pages/admin/Entregadores'
import Veiculos from './pages/admin/Veiculos'
import Avaliacoes from './pages/admin/Avaliacoes'
import Relatorios from './pages/admin/Relatorios'
import Entregas from './pages/admin/Entregas'
import Cardapio from './pages/cliente/Cardapio'
import MeusPedidos from './pages/cliente/MeusPedidos'
import CozinhaPainel from './pages/cozinha/Painel'
import EntregadorPainel from './pages/entregador/Painel'
import Demo from './pages/integrado/Demo'

function Protected({ children, role }) {
  const { state } = useApp()
  if (!state.currentUser) return <Navigate to="/" replace />
  if (role && state.currentUser.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Seção integrada ao backend (apresentação) — pública para acesso fácil */}
        <Route path="/integrado" element={<Demo />} />

        <Route path="/admin/dashboard" element={<Protected role="admin"><Dashboard /></Protected>} />
        <Route path="/admin/pedidos" element={<Protected role="admin"><Pedidos /></Protected>} />
        <Route path="/admin/pagamentos" element={<Protected role="admin"><Pagamentos /></Protected>} />
        <Route path="/admin/categorias" element={<Protected role="admin"><Categorias /></Protected>} />
        <Route path="/admin/produtos" element={<Protected role="admin"><Produtos /></Protected>} />
        <Route path="/admin/clientes" element={<Protected role="admin"><Clientes /></Protected>} />
        <Route path="/admin/entregadores" element={<Protected role="admin"><Entregadores /></Protected>} />
        <Route path="/admin/veiculos" element={<Protected role="admin"><Veiculos /></Protected>} />
        <Route path="/admin/avaliacoes" element={<Protected role="admin"><Avaliacoes /></Protected>} />
        <Route path="/admin/relatorios" element={<Protected role="admin"><Relatorios /></Protected>} />
        <Route path="/admin/entregas" element={<Protected role="admin"><Entregas /></Protected>} />

        <Route path="/cliente/cardapio" element={<Protected role="cliente"><Cardapio /></Protected>} />
        <Route path="/cliente/meus-pedidos" element={<Protected role="cliente"><MeusPedidos /></Protected>} />

        <Route path="/cozinha/painel" element={<Protected role="cozinha"><CozinhaPainel /></Protected>} />

        <Route path="/entregador/painel" element={<Protected role="entregador"><EntregadorPainel /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
