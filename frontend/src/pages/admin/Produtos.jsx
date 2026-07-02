import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

const EMPTY = { nome: '', descricao: '', preco: '', categoriaId: '', status: 'ativo', emoji: '🍕' }
const EMOJIS = ['🍕', '🍔', '🌮', '🥤', '🧃', '💧', '🍰', '🍨', '🎁', '🍟', '🌭', '🍜', '🥗', '🍣']

export default function Produtos() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const produtos = state.produtos.filter(p => {
    const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || String(p.categoriaId) === filterCat
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(p) {
    setForm({ nome: p.nome, descricao: p.descricao, preco: String(p.preco), categoriaId: String(p.categoriaId), status: p.status, emoji: p.emoji || '🍕' })
    setModal(p)
  }

  function save() {
    if (!form.nome.trim() || !form.preco) return
    const data = { ...form, preco: parseFloat(form.preco), categoriaId: Number(form.categoriaId) }
    if (modal === 'add') {
      dispatch({ type: 'ADD_PRODUTO', payload: { id: Date.now(), ...data } })
      toast('Produto cadastrado!')
    } else {
      dispatch({ type: 'UPDATE_PRODUTO', payload: { ...modal, ...data } })
      toast('Produto atualizado!')
    }
    setModal(null)
  }

  function toggleStatus(id) {
    dispatch({ type: 'TOGGLE_PRODUTO_STATUS', payload: id })
    toast('Status do produto alterado!', 'info')
  }

  return (
    <AdminLayout title="🍕 Produtos" subtitle="Gerencie o cardápio">
      <div className="stats-grid stats-grid-3 mb-4">
        <div className="stat-card"><div className="stat-icon orange">🍕</div><div><div className="stat-value">{state.produtos.length}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div><div className="stat-value">{state.produtos.filter(p => p.status === 'ativo').length}</div><div className="stat-label">Ativos</div></div></div>
        <div className="stat-card"><div className="stat-icon red">⛔</div><div><div className="stat-value">{state.produtos.filter(p => p.status === 'inativo').length}</div><div className="stat-label">Inativos</div></div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {state.categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Novo Produto</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => {
                const cat = state.categorias.find(c => c.id === p.categoriaId)
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ fontSize: '1.5rem' }}>{p.emoji}</div>
                        <div>
                          <div className="font-semibold">{p.nome}</div>
                          <div className="text-xs text-muted">{p.descricao?.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{cat?.nome || 'N/A'}</span></td>
                    <td className="font-semibold text-primary">R$ {p.preco.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.status === 'ativo' ? 'badge-success' : 'badge-danger'}`}>
                        {p.status === 'ativo' ? '✅ Ativo' : '⛔ Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>✏️</button>
                        <button
                          className={`btn btn-sm ${p.status === 'ativo' ? 'btn-secondary' : 'btn-success'}`}
                          onClick={() => toggleStatus(p.id)}
                          title={p.status === 'ativo' ? 'Desativar' : 'Ativar'}
                        >
                          {p.status === 'ativo' ? '⛔' : '✅'}
                        </button>
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(p)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {produtos.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 32 }}>Nenhum produto encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">🍕 {modal === 'add' ? 'Novo Produto' : 'Editar Produto'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group col-span-2">
                  <label className="form-label req">Nome</label>
                  <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome do produto" />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Descrição</label>
                  <textarea className="form-control" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={2} placeholder="Ingredientes e detalhes..." />
                </div>
                <div className="form-group">
                  <label className="form-label req">Preço (R$)</label>
                  <input className="form-control" type="number" step="0.01" min="0" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label className="form-label req">Categoria</label>
                  <select className="form-control" value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
                    <option value="">Selecione...</option>
                    {state.categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="ativo">✅ Ativo</option>
                    <option value="inativo">⛔ Inativo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <select className="form-control" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })}>
                    {EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
                  </select>
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
              <span className="modal-title">🗑️ Excluir Produto</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Excluir o produto <strong>{confirmDelete.nome}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { dispatch({ type: 'DELETE_PRODUTO', payload: confirmDelete.id }); toast('Produto excluído', 'danger'); setConfirmDelete(null) }}>🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
