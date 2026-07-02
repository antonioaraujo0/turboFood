import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

const EMPTY = { tipo: 'moto', placa: '', modelo: '', ano: '', cor: '', renavam: '' }
const TIPO_ICON = { moto: '🛵', carro: '🚗', bicicleta: '🚲', patinete: '🛴' }

export default function Veiculos() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const veiculos = state.veiculos.filter(v =>
    !search ||
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    v.placa.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(v) {
    setForm({ tipo: v.tipo, placa: v.placa, modelo: v.modelo, ano: v.ano, cor: v.cor, renavam: v.renavam || '' })
    setModal(v)
  }

  function save() {
    if (!form.modelo.trim() || !form.placa.trim()) return
    if (modal === 'add') {
      dispatch({ type: 'ADD_VEICULO', payload: { id: Date.now(), ...form } })
      toast('Veículo cadastrado!')
    } else {
      dispatch({ type: 'UPDATE_VEICULO', payload: { ...modal, ...form } })
      toast('Veículo atualizado!')
    }
    setModal(null)
  }

  function deleteVeiculo(id) {
    dispatch({ type: 'DELETE_VEICULO', payload: id })
    toast('Veículo excluído', 'danger')
    setConfirmDelete(null)
  }

  const entregadorDoVeiculo = (id) => state.entregadores.find(e => e.veiculoId === id)

  return (
    <AdminLayout title="🚗 Veículos" subtitle="Gerencie a frota de veículos">
      <div className="stats-grid stats-grid-3 mb-4">
        <div className="stat-card"><div className="stat-icon orange">🚗</div><div><div className="stat-value">{state.veiculos.length}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🛵</div><div><div className="stat-value">{state.veiculos.filter(v => v.tipo === 'moto').length}</div><div className="stat-label">Motos</div></div></div>
        <div className="stat-card"><div className="stat-icon green">🚗</div><div><div className="stat-value">{state.veiculos.filter(v => v.tipo === 'carro').length}</div><div className="stat-label">Carros</div></div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por modelo ou placa..." />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Novo Veículo</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Placa</th>
                <th>Ano</th>
                <th>Cor</th>
                <th>RENAVAM</th>
                <th>Entregador</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map(v => {
                const entregador = entregadorDoVeiculo(v.id)
                return (
                  <tr key={v.id}>
                    <td style={{ fontSize: '1.4rem' }} title={v.tipo}>{TIPO_ICON[v.tipo] || '🚗'}</td>
                    <td className="font-semibold">{v.modelo}</td>
                    <td><span className="badge badge-gray">{v.placa || '—'}</span></td>
                    <td>{v.ano}</td>
                    <td>{v.cor}</td>
                    <td className="text-sm text-muted">{v.renavam || '—'}</td>
                    <td>
                      {entregador
                        ? <span className="badge badge-orange">{entregador.nome.split(' ')[0]}</span>
                        : <span className="text-muted text-xs">Disponível</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(v)}>✏️</button>
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(v)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {veiculos.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 32 }}>Nenhum veículo encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">🚗 {modal === 'add' ? 'Novo Veículo' : 'Editar Veículo'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label req">Tipo</label>
                  <select className="form-control" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="moto">🛵 Moto</option>
                    <option value="carro">🚗 Carro</option>
                    <option value="bicicleta">🚲 Bicicleta</option>
                    <option value="patinete">🛴 Patinete</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label req">Modelo</label>
                  <input className="form-control" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} placeholder="Ex: Honda CG 160" />
                </div>
                <div className="form-group">
                  <label className="form-label req">Placa</label>
                  <input className="form-control" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} placeholder="ABC-1234" />
                </div>
                <div className="form-group">
                  <label className="form-label req">Ano</label>
                  <input className="form-control" value={form.ano} onChange={e => setForm({ ...form, ano: e.target.value })} placeholder="2023" />
                </div>
                <div className="form-group">
                  <label className="form-label req">Cor</label>
                  <input className="form-control" value={form.cor} onChange={e => setForm({ ...form, cor: e.target.value })} placeholder="Vermelho" />
                </div>
                <div className="form-group">
                  <label className="form-label">RENAVAM</label>
                  <input className="form-control" value={form.renavam} onChange={e => setForm({ ...form, renavam: e.target.value })} placeholder="00000000000" />
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
              <span className="modal-title">🗑️ Excluir Veículo</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body"><p>Excluir o veículo <strong>{confirmDelete.modelo}</strong> ({confirmDelete.placa})?</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => deleteVeiculo(confirmDelete.id)}>🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
