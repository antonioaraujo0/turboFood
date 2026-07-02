import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

const EMPTY = { nome: '', descricao: '' }

export default function Categorias() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const categorias = state.categorias.filter(c =>
    !search || c.nome.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(c) { setForm({ nome: c.nome, descricao: c.descricao }); setModal(c) }
  function closeModal() { setModal(null); setForm(EMPTY) }

  function save() {
    if (!form.nome.trim()) return
    if (modal === 'add') {
      dispatch({ type: 'ADD_CATEGORIA', payload: { id: Date.now(), ...form } })
      toast('Categoria cadastrada!')
    } else {
      dispatch({ type: 'UPDATE_CATEGORIA', payload: { ...modal, ...form } })
      toast('Categoria atualizada!')
    }
    closeModal()
  }

  function deleteCategoria(id) {
    dispatch({ type: 'DELETE_CATEGORIA', payload: id })
    toast('Categoria excluida', 'danger')
    setConfirmDelete(null)
  }

  const produtosPorCategoria = (catId) => state.produtos.filter(p => p.categoriaId === catId).length

  return (
    <AdminLayout title="🏷️ Categorias" subtitle="Gerencie as categorias do cardápio">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar categoria..." />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Nova Categoria</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Produtos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td className="font-semibold">{c.nome}</td>
                  <td className="text-sm text-muted">{c.descricao}</td>
                  <td><span className="badge badge-info">{produtosPorCategoria(c.id)} produtos</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>✏️</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(c)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 32 }}>Nenhuma categoria encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">🏷️ {modal === 'add' ? 'Nova Categoria' : 'Editar Categoria'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-3">
                <label className="form-label req">Nome</label>
                <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Pizzas" />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-control" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição da categoria..." rows={3} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>💾 Salvar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <span className="modal-title">🗑️ Excluir Categoria</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Excluir a categoria <strong>{confirmDelete.nome}</strong>? Os produtos vinculados perderão a categoria.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => deleteCategoria(confirmDelete.id)}>🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
