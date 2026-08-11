import { describe, expect, it } from 'vitest'

import { parseOrdersCsv } from '@/utils/csv'
import { buildDashboardSummary, filterOrders } from '@/utils/dashboard'

const sampleCsv = `"Data de início do pedido";"Número do pedido";"Número do Pedido ERP";"Matricula do cooperado";"Nome da conta";"Filial";"Código do vendedor 01";"Vendedor 01";"Informação da Geolocalização";"Local de Venda";"Status";"Valor do pedido"
"05/06/2026";"0001";"ERP1";"123";"Cliente A";"L01";"10";"Vendedor A";"";"Filial";"Integrado";"1.000,50"
"06/06/2026";"0002";"ERP2";"124";"Cliente B";"L02";"11";"Vendedor B";"";"Fora da Filial";"Fechado";"2.500,00"
"06/06/2026";"0003";"ERP3";"123";"Cliente A";"L01";"10";"Vendedor A";"";"Filial";"Integrado";"500,00"`

describe('parseOrdersCsv', () => {
  it('converte datas, valores e campos vazios corretamente', () => {
    const records = parseOrdersCsv(sampleCsv)

    expect(records).toHaveLength(3)
    expect(records[0]).toMatchObject({
      date: '2026-06-04',
      orderNumber: '0001',
      accountName: 'Cliente A',
      orderValue: 1000.5,
      geoInfo: null,
    })
  })
})

describe('filterOrders', () => {
  it('aplica filtros combinados de status, filial e busca textual', () => {
    const records = parseOrdersCsv(sampleCsv)
    const filtered = filterOrders(records, {
      startDate: '2026-06-04',
      endDate: '2026-06-05',
      branch: 'L01',
      seller: 'all',
      status: 'Integrado',
      saleLocation: 'all',
      search: 'cliente a',
    })

    expect(filtered).toHaveLength(2)
    expect(filtered.every((record) => record.branch === 'L01')).toBe(true)
  })
})

describe('buildDashboardSummary', () => {
  it('gera indicadores agregados e ordena os maiores pedidos', () => {
    const records = parseOrdersCsv(sampleCsv)
    const summary = buildDashboardSummary(records)

    expect(summary.totalOrders).toBe(3)
    expect(summary.totalRevenue).toBeCloseTo(4000.5, 2)
    expect(summary.uniqueClients).toBe(2)
    expect(summary.outsideShare).toBeCloseTo(2500 / 4000.5, 4)
    expect(summary.topBranches[0].label).toBe('L02')
    expect(summary.biggestOrders[0].orderNumber).toBe('0002')
    expect(summary.dailySeries.map((item) => item.date)).toEqual(['2026-06'])
    
    // Novas métricas de canal
    expect(summary.balcaoRevenue).toBeCloseTo(1500.5, 2)
    expect(summary.balcaoOrders).toBe(2)
    expect(summary.balcaoAvgTicket).toBeCloseTo(750.25, 2)
    expect(summary.campoRevenue).toBeCloseTo(2500.0, 2)
    expect(summary.campoOrders).toBe(1)
    expect(summary.campoAvgTicket).toBeCloseTo(2500.0, 2)

    // Série temporal subdividida por mês
    const monthPoint = summary.dailySeries.find(d => d.date === '2026-06')
    expect(monthPoint).toBeDefined()
    expect(monthPoint?.balcaoRevenue).toBeCloseTo(1500.5, 2)
    expect(monthPoint?.campoRevenue).toBeCloseTo(2500.0, 2)
    expect(monthPoint?.balcaoOrders).toBe(2)
    expect(monthPoint?.campoOrders).toBe(1)

    expect(summary.insights.length).toBeGreaterThan(0)
  })
})
