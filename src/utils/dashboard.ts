import { formatCompactDate } from '@/utils/format'
import type {
  BreakdownItem,
  DashboardFilters,
  DashboardSummary,
  InsightItem,
  OrderRecord,
} from '@/types/dashboard'

function groupRecords(
  records: OrderRecord[],
  keySelector: (record: OrderRecord) => string,
  limit?: number,
) {
  const grouped = new Map<string, BreakdownItem>()

  records.forEach((record) => {
    const key = keySelector(record) || 'Não informado'
    const current = grouped.get(key)

    if (current) {
      current.orders += 1
      current.value += record.orderValue
      return
    }

    grouped.set(key, {
      label: key,
      orders: 1,
      value: record.orderValue,
    })
  })

  const items = Array.from(grouped.values()).sort((left, right) => right.value - left.value)
  return typeof limit === 'number' ? items.slice(0, limit) : items
}

function calculateShare(value: number, total: number) {
  return total > 0 ? value / total : 0
}

function getInsights(records: OrderRecord[], summary: Omit<DashboardSummary, 'insights'>) {
  const insights: InsightItem[] = []
  const biggestDay = [...summary.dailySeries].sort((left, right) => right.revenue - left.revenue)[0]
  const leadingBranch = summary.topBranches[0]
  const leadingClient = summary.topClients[0]
  const topFiveBranchShare = calculateShare(
    summary.topBranches.slice(0, 5).reduce((accumulator, item) => accumulator + item.value, 0),
    summary.totalRevenue,
  )

  if (biggestDay) {
    insights.push({
      title: 'Pico diário de faturamento',
      description: `${biggestDay.label} concentrou ${Math.round(biggestDay.orders)} pedidos e ${Math.round(biggestDay.avgTicket)} de ticket médio, sinalizando presença de grandes negociações.`,
      tone: 'success',
    })
  }

  if (leadingBranch) {
    insights.push({
      title: 'Concentração por filial',
      description: `${leadingBranch.label} lidera com ${leadingBranch.orders} pedidos e ${Math.round(calculateShare(leadingBranch.value, summary.totalRevenue) * 100)}% da receita total.`,
      tone: topFiveBranchShare > 0.55 ? 'warning' : 'info',
    })
  }

  if (summary.campoOrders > 0) {
    insights.push({
      title: 'Ticket médio maior no Campo',
      description: `O ticket médio fora da filial (Campo) é de ${Math.round(summary.campoAvgTicket)}, enquanto o do balcão é ${Math.round(summary.balcaoAvgTicket)}.`,
      tone: summary.campoAvgTicket > summary.balcaoAvgTicket ? 'success' : 'info',
    })
  }

  if (summary.geoCoverage === 0) {
    insights.push({
      title: 'Alerta: Sem Geolocalização',
      description: '100% dos pedidos realizados fora da Filial (Campo) carecem de dados de geolocalização, representando um risco para auditorias externas.',
      tone: 'warning',
    })
  }

  if (leadingClient) {
    insights.push({
      title: 'Dependência de grandes contas',
      description: `${leadingClient.label} aparece entre os principais clientes, reforçando a necessidade de monitorar concentração comercial por conta.`,
      tone: 'info',
    })
  }

  return insights.slice(0, 5)
}

export function filterOrders(records: OrderRecord[], filters: DashboardFilters) {
  const searchTerm = filters.search.trim().toLocaleLowerCase('pt-BR')

  return records.filter((record) => {
    if (filters.startDate && record.date < filters.startDate) {
      return false
    }

    if (filters.endDate && record.date > filters.endDate) {
      return false
    }

    if (filters.branch !== 'all' && record.branch !== filters.branch) {
      return false
    }

    if (filters.seller !== 'all' && record.sellerName !== filters.seller) {
      return false
    }

    if (filters.status !== 'all' && record.status !== filters.status) {
      return false
    }

    if (filters.saleLocation !== 'all' && record.saleLocation !== filters.saleLocation) {
      return false
    }

    if (!searchTerm) {
      return true
    }

    return [
      record.orderNumber,
      record.erpOrderNumber,
      record.accountName,
      record.memberId,
      record.branch,
      record.sellerName,
    ]
      .join(' ')
      .toLocaleLowerCase('pt-BR')
      .includes(searchTerm)
  })
}

function getWeekday(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const dateObj = new Date(Date.UTC(year, month - 1, day))
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return weekdays[dateObj.getUTCDay()]
}

function getTicketRange(val: number) {
  if (val <= 100) return 'Até R$100'
  if (val <= 500) return 'R$100-500'
  if (val <= 1000) return 'R$500-1k'
  if (val <= 5000) return 'R$1k-5k'
  if (val <= 10000) return 'R$5k-10k'
  if (val <= 50000) return 'R$10k-50k'
  return 'R$50k+'
}

