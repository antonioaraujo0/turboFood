import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

const EMPTY = { nome: '', email: '', telefone: '', cpf: '', endereco: '', cidade: '', cep: '' }

export default function Clientes() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const clientes = state.clientes.filter(c =>
    !search ||
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf.includes(search)
  )

  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(c) {
    setForm({ nome: c.nome, email: c.email, telefone: c.telefone, cpf: c.cpf, endereco: c.endereco, cidade: c.cidade || '', cep: c.cep || '' })
    setModal(c)
  }

  function save() {
    if (!form.nome.trim() || !form.email.trim()) return
    if (modal === 'add') {
      dispatch({ type: 'ADD_CLIENTE', payload: { id: Date.now(), ...form } })
      toast('Cliente cadastrado!')
    } else {
      dispatch({ type: 'UPDATE_CLIENTE', payload: { ...modal, ...form } })
      toast('Cliente atualizado!')
    }
    setModal(null)
  }

  const pedidosPorCliente = (id) => state.pedidos.filter(p => p.clienteId === id).length
  const avaliacoesPorCliente = (id) => state.avaliacoes.filter(a => a.clienteId === id)

  return (
    <AdminLayout title="👥 Clientes" subtitle="Gerencie a base de clientes">
      <div className="stats-grid stats-grid-3 mb-4">
        <div className="stat-card"><div className="stat-icon blue">👥</div><div><div className="stat-value">{state.clientes.length}</div><div className="stat-label">Total de Clientes</div></div></div>
        <div className="stat-card"><div className="stat-icon green">📋</div><div><div className="stat-value">{state.pedidos.length}</div><div className="stat-label">Pedidos Totais</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⭐</div><div><div className="stat-value">{state.avaliacoes.length}</div><div className="stat-label">Avaliações</div></div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..." />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Novo Cliente</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Pedidos</th>
                <th>Avaliações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => {
                const initials = c.nome.split(' ').map(w => w[0]).slice(0, 2).join('')
                const avs = avaliacoesPorCliente(c.id)
                const mediaAv = avs.length ? (avs.reduce((s, a) => s + a.nota, 0) / avs.length).toFixed(1) : null
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-blue">{initials}</div>
                        <div>
                          <div className="font-semibold">{c.nome}</div>
                          <div className="text-xs text-muted">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{c.cpf}</td>
                    <td className="text-sm">{c.telefone}</td>
                    <td className="text-sm text-muted">{c.endereco}</td>
                    <td><span className="badge badge-info">{pedidosPorCliente(c.id)}</span></td>
                    <td>{mediaAv ? <span>⭐ {mediaAv}</span> : <span className="text-muted text-xs">—</span>}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(c)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {clientes.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 32 }}>Nenhum cliente encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">👥 {modal === 'add' ? 'Novo Cliente' : 'Editar Cliente'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group col-span-2">
                  <label className="form-label req">Nome Completo</label>
                  <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
                </div>
                <div className="form-group">
                  <label className="form-label req">E-mail</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                </div>
                <div className="form-group">
                  <label className="form-label req">CPF</label>
                  <input className="form-control" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
                </div>
                <div className="form-group">
                  <label className="form-label req">Telefone</label>
                  <input className="form-control" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 9 9999-9999" />
                </div>
                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input className="form-control" value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Endereço</label>
                  <input className="form-control" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número e bairro" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-control" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>💾 Salvar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">🗑️ Excluir Cliente</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Excluir o cliente <strong>{confirmDelete.nome}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { dispatch({ type: 'DELETE_CLIENTE', payload: confirmDelete.id }); toast('Cliente excluído', 'danger'); setConfirmDelete(null) }}>🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
