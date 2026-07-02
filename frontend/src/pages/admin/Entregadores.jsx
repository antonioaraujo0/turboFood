import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

const EMPTY = { nome: '', email: '', telefone: '', cpf: '', cnh: '', categoriaCnh: 'A', validadeCnh: '', veiculoId: '', status: 'disponivel', senha: '' }
const STATUS_CLS = { disponivel: 'badge-success', em_entrega: 'badge-info', inativo: 'badge-warning' }
const STATUS_LABEL = { disponivel: '✓ Disponível', em_entrega: '🛵 Em Entrega', inativo: '⏸ Inativo' }

export default function Entregadores() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const entregadores = state.entregadores.filter(e => {
    const matchSearch = !search ||
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      e.cpf.includes(search) ||
      e.cnh.includes(search)
    const matchStatus = !filterStatus || e.status === filterStatus
    return matchSearch && matchStatus
  })

  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(e) {
    setForm({
      nome: e.nome, email: e.email, telefone: e.telefone, cpf: e.cpf,
      cnh: e.cnh, categoriaCnh: e.categoriaCnh || 'A', validadeCnh: e.validadeCnh || '',
      veiculoId: String(e.veiculoId || ''), status: e.status, senha: e.senha || ''
    })
    setModal(e)
  }

  function save() {
    if (!form.nome.trim() || !form.cpf.trim()) return
    const data = { ...form, veiculoId: form.veiculoId ? Number(form.veiculoId) : null }
    if (modal === 'add') {
      dispatch({ type: 'ADD_ENTREGADOR', payload: { id: Date.now(), ...data } })
      toast('Entregador cadastrado!')
    } else {
      dispatch({ type: 'UPDATE_ENTREGADOR', payload: { ...modal, ...data } })
      toast('Entregador atualizado!')
    }
    setModal(null)
  }

  const entregasPorEntregador = (id) => state.entregas.filter(e => e.entregadorId === id && e.status === 'entregue').length

  return (
    <AdminLayout title="🛵 Entregadores" subtitle="Gerencie a equipe de entrega">
      <div className="stats-grid stats-grid-4 mb-4">
        <div className="stat-card"><div className="stat-icon green">🛵</div><div><div className="stat-value">{state.entregadores.filter(e => e.status === 'disponivel').length}</div><div className="stat-label">Disponíveis</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">📦</div><div><div className="stat-value">{state.entregadores.filter(e => e.status === 'em_entrega').length}</div><div className="stat-label">Em Entrega</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏸</div><div><div className="stat-value">{state.entregadores.filter(e => e.status === 'inativo').length}</div><div className="stat-label">Inativos</div></div></div>
        <div className="stat-card"><div className="stat-icon orange">👥</div><div><div className="stat-value">{state.entregadores.length}</div><div className="stat-label">Total</div></div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar entregador..." />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="disponivel">Disponível</option>
            <option value="em_entrega">Em Entrega</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Novo Entregador</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Entregador</th>
                <th>CPF</th>
                <th>CNH</th>
                <th>Veículo</th>
                <th>Entregas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {entregadores.map(e => {
                const veiculo = state.veiculos.find(v => v.id === e.veiculoId)
                const initials = e.nome.split(' ').map(w => w[0]).slice(0, 2).join('')
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-orange">{initials}</div>
                        <div>
                          <div className="font-semibold">{e.nome}</div>
                          <div className="text-xs text-muted">📞 {e.telefone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{e.cpf}</td>
                    <td className="text-sm">{e.cnh} <span className="badge badge-gray">{e.categoriaCnh}</span></td>
                    <td className="text-sm">{veiculo ? `${veiculo.modelo} • ${veiculo.placa}` : <span className="text-muted">Sem veículo</span>}</td>
                    <td><span className="badge badge-info">{entregasPorEntregador(e.id)}</span></td>
                    <td><span className={`badge ${STATUS_CLS[e.status]}`}>{STATUS_LABEL[e.status]}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(e)}>✏️</button>
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(e)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {entregadores.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 32 }}>Nenhum entregador encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">🛵 {modal === 'add' ? 'Novo Entregador' : 'Editar Entregador'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group col-span-2">
                  <label className="form-label req">Nome Completo</label>
                  <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
                </div>
                <div className="form-group">
                  <label className="form-label req">CPF</label>
                  <input className="form-control" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
                </div>
                <div className="form-group">
                  <label className="form-label req">CNH</label>
                  <input className="form-control" value={form.cnh} onChange={e => setForm({ ...form, cnh: e.target.value })} placeholder="Número da CNH" />
                </div>
                <div className="form-group">
                  <label className="form-label req">Categoria CNH</label>
                  <select className="form-control" value={form.categoriaCnh} onChange={e => setForm({ ...form, categoriaCnh: e.target.value })}>
                    <option value="A">A – Moto</option>
                    <option value="B">B – Carro</option>
                    <option value="AB">AB – Moto e Carro</option>
                    <option value="C">C – Caminhão</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Validade CNH</label>
                  <input className="form-control" type="date" value={form.validadeCnh} onChange={e => setForm({ ...form, validadeCnh: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label req">Telefone</label>
                  <input className="form-control" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 9 9999-9999" />
                </div>
                <div className="form-group">
                  <label className="form-label req">E-mail</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Veículo</label>
                  <select className="form-control" value={form.veiculoId} onChange={e => setForm({ ...form, veiculoId: e.target.value })}>
                    <option value="">Nenhum veículo vinculado</option>
                    {state.veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} – {v.placa}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="disponivel">✓ Disponível</option>
                    <option value="em_entrega">🛵 Em Entrega</option>
                    <option value="inativo">⏸ Inativo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label req">Senha de Acesso</label>
                  <input className="form-control" type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Mínimo 3 caracteres" />
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
              <span className="modal-title">🗑️ Excluir Entregador</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body"><p>Excluir o entregador <strong>{confirmDelete.nome}</strong>?</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { dispatch({ type: 'DELETE_ENTREGADOR', payload: confirmDelete.id }); toast('Entregador excluído', 'danger'); setConfirmDelete(null) }}>🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
