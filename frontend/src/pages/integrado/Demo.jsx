import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, API_URL, apiAtivo } from '../../services/api'

// -----------------------------------------------------------------------------
// Seção INTEGRADA (frontend ↔ backend real via VITE_API_URL)
// Usada na apresentação: Cadastro (Produtos), Processo (Entrega, RN01/RN02) e
// Relatórios. Todas as chamadas batem na API do backend.
// -----------------------------------------------------------------------------

const box = { border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fff' }
const th = { textAlign: 'left', borderBottom: '2px solid #eee', padding: '6px 8px', fontSize: 13, color: '#555' }
const td = { borderBottom: '1px solid #f0f0f0', padding: '6px 8px', fontSize: 14 }
const btn = { padding: '8px 14px', borderRadius: 6, border: 'none', background: '#e63946', color: '#fff', cursor: 'pointer', fontWeight: 600 }
const btnGhost = { ...btn, background: '#f1f3f5', color: '#333' }
const input = { padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }

function Banner({ msg }) {
  if (!msg) return null
  const ok = msg.tipo === 'ok'
  return (
    <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 12, background: ok ? '#e7f6ec' : '#fdecea', color: ok ? '#1b5e20' : '#b71c1c', border: `1px solid ${ok ? '#a5d6a7' : '#f5c6cb'}` }}>
      {ok ? '✅ ' : '❌ '}{msg.texto}
    </div>
  )
}