export function buildDashboardSummary(records: OrderRecord[]): DashboardSummary {
  const totalRevenue = records.reduce((accumulator, record) => accumulator + record.orderValue, 0)
  const totalOrders = records.length
  
  const balcaoRecords = records.filter((record) => record.saleLocation === 'Filial')
  const campoRecords = records.filter((record) => record.saleLocation === 'Fora da Filial')

  const balcaoRevenue = balcaoRecords.reduce((accumulator, record) => accumulator + record.orderValue, 0)
  const balcaoOrders = balcaoRecords.length
  const balcaoAvgTicket = balcaoOrders > 0 ? balcaoRevenue / balcaoOrders : 0

  const campoRevenue = campoRecords.reduce((accumulator, record) => accumulator + record.orderValue, 0)
  const campoOrders = campoRecords.length
  const campoAvgTicket = campoOrders > 0 ? campoRevenue / campoOrders : 0

  const integratedRevenue = records
    .filter((record) => record.status === 'Integrado')
    .reduce((accumulator, record) => accumulator + record.orderValue, 0)
  
  const geoCoverage = calculateShare(
    records.filter((record) => Boolean(record.geoInfo)).length,
    totalOrders,
  )

  const dailySeries = Array.from(
    records.reduce((grouped, record) => {
      const monthKey = record.date.substring(0, 7) || 'Indefinido'
      const current = grouped.get(monthKey)
      const isBalcao = record.saleLocation === 'Filial'
      const isCampo = record.saleLocation === 'Fora da Filial'

      if (current) {
        current.orders += 1
        current.revenue += record.orderValue
        current.avgTicket = current.revenue / current.orders
        if (isBalcao) {
          current.balcaoRevenue += record.orderValue
          current.balcaoOrders += 1
        } else if (isCampo) {
          current.campoRevenue += record.orderValue
          current.campoOrders += 1
        }
        return grouped
      }

      const [year, month] = monthKey.split('-')
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
      const label = monthNames[Number(month) - 1] ? `${monthNames[Number(month) - 1]} ${year}` : monthKey

      grouped.set(monthKey, {
        date: monthKey,
        label,
        revenue: record.orderValue,
        orders: 1,
        avgTicket: record.orderValue,
        balcaoRevenue: isBalcao ? record.orderValue : 0,
        campoRevenue: isCampo ? record.orderValue : 0,
        balcaoOrders: isBalcao ? 1 : 0,
        campoOrders: isCampo ? 1 : 0,
      })

      return grouped
    }, new Map<string, { date: string; label: string; revenue: number; orders: number; avgTicket: number; balcaoRevenue: number; campoRevenue: number; balcaoOrders: number; campoOrders: number }>())
    .values(),
  ).sort((left, right) => left.date.localeCompare(right.date))

  // 1. Padrão Semanal
  const weekdaysOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const weekdayMap = new Map<string, { balcaoOrders: number; campoOrders: number; balcaoRevenue: number; campoRevenue: number }>(
    weekdaysOrder.map(w => [w, { balcaoOrders: 0, campoOrders: 0, balcaoRevenue: 0, campoRevenue: 0 }])
  )
  records.forEach(r => {
    const w = getWeekday(r.date)
    const accum = weekdayMap.get(w)
    if (accum) {
      if (r.saleLocation === 'Filial') {
        accum.balcaoOrders += 1
        accum.balcaoRevenue += r.orderValue
      } else if (r.saleLocation === 'Fora da Filial') {
        accum.campoOrders += 1
        accum.campoRevenue += r.orderValue
      }
    }
  })
  const weekdaySeries = weekdaysOrder.map(w => {
    const accum = weekdayMap.get(w) || { balcaoOrders: 0, campoOrders: 0, balcaoRevenue: 0, campoRevenue: 0 }
    const totalOrders = accum.balcaoOrders + accum.campoOrders
    return {
      label: w,
      value: totalOrders,
      orders: totalOrders,
      balcaoOrders: accum.balcaoOrders,
      campoOrders: accum.campoOrders,
      balcaoRevenue: accum.balcaoRevenue,
      campoRevenue: accum.campoRevenue
    }
  })

  // 2. Faixas de Valor
  const rangesOrder = [
    'Até R$100',
    'R$100-500',
    'R$500-1k',
    'R$1k-5k',
    'R$5k-10k',
    'R$10k-50k',
    'R$50k+'
  ]
  const ticketRanges = rangesOrder.map(range => ({
    range,
    balcao: 0,
    campo: 0
  }))
  records.forEach(r => {
    const rangeStr = getTicketRange(r.orderValue)
    const item = ticketRanges.find(x => x.range === rangeStr)
    if (item) {
      if (r.saleLocation === 'Filial') {
        item.balcao++
      } else if (r.saleLocation === 'Fora da Filial') {
        item.campo++
      }
    }
  })

  // 3. Status dos Pedidos por Canal
  const statusMap = new Map<string, { status: string; balcao: number; campo: number }>()
  statusMap.set('Integrado', { status: 'Integrado', balcao: 0, campo: 0 })
  statusMap.set('Fechado', { status: 'Fechado', balcao: 0, campo: 0 })
  records.forEach(r => {
    let item = statusMap.get(r.status)
    if (!item) {
      item = { status: r.status, balcao: 0, campo: 0 }
      statusMap.set(r.status, item)
    }
    if (r.saleLocation === 'Filial') {
      item.balcao++
    } else if (r.saleLocation === 'Fora da Filial') {
      item.campo++
    }
  })
  const statusComparison = Array.from(statusMap.values())

  // 4. Análise por Filial
  const branchMap = new Map<string, {
    name: string
    orders: number
    balcaoOrders: number
    campoOrders: number
    balcaoRevenue: number
    campoRevenue: number
    campoPercent: number
    totalRevenue: number
    avgTicket: number
  }>()
  records.forEach(r => {
    const name = r.branch || 'Não informado'
    let item = branchMap.get(name)
    if (!item) {
      item = {
        name,
        orders: 0,
        balcaoOrders: 0,
        campoOrders: 0,
        balcaoRevenue: 0,
        campoRevenue: 0,
        campoPercent: 0,
        totalRevenue: 0,
        avgTicket: 0
      }
      branchMap.set(name, item)
    }
    item.orders++
    if (r.saleLocation === 'Filial') {
      item.balcaoOrders++
      item.balcaoRevenue += r.orderValue
    } else if (r.saleLocation === 'Fora da Filial') {
      item.campoOrders++
      item.campoRevenue += r.orderValue
    }
  })
  const branchAnalysis = Array.from(branchMap.values()).map(b => {
    const totalRevenue = b.balcaoRevenue + b.campoRevenue
    const campoPercent = b.orders > 0 ? (b.campoOrders / b.orders) * 100 : 0
    const avgTicket = b.orders > 0 ? totalRevenue / b.orders : 0
    return {
      ...b,
      totalRevenue,
      campoPercent,
      avgTicket
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)

  // 5. Análise por Vendedor
  const sellerMap = new Map<string, {
    name: string
    balcaoRevenue: number
    campoRevenue: number
    totalRevenue: number
    balcaoOrders: number
    campoOrders: number
    totalOrders: number
    avgTicket: number
  }>()
  records.forEach(r => {
    const name = r.sellerName || 'Não informado'
    let item = sellerMap.get(name)
    if (!item) {
      item = {
        name,
        balcaoRevenue: 0,
        campoRevenue: 0,
        totalRevenue: 0,
        balcaoOrders: 0,
        campoOrders: 0,
        totalOrders: 0,
        avgTicket: 0
      }
      sellerMap.set(name, item)
    }
    item.totalOrders++
    if (r.saleLocation === 'Filial') {
      item.balcaoOrders++
      item.balcaoRevenue += r.orderValue
    } else if (r.saleLocation === 'Fora da Filial') {
      item.campoOrders++
      item.campoRevenue += r.orderValue
    }
  })
  const sellerAnalysis = Array.from(sellerMap.values()).map(s => {
    const totalRevenue = s.balcaoRevenue + s.campoRevenue
    const avgTicket = s.totalOrders > 0 ? totalRevenue / s.totalOrders : 0
    return {
      ...s,
      totalRevenue,
      avgTicket
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)

  // 6. Vendedores com Maior Potencial de Campo
  const potentialSellers = sellerAnalysis
    .filter(s => s.campoOrders === 0)
    .map(s => ({
      name: s.name,
      balcaoRevenue: s.balcaoRevenue,
      totalOrders: s.totalOrders
    }))
    .sort((a, b) => b.balcaoRevenue - a.balcaoRevenue)

  const summaryWithoutInsights = {
    totalOrders,
    totalRevenue,
    avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    uniqueClients: new Set(records.map((record) => record.memberId)).size,
    uniqueBranches: new Set(records.map((record) => record.branch)).size,
    uniqueSellers: new Set(records.map((record) => record.sellerName)).size,
    integratedShare: calculateShare(integratedRevenue, totalRevenue),
    outsideShare: calculateShare(campoRevenue, totalRevenue),
    geoCoverage,
    statusBreakdown: groupRecords(records, (record) => record.status),
    saleLocationBreakdown: groupRecords(records, (record) => record.saleLocation),
    topBranches: groupRecords(records, (record) => record.branch, 8),
    topSellers: groupRecords(records, (record) => record.sellerName, 8),
    topClients: groupRecords(records, (record) => record.accountName, 8),
    dailySeries,
    biggestOrders: [...records]
      .sort((left, right) => right.orderValue - left.orderValue)
      .slice(0, 8),
    balcaoRevenue,
    balcaoOrders,
    balcaoAvgTicket,
    campoRevenue,
    campoOrders,
    campoAvgTicket,
    weekdaySeries,
    ticketRanges,
    statusComparison,
    branchAnalysis,
    sellerAnalysis,
    potentialSellers,
  }

  return {
    ...summaryWithoutInsights,
    insights: getInsights(records, summaryWithoutInsights),
  }
}
