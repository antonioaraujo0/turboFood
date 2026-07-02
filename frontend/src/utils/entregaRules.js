export const MAX_PEDIDOS_POR_ENTREGA = 5
export const MAX_HORAS_CONSECUTIVAS = 8
export const ALERTA_HORAS = 6
const BREAK_MS = 30 * 60 * 1000 // gap de 30min reseta o bloco

export function calcularHorasConsecutivas(entregadorId, entregas) {
  const agora = Date.now()
  const historico = entregas
    .filter(e => e.entregadorId === entregadorId && e.dataInicio && e.status !== 'cancelada')
    .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))

  if (!historico.length) return 0

  let inicioBloco = new Date(historico[0].dataInicio).getTime()
  let ultimoFim = historico[0].dataFim ? new Date(historico[0].dataFim).getTime() : agora

  for (let i = 1; i < historico.length; i++) {
    const inicio = new Date(historico[i].dataInicio).getTime()
    const fim = historico[i].dataFim ? new Date(historico[i].dataFim).getTime() : agora
    if (inicio - ultimoFim > BREAK_MS) inicioBloco = inicio
    ultimoFim = fim
  }

  const fimAtual = historico[historico.length - 1].dataFim
    ? new Date(historico[historico.length - 1].dataFim).getTime()
    : agora

  return (fimAtual - inicioBloco) / 3600000
}

export function getAlertLevel(horas) {
  if (horas >= MAX_HORAS_CONSECUTIVAS) return 'danger'
  if (horas >= ALERTA_HORAS) return 'warning'
  return 'ok'
}

export function formatHoras(horas) {
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  return `${h}h ${m < 10 ? '0' : ''}${m}m`
}

export function validarCriacaoEntrega(entregadorId, entregas) {
  const horas = calcularHorasConsecutivas(entregadorId, entregas)
  if (horas >= MAX_HORAS_CONSECUTIVAS) {
    return { valido: false, motivo: `Entregador atingiu ${formatHoras(horas)} de trabalho consecutivo (limite: ${MAX_HORAS_CONSECUTIVAS}h). Necessario descanso.` }
  }
  return { valido: true, horas }
}