// ─── Cadastro de Produtos ─────────────────────────────────────────────────────
function ProdutosDemo() {
  const vazio = { id: null, nome: '', descricao: '', preco: '', categoriaId: '', disponivel: true }
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(vazio)
  const [erroForm, setErroForm] = useState('')
  const [msg, setMsg] = useState(null)

  async function carregar() {
    try {
      const [p, c] = await Promise.all([api.produtos.listar(), api.categorias.listar()])
      setProdutos(p || [])
      setCategorias(c || [])
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }
  useEffect(() => { carregar() }, [])

  function validarFront() {
    if (!form.nome.trim()) return 'Nome é obrigatório (validação do frontend).'
    if (!form.categoriaId) return 'Categoria é obrigatória (validação do frontend).'
    if (!form.preco || Number(form.preco) <= 0) return 'Preço deve ser maior que zero (validação do frontend).'
    return ''
  }

  async function salvar(e) {
    e.preventDefault()
    const err = validarFront()
    setErroForm(err)
    if (err) return
    try {
      const payload = {
        nome: form.nome.trim(), descricao: form.descricao,
        preco: Number(form.preco), categoriaId: Number(form.categoriaId),
        disponivel: form.disponivel,
      }
      if (form.id) await api.produtos.atualizar(form.id, payload)
      else await api.produtos.criar(payload)
      setMsg({ tipo: 'ok', texto: form.id ? 'Produto atualizado!' : 'Produto criado!' })
      setForm(vazio); carregar()
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  async function testarBackend() {
    // Envia payload inválido de propósito para evidenciar a validação do BACKEND
    try {
      await api.produtos.criar({ preco: 0 })
      setMsg({ tipo: 'erro', texto: 'Backend aceitou (inesperado).' })
    } catch (e) { setMsg({ tipo: 'erro', texto: `Backend rejeitou: ${e.message}` }) }
  }

  async function excluir(id) {
    try { await api.produtos.remover(id); setMsg({ tipo: 'ok', texto: 'Produto removido.' }); carregar() }
    catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  return (
    <div>
      <Banner msg={msg} />
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>{form.id ? 'Editar produto' : 'Novo produto'}</h3>
        <form onSubmit={salvar} style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
          <div><label>Nome</label><input style={input} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
          <div><label>Categoria</label>
            <select style={input} value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
              <option value="">— selecione —</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div><label>Preço (R$)</label><input style={input} type="number" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} /></div>
          <div><label>Disponível</label>
            <select style={input} value={form.disponivel ? '1' : '0'} onChange={e => setForm({ ...form, disponivel: e.target.value === '1' })}>
              <option value="1">Ativo</option><option value="0">Inativo</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / 3' }}><label>Descrição</label><input style={input} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
          {erroForm && <div style={{ gridColumn: '1 / 3', color: '#b71c1c' }}>⚠️ {erroForm}</div>}
          <div style={{ gridColumn: '1 / 3', display: 'flex', gap: 8 }}>
            <button style={btn} type="submit">{form.id ? 'Salvar alteração' : 'Inserir'}</button>
            {form.id && <button style={btnGhost} type="button" onClick={() => setForm(vazio)}>Cancelar</button>}
            <button style={btnGhost} type="button" onClick={testarBackend} title="Envia dados inválidos direto à API">
              Testar validação do backend
            </button>
          </div>
        </form>
      </div>

      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Produtos ({produtos.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>ID</th><th style={th}>Nome</th><th style={th}>Categoria</th><th style={th}>Preço</th><th style={th}>Status</th><th style={th}>Ações</th></tr></thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td style={td}>{p.id}</td>
                <td style={td}>{p.nome}</td>
                <td style={td}>{p.categoria?.nome || p.categoriaId}</td>
                <td style={td}>R$ {Number(p.preco).toFixed(2)}</td>
                <td style={td}>{p.disponivel ? 'Ativo' : 'Inativo'}</td>
                <td style={td}>
                  <button style={{ ...btnGhost, padding: '4px 8px', marginRight: 6 }} onClick={() => setForm({ id: p.id, nome: p.nome, descricao: p.descricao || '', preco: p.preco, categoriaId: p.categoriaId, disponivel: p.disponivel })}>Editar</button>
                  <button style={{ ...btn, padding: '4px 8px' }} onClick={() => excluir(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Processo de Entrega (RN01 / RN02) ────────────────────────────────────────
function EntregaDemo() {
  const [entregadores, setEntregadores] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [entregas, setEntregas] = useState([])
  const [selEnt, setSelEnt] = useState('')
  const [selPedidos, setSelPedidos] = useState([])
  const [jornada, setJornada] = useState(null)
  const [msg, setMsg] = useState(null)

  async function carregar() {
    try {
      const [e, p, en] = await Promise.all([api.entregadores.listar(), api.pedidos.listar(), api.entregas.listar()])
      setEntregadores(e || []); setPedidos(p || []); setEntregas(en || [])
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }
  useEffect(() => { carregar() }, [])

  async function escolherEntregador(id) {
    setSelEnt(id); setJornada(null)
    if (!id) return
    try { setJornada(await api.entregas.jornada(id)) } catch { /* ignora */ }
  }

  function togglePedido(id) {
    setSelPedidos(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function criar() {
    if (!selEnt) { setMsg({ tipo: 'erro', texto: 'Selecione um entregador.' }); return }
    if (selPedidos.length === 0) { setMsg({ tipo: 'erro', texto: 'Selecione ao menos um pedido.' }); return }
    try {
      await api.entregas.criar(Number(selEnt), selPedidos)
      setMsg({ tipo: 'ok', texto: 'Entrega criada com sucesso! (respeitou RN01 ≤5 e RN02 jornada)' })
      setSelPedidos([]); carregar(); escolherEntregador(selEnt)
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  async function demonstrarRN01() {
    if (!selEnt) { setMsg({ tipo: 'erro', texto: 'Selecione um entregador primeiro.' }); return }
    const ids = pedidos.slice(0, 6).map(p => p.id) // força 6 > 5
    try {
      await api.entregas.criar(Number(selEnt), ids)
      setMsg({ tipo: 'erro', texto: 'Backend aceitou 6 (inesperado).' })
    } catch (e) { setMsg({ tipo: 'erro', texto: `RN01 aplicada pelo backend: ${e.message}` }) }
  }

  async function acao(id, tipo) {
    try {
      if (tipo === 'iniciar') await api.entregas.iniciar(id)
      if (tipo === 'finalizar') await api.entregas.finalizar(id)
      setMsg({ tipo: 'ok', texto: `Entrega ${id}: ${tipo} ok.` }); carregar()
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  return (
    <div>
      <Banner msg={msg} />
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Nova entrega</h3>
        <div style={{ marginBottom: 10 }}>
          <label>Entregador (precisa estar <b>ativo</b>) </label>
          <select style={{ ...input, maxWidth: 320 }} value={selEnt} onChange={e => escolherEntregador(e.target.value)}>
            <option value="">— selecione —</option>
            {entregadores.map(e => <option key={e.id} value={e.id}>{e.nomeCompleto} — {e.status}</option>)}
          </select>
        </div>

        {jornada && (
          <div style={{ background: '#f8f9fa', padding: 10, borderRadius: 6, marginBottom: 10, fontSize: 14 }}>
            <b>RN02 — Jornada (24h):</b> trabalhadas {jornada.horasTrabalhadas ?? '0.00'}h ·
            disponíveis {jornada.horasDisponiveis ?? '8.00'}h ·
            limite atingido: {jornada.limiteAtingido ? 'SIM 🚫' : 'não'}
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label><b>Pedidos</b> (RN01: máximo 5)</label>
          <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
            {pedidos.map(p => (
              <label key={p.id} style={{ display: 'block', fontSize: 14, padding: '2px 0' }}>
                <input type="checkbox" checked={selPedidos.includes(p.id)} onChange={() => togglePedido(p.id)} />
                {' '}Pedido #{p.id} — status {p.status} — R$ {Number(p.total || 0).toFixed(2)}
              </label>
            ))}
          </div>
          <small>Selecionados: {selPedidos.length}</small>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} onClick={criar}>Criar entrega (inserção com sucesso)</button>
          <button style={btnGhost} onClick={demonstrarRN01}>Demonstrar bloqueio RN01 (6 pedidos)</button>
        </div>
      </div>

      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Entregas ({entregas.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>ID</th><th style={th}>Entregador</th><th style={th}>Status</th><th style={th}>Pedidos</th><th style={th}>Ações</th></tr></thead>
          <tbody>
            {entregas.map(e => (
              <tr key={e.id}>
                <td style={td}>{e.id}</td>
                <td style={td}>{e.entregador?.nomeCompleto || e.entregadorId}</td>
                <td style={td}>{e.status}</td>
                <td style={td}>{(e.pedidos || []).map(p => `#${p.id}`).join(', ') || '—'}</td>
                <td style={td}>
                  {e.status === 'AGUARDANDO' && <button style={{ ...btnGhost, padding: '4px 8px', marginRight: 6 }} onClick={() => acao(e.id, 'iniciar')}>Iniciar</button>}
                  {e.status === 'EM_ROTA' && <button style={{ ...btn, padding: '4px 8px' }} onClick={() => acao(e.id, 'finalizar')}>Finalizar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Relatórios ───────────────────────────────────────────────────────────────
// Componente genérico de relatório: carrega, mostra resumo e uma tabela.
function Relatorio({ titulo, carregar, colunas, getLista, getResumo }) {
  const [dado, setDado] = useState(null)
  const [erro, setErro] = useState(null)
  async function run() {
    try { setErro(null); setDado(await carregar()) } catch (e) { setErro(e.message) }
  }
  useEffect(() => { run() }, [])
  const lista = dado ? (getLista(dado) || []) : []
  return (
    <div style={box}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{titulo}</h3>
        <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={run}>Atualizar</button>
      </div>
      {erro && <div style={{ color: '#b71c1c', marginTop: 8 }}>❌ {erro}</div>}
      {dado && getResumo && <p style={{ fontSize: 14 }}>{getResumo(dado)}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{colunas.map(c => <th key={c.h} style={th}>{c.h}</th>)}</tr></thead>
        <tbody>
          {lista.map((l, i) => (
            <tr key={i}>{colunas.map(c => <td key={c.h} style={td}>{c.v(l)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const HOJE = new Date().toISOString().split('T')[0]
const INI = '2020-01-01'

// Relatórios por pessoa (cada um com os 2 do seu processo/cadastro)
const RELATORIOS = {
  joao: {
    label: 'João — Pedidos/Produtos', itens: [
      { titulo: 'Relatório de Pedidos', carregar: () => api.relatorios.pedidos(), getLista: d => d.pedidos, getResumo: d => `Total: ${d.totalPedidos} · Entregues: ${d.entregues} · Receita: R$ ${d.receitaTotal}`, colunas: [{ h: 'ID', v: l => l.id }, { h: 'Cliente', v: l => l.clienteNome }, { h: 'Status', v: l => l.status }, { h: 'Itens', v: l => l.totalItens }, { h: 'Total', v: l => `R$ ${Number(l.total || 0).toFixed(2)}` }] },
      { titulo: 'Relatório de Produtos', carregar: () => api.relatorios.produtos(), getLista: d => d.produtos, getResumo: d => `Total de produtos: ${d.total}`, colunas: [{ h: 'ID', v: l => l.id }, { h: 'Nome', v: l => l.nome }, { h: 'Categoria', v: l => l.categoria }, { h: 'Preço', v: l => `R$ ${Number(l.preco).toFixed(2)}` }, { h: 'Estoque', v: l => l.estoque }, { h: 'Ativo', v: l => (l.disponivel ? 'Sim' : 'Não') }] },
    ],
  },
  renan: {
    label: 'Renan — Pagamentos/Clientes', itens: [
      { titulo: 'Relatório de Pagamentos', carregar: () => api.relatorios.pagamentos(), getLista: d => d.pagamentos, getResumo: d => `Total: ${d.totalPagamentos} · Aprovados: ${d.totalAprovados} · Receita: R$ ${d.receitaTotal}`, colunas: [{ h: 'ID', v: l => l.id }, { h: 'Pedido', v: l => `#${l.pedidoId}` }, { h: 'Cliente', v: l => l.clienteNome }, { h: 'Forma', v: l => l.forma }, { h: 'Status', v: l => l.status }, { h: 'Valor', v: l => `R$ ${Number(l.valor || 0).toFixed(2)}` }] },
      { titulo: 'Relatório de Clientes', carregar: () => api.relatorios.clientes(), getLista: d => d.clientes, getResumo: d => `Total: ${d.totalClientes} · Ativos: ${d.totalAtivos}`, colunas: [{ h: 'ID', v: l => l.id }, { h: 'Nome', v: l => l.nomeCompleto }, { h: 'E-mail', v: l => l.email }, { h: 'Pedidos', v: l => l.totalPedidos }, { h: 'Gasto', v: l => `R$ ${l.totalGasto}` }] },
    ],
  },
  rui: {
    label: 'Rui — Entrega', itens: [
      { titulo: 'Relatório de Entregas Concluídas', carregar: () => api.relatorios.entregasConcluidas(), getLista: d => d.porEntregador, getResumo: d => `Total de entregas: ${d.totalGeral} · Entregadores: ${d.totalEntregadores}`, colunas: [{ h: 'Entregador', v: l => l.entregador }, { h: 'Status', v: l => l.statusEntregador }, { h: 'Total entregas', v: l => l.totalEntregas }] },
      { titulo: 'Relatório de Horas Trabalhadas (RN02)', carregar: () => api.relatorios.horasTrabalhadas(), getLista: d => d.porEntregador, getResumo: d => `Entregadores: ${d.totalEntregadores} · No limite de 8h: ${d.entregadoresComLimiteAtingido}`, colunas: [{ h: 'Entregador', v: l => l.entregador }, { h: 'Horas trab.', v: l => l.horasTrabalhadas }, { h: 'Horas disp.', v: l => l.horasDisponiveis }, { h: 'Limite 8h?', v: l => (l.limiteJornadaAtingido ? 'SIM 🚫' : 'não') }] },
    ],
  },
  antonio: {
    label: 'Antônio — Avaliação', itens: [
      { titulo: 'Avaliações por Bairro', carregar: () => api.relatorios.avaliacoesPorBairro(INI, HOJE), getLista: d => d, getResumo: () => 'Média de notas por bairro (pior entrega primeiro)', colunas: [{ h: 'Bairro', v: l => l.bairro }, { h: 'Cidade', v: l => l.cidade }, { h: 'Avaliações', v: l => l.totalAvaliacoes }, { h: 'Média comida', v: l => l.mediaNotaComida }, { h: 'Média entrega', v: l => l.mediaNotaEntrega }] },
      { titulo: 'Desempenho de Entregadores', carregar: () => api.relatorios.desempenhoEntregadores(INI, HOJE), getLista: d => d, getResumo: () => 'Notas e avaliações negativas por entregador', colunas: [{ h: 'Entregador', v: l => l.nomeEntregador }, { h: 'Status', v: l => l.status }, { h: 'Entregas', v: l => l.totalEntregas }, { h: 'Avaliações', v: l => l.totalAvaliacoes }, { h: 'Média entrega', v: l => l.mediaNotaEntrega }, { h: 'Negativas', v: l => l.totalAvaliacoesNegativas }] },
    ],
  },
}

function RelatoriosDemo() {
  const [quem, setQuem] = useState('joao')
  const subBtn = (id) => (
    <button key={id} onClick={() => setQuem(id)} style={{ ...btnGhost, padding: '6px 10px', background: quem === id ? '#457b9d' : '#f1f3f5', color: quem === id ? '#fff' : '#333' }}>{RELATORIOS[id].label}</button>
  )
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.keys(RELATORIOS).map(subBtn)}
      </div>
      {RELATORIOS[quem].itens.map((r, i) => (
        <Relatorio key={i} {...r} />
      ))}
    </div>
  )
}

// ─── Processo de Pedidos (RN01 / RN02) ────────────────────────────────────────
function PedidosDemo() {
  const [clientes, setClientes] = useState([])
  const [enderecos, setEnderecos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [selCliente, setSelCliente] = useState('')
  const [selEndereco, setSelEndereco] = useState('')
  const [forma, setForma] = useState('pix')
  const [qtds, setQtds] = useState({}) // produtoId -> quantidade
  const [msg, setMsg] = useState(null)

  async function carregar() {
    try {
      const [c, e, p, pe] = await Promise.all([
        api.clientes.listar(), api.enderecos.listar(), api.produtos.listar(), api.pedidos.listar(),
      ])
      setClientes(c || []); setEnderecos(e || [])
      setProdutos((p || []).filter(x => x.disponivel && x.estoque > 0))
      setPedidos(pe || [])
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }
  useEffect(() => { carregar() }, [])

  const enderecosDoCliente = enderecos.filter(e => String(e.clienteId) === String(selCliente))
  const itens = produtos.filter(p => qtds[p.id] > 0).map(p => ({ produtoId: p.id, quantidade: Number(qtds[p.id]) }))
  const subtotal = produtos.reduce((s, p) => s + (qtds[p.id] > 0 ? Number(p.preco) * qtds[p.id] : 0), 0)

  async function criar(forcarBarato) {
    try {
      let corpoItens = itens
      if (forcarBarato) {
        const barato = [...produtos].sort((a, b) => a.preco - b.preco)[0]
        corpoItens = barato ? [{ produtoId: barato.id, quantidade: 1 }] : []
      }
      if (!selCliente) return setMsg({ tipo: 'erro', texto: 'Selecione um cliente.' })
      if (!selEndereco) return setMsg({ tipo: 'erro', texto: 'Selecione um endereço do cliente.' })
      if (corpoItens.length === 0) return setMsg({ tipo: 'erro', texto: 'Selecione ao menos um produto.' })
      const r = await api.pedidos.criar({
        clienteId: Number(selCliente), enderecoEntregaId: Number(selEndereco),
        formaPagamento: forma, itens: corpoItens,
      })
      setMsg({ tipo: 'ok', texto: `Pedido #${r.id} criado (total R$ ${Number(r.total).toFixed(2)})! Respeitou RN01 e RN02.` })
      setQtds({}); carregar()
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  return (
    <div>
      <Banner msg={msg} />
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Novo pedido</h3>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
          <div><label>Cliente</label>
            <select style={input} value={selCliente} onChange={e => { setSelCliente(e.target.value); setSelEndereco('') }}>
              <option value="">— selecione —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nomeCompleto}</option>)}
            </select>
          </div>
          <div><label>Endereço (do cliente)</label>
            <select style={input} value={selEndereco} onChange={e => setSelEndereco(e.target.value)}>
              <option value="">— selecione —</option>
              {enderecosDoCliente.map(e => <option key={e.id} value={e.id}>{e.rua}, {e.numero} — {e.bairro}</option>)}
            </select>
          </div>
          <div><label>Forma de pagamento</label>
            <select style={input} value={forma} onChange={e => setForma(e.target.value)}>
              <option value="pix">Pix</option><option value="credito">Crédito</option><option value="debito">Débito</option>
            </select>
          </div>
          <div style={{ alignSelf: 'end', fontWeight: 700 }}>Subtotal itens: R$ {subtotal.toFixed(2)} <small style={{ color: subtotal >= 30 ? '#2e7d32' : '#b71c1c' }}>(RN02: mín. R$ 30)</small></div>
        </div>
        <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8, margin: '10px 0' }}>
          {produtos.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
              <span style={{ fontSize: 14 }}>{p.nome} — R$ {Number(p.preco).toFixed(2)}</span>
              <input type="number" min="0" style={{ ...input, width: 70 }} value={qtds[p.id] || ''} onChange={e => setQtds({ ...qtds, [p.id]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} onClick={() => criar(false)}>Criar pedido (sucesso)</button>
          <button style={btnGhost} onClick={() => criar(true)}>Demonstrar RN02 (itens &lt; R$30)</button>
        </div>
        <p style={{ fontSize: 13, color: '#666' }}>💡 RN01: criar um 2º pedido para o mesmo cliente enquanto o 1º está <b>aguardando</b> → o backend bloqueia.</p>
      </div>
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Pedidos ({pedidos.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>ID</th><th style={th}>Cliente</th><th style={th}>Status</th><th style={th}>Total</th></tr></thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}><td style={td}>{p.id}</td><td style={td}>{p.cliente?.nomeCompleto || p.clienteId}</td><td style={td}>{p.status}</td><td style={td}>R$ {Number(p.total || 0).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Processo de Pagamentos (RN01 / RN02) ─────────────────────────────────────
function PagamentosDemo() {
  const [pedidos, setPedidos] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [selPedido, setSelPedido] = useState('')
  const [forma, setForma] = useState('pix')
  const [status, setStatus] = useState('aprovado')
  const [msg, setMsg] = useState(null)

  async function carregar() {
    try {
      const [pe, pg] = await Promise.all([api.pedidos.listar(), api.pagamentos.listar()])
      setPedidos(pe || []); setPagamentos(pg || [])
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }
  useEffect(() => { carregar() }, [])

  async function criar() {
    if (!selPedido) return setMsg({ tipo: 'erro', texto: 'Selecione um pedido.' })
    try {
      const r = await api.pagamentos.criar({ pedidoId: Number(selPedido), forma, status })
      setMsg({ tipo: 'ok', texto: `Pagamento #${r.id} criado (${status})!` })
      carregar()
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  return (
    <div>
      <Banner msg={msg} />
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Novo pagamento</h3>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div><label>Pedido</label>
            <select style={input} value={selPedido} onChange={e => setSelPedido(e.target.value)}>
              <option value="">— selecione —</option>
              {pedidos.map(p => <option key={p.id} value={p.id}>#{p.id} — {p.status} — R$ {Number(p.total || 0).toFixed(2)}</option>)}
            </select>
          </div>
          <div><label>Forma</label>
            <select style={input} value={forma} onChange={e => setForma(e.target.value)}>
              <option value="pix">Pix</option><option value="credito">Crédito</option><option value="debito">Débito</option>
            </select>
          </div>
          <div><label>Status</label>
            <select style={input} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="aprovado">Aprovado</option><option value="pendente">Pendente</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 10 }}><button style={btn} onClick={criar}>Criar pagamento</button></div>
        <p style={{ fontSize: 13, color: '#666' }}>
          💡 <b>RN02</b>: aprovar um 2º pagamento no mesmo pedido → backend bloqueia.<br />
          💡 <b>RN01</b>: pedido criado há mais de 15 min → "prazo expirado". Para um pagamento
          com <b>sucesso</b>, crie um pedido novo na aba <b>Pedidos</b> e pague em seguida.
        </p>
      </div>
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Pagamentos ({pagamentos.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>ID</th><th style={th}>Pedido</th><th style={th}>Forma</th><th style={th}>Status</th></tr></thead>
          <tbody>
            {pagamentos.map(p => (
              <tr key={p.id}><td style={td}>{p.id}</td><td style={td}>#{p.pedidoId}</td><td style={td}>{p.forma}</td><td style={td}>{p.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Processo de Avaliação (RN01 / RN02) ──────────────────────────────────────
function AvaliacaoDemo() {
  const [pedidos, setPedidos] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [selPedido, setSelPedido] = useState('')
  const [notaComida, setNotaComida] = useState(5)
  const [notaEntrega, setNotaEntrega] = useState(5)
  const [comentario, setComentario] = useState('')
  const [msg, setMsg] = useState(null)

  async function carregar() {
    try {
      const [pe, av] = await Promise.all([api.pedidos.listar(), api.avaliacoes.listar()])
      setPedidos(pe || []); setAvaliacoes(av || [])
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }
  useEffect(() => { carregar() }, [])

  async function criar() {
    if (!selPedido) return setMsg({ tipo: 'erro', texto: 'Selecione um pedido.' })
    const pedido = pedidos.find(p => String(p.id) === String(selPedido))
    try {
      await api.avaliacoes.criar({
        pedidoId: Number(selPedido), clienteId: pedido?.clienteId,
        notaComida: Number(notaComida), notaEntrega: Number(notaEntrega), comentario,
      })
      setMsg({ tipo: 'ok', texto: 'Avaliação registrada com sucesso!' })
      setComentario(''); carregar()
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  return (
    <div>
      <Banner msg={msg} />
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Nova avaliação</h3>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div><label>Pedido (entrega concluída)</label>
            <select style={input} value={selPedido} onChange={e => setSelPedido(e.target.value)}>
              <option value="">— selecione —</option>
              {pedidos.map(p => <option key={p.id} value={p.id}>#{p.id} — {p.status}</option>)}
            </select>
          </div>
          <div><label>Nota comida (1–5)</label>
            <select style={input} value={notaComida} onChange={e => setNotaComida(e.target.value)}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}</select>
          </div>
          <div><label>Nota entrega (1–5)</label>
            <select style={input} value={notaEntrega} onChange={e => setNotaEntrega(e.target.value)}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}</select>
          </div>
          <div style={{ gridColumn: '1 / 4' }}><label>Comentário</label><input style={input} value={comentario} onChange={e => setComentario(e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10 }}><button style={btn} onClick={criar}>Enviar avaliação</button></div>
        <p style={{ fontSize: 13, color: '#666' }}>
          💡 <b>RN02</b>: só avalia <b>após 7 dias</b> da confirmação da entrega. No seed, o
          <b> pedido #6</b> foi concluído há 8 dias → sucesso; os outros (recém-concluídos) → bloqueio.<br />
          💡 <b>RN01</b>: com ≥ 50 avaliações e média &lt; 2, o entregador é desligado (status → inativo).
        </p>
      </div>
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Avaliações ({avaliacoes.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>ID</th><th style={th}>Pedido</th><th style={th}>Comida</th><th style={th}>Entrega</th><th style={th}>Comentário</th></tr></thead>
          <tbody>
            {avaliacoes.map(a => (
              <tr key={a.id}><td style={td}>{a.id}</td><td style={td}>#{a.pedidoId}</td><td style={td}>{a.notaComida}</td><td style={td}>{a.notaEntrega}</td><td style={td}>{a.comentario}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── CRUD genérico (Clientes, Entregadores, Veículos, Categorias) ─────────────
function CrudGenerico({ recurso, campos, colunas }) {
  const [lista, setLista] = useState([])
  const [opts, setOpts] = useState({})
  const [form, setForm] = useState({})
  const [erroForm, setErroForm] = useState('')
  const [msg, setMsg] = useState(null)

  async function carregar() {
    try {
      setLista((await recurso.listar()) || [])
      for (const c of campos.filter(c => c.ref)) {
        const r = (await c.ref.listar()) || []
        setOpts(o => ({ ...o, [c.name]: r.map(x => ({ value: x.id, label: c.refLabel(x) })) }))
      }
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }
  useEffect(() => { carregar() }, [])

  function validarFront() {
    for (const c of campos.filter(c => c.required)) {
      if (c.soCriar && form.id) continue
      const v = form[c.name]
      if (v === undefined || v === '' || v === null) return `${c.label} é obrigatório (validação do frontend).`
    }
    return ''
  }

  function montarPayload() {
    const p = {}
    for (const c of campos) {
      let v = form[c.name]
      if (c.soCriar && form.id) continue           // não reenvia senha na edição
      if (v === undefined || v === '') continue
      if (c.type === 'number') v = Number(v)
      if (c.type === 'bool') v = v === true || v === 'true'
      p[c.name] = v
    }
    return p
  }

  async function salvar(e) {
    e.preventDefault()
    const err = validarFront(); setErroForm(err); if (err) return
    try {
      const payload = montarPayload()
      if (form.id) await recurso.atualizar(form.id, payload)
      else await recurso.criar(payload)
      setMsg({ tipo: 'ok', texto: form.id ? 'Registro atualizado!' : 'Registro criado!' })
      setForm({}); carregar()
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  async function testarBackend() {
    try { await recurso.criar({}); setMsg({ tipo: 'erro', texto: 'Backend aceitou vazio (inesperado).' }) }
    catch (e) { setMsg({ tipo: 'erro', texto: `Backend rejeitou: ${e.message}` }) }
  }

  async function excluir(id) {
    try { await recurso.remover(id); setMsg({ tipo: 'ok', texto: 'Registro removido.' }); carregar() }
    catch (e) { setMsg({ tipo: 'erro', texto: e.message }) }
  }

  function valorCampo(c) {
    const v = form[c.name]
    return v === undefined || v === null ? '' : v
  }

  return (
    <div>
      <Banner msg={msg} />
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>{form.id ? 'Editar' : 'Novo registro'}</h3>
        <form onSubmit={salvar} style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
          {campos.map(c => (
            <div key={c.name}>
              <label>{c.label}{c.required ? ' *' : ''}</label>
              {c.type === 'select' || c.type === 'bool' || c.ref ? (
                <select style={input} value={String(valorCampo(c))} onChange={e => setForm({ ...form, [c.name]: e.target.value })}>
                  <option value="">— selecione —</option>
                  {(c.type === 'bool' ? [{ value: 'true', label: 'Ativo/Sim' }, { value: 'false', label: 'Inativo/Não' }] : (c.options || opts[c.name] || [])).map(o => (
                    <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input style={input} type={c.type === 'number' ? 'number' : 'text'} value={valorCampo(c)} onChange={e => setForm({ ...form, [c.name]: e.target.value })} />
              )}
            </div>
          ))}
          {erroForm && <div style={{ gridColumn: '1 / 3', color: '#b71c1c' }}>⚠️ {erroForm}</div>}
          <div style={{ gridColumn: '1 / 3', display: 'flex', gap: 8 }}>
            <button style={btn} type="submit">{form.id ? 'Salvar alteração' : 'Inserir'}</button>
            {form.id && <button style={btnGhost} type="button" onClick={() => setForm({})}>Cancelar</button>}
            <button style={btnGhost} type="button" onClick={testarBackend}>Testar validação do backend</button>
          </div>
        </form>
      </div>
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>Registros ({lista.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{colunas.map(col => <th key={col.name} style={th}>{col.label}</th>)}<th style={th}>Ações</th></tr></thead>
          <tbody>
            {lista.map(row => (
              <tr key={row.id}>
                {colunas.map(col => <td key={col.name} style={td}>{col.render ? col.render(row) : String(row[col.name] ?? '')}</td>)}
                <td style={td}>
                  <button style={{ ...btnGhost, padding: '4px 8px', marginRight: 6 }} onClick={() => setForm(row)}>Editar</button>
                  <button style={{ ...btn, padding: '4px 8px' }} onClick={() => excluir(row.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CADASTROS = {
  clientes: {
    campos: [
      { name: 'nomeCompleto', label: 'Nome completo', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text', required: true },
      { name: 'cpf', label: 'CPF', type: 'text', required: true },
      { name: 'senha', label: 'Senha', type: 'text', required: true, soCriar: true },
      { name: 'ativo', label: 'Ativo', type: 'bool' },
    ],
    colunas: [
      { name: 'id', label: 'ID' }, { name: 'nomeCompleto', label: 'Nome' },
      { name: 'email', label: 'E-mail' }, { name: 'cpf', label: 'CPF' },
      { name: 'ativo', label: 'Ativo', render: r => (r.ativo ? 'Sim' : 'Não') },
    ],
  },
  entregadores: {
    campos: [
      { name: 'nomeCompleto', label: 'Nome completo', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text', required: true },
      { name: 'cpf', label: 'CPF', type: 'text', required: true },
      { name: 'cnh', label: 'CNH', type: 'text', required: true },
      { name: 'tipoVeiculo', label: 'Tipo de veículo', type: 'select', required: true, options: [{ value: 'moto', label: 'Moto' }, { value: 'bicicleta', label: 'Bicicleta' }, { value: 'carro', label: 'Carro' }] },
      { name: 'senha', label: 'Senha', type: 'text', required: true, soCriar: true },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }, { value: 'em_entrega', label: 'Em entrega' }] },
    ],
    colunas: [
      { name: 'id', label: 'ID' }, { name: 'nomeCompleto', label: 'Nome' },
      { name: 'tipoVeiculo', label: 'Veículo' }, { name: 'status', label: 'Status' },
      { name: 'totalAvaliacoes', label: 'Avaliações' },
    ],
  },
  veiculos: {
    campos: [
      { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [{ value: 'moto', label: 'Moto' }, { value: 'bicicleta', label: 'Bicicleta' }, { value: 'carro', label: 'Carro' }] },
      { name: 'modelo', label: 'Modelo', type: 'text', required: true },
      { name: 'placa', label: 'Placa', type: 'text' },
      { name: 'cor', label: 'Cor', type: 'text', required: true },
      { name: 'ano', label: 'Ano', type: 'number', required: true },
      { name: 'renavan', label: 'Renavam', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'disponivel', label: 'Disponível' }, { value: 'em_uso', label: 'Em uso' }, { value: 'manutencao', label: 'Manutenção' }, { value: 'indisponivel', label: 'Indisponível' }] },
    ],
    colunas: [
      { name: 'id', label: 'ID' }, { name: 'tipo', label: 'Tipo' },
      { name: 'modelo', label: 'Modelo' }, { name: 'placa', label: 'Placa' },
      { name: 'status', label: 'Status' },
      { name: 'entregador', label: 'Entregador', render: r => r.entregador?.nomeCompleto || '—' },
    ],
  },
  categorias: {
    campos: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'descricao', label: 'Descrição', type: 'text' },
      { name: 'ordem', label: 'Ordem', type: 'number' },
      { name: 'ativo', label: 'Ativo', type: 'bool' },
    ],
    colunas: [
      { name: 'id', label: 'ID' }, { name: 'nome', label: 'Nome' },
      { name: 'descricao', label: 'Descrição' }, { name: 'ordem', label: 'Ordem' },
      { name: 'ativo', label: 'Ativo', render: r => (r.ativo ? 'Sim' : 'Não') },
    ],
  },
}

function CadastrosDemo() {
  const [sub, setSub] = useState('produtos')
  const subBtn = (id, label) => (
    <button onClick={() => setSub(id)} style={{ ...btnGhost, padding: '6px 10px', background: sub === id ? '#457b9d' : '#f1f3f5', color: sub === id ? '#fff' : '#333' }}>{label}</button>
  )
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {subBtn('produtos', 'Produtos')}
        {subBtn('clientes', 'Clientes')}
        {subBtn('entregadores', 'Entregadores')}
        {subBtn('veiculos', 'Veículos')}
        {subBtn('categorias', 'Categorias')}
      </div>
      {sub === 'produtos' && <ProdutosDemo />}
      {sub === 'clientes' && <CrudGenerico recurso={api.clientes} {...CADASTROS.clientes} />}
      {sub === 'entregadores' && <CrudGenerico recurso={api.entregadores} {...CADASTROS.entregadores} />}
      {sub === 'veiculos' && <CrudGenerico recurso={api.veiculos} {...CADASTROS.veiculos} />}
      {sub === 'categorias' && <CrudGenerico recurso={api.categorias} {...CADASTROS.categorias} />}
    </div>
  )
}

export default function Demo() {
  const [aba, setAba] = useState('cadastros')
  const tabBtn = (id, label) => (
    <button onClick={() => setAba(id)} style={{ ...btnGhost, background: aba === id ? '#e63946' : '#f1f3f5', color: aba === id ? '#fff' : '#333' }}>{label}</button>
  )
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>TurboFood — Demonstração integrada</h1>
        <Link to="/" style={{ color: '#e63946' }}>← voltar</Link>
      </div>
      <p style={{ fontSize: 13, color: apiAtivo ? '#2e7d32' : '#b71c1c' }}>
        API: {apiAtivo ? API_URL : 'VITE_API_URL não definida — configure o .env do frontend para ligar ao backend'}
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabBtn('cadastros', 'Cadastros')}
        {tabBtn('pedidos', 'Pedidos (João)')}
        {tabBtn('pagamentos', 'Pagamentos (Renan)')}
        {tabBtn('entrega', 'Entrega (Rui)')}
        {tabBtn('avaliacao', 'Avaliação (Antônio)')}
        {tabBtn('relatorios', 'Relatórios')}
      </div>
      {aba === 'cadastros' && <CadastrosDemo />}
      {aba === 'pedidos' && <PedidosDemo />}
      {aba === 'pagamentos' && <PagamentosDemo />}
      {aba === 'entrega' && <EntregaDemo />}
      {aba === 'avaliacao' && <AvaliacaoDemo />}
      {aba === 'relatorios' && <RelatoriosDemo />}
    </div>
  )
}
