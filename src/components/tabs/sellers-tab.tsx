import { useState, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

import type { DashboardSummary } from '@/types/dashboard'
import { formatCurrency, formatNumber } from '@/utils/format'

type SellersTabProps = {
  summary: DashboardSummary
}

const COLOR_BALCAO = '#1b432e'
const COLOR_CAMPO = '#ea580c'

function formatShortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 2) return fullName

  const firstName = parts[0]
  const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e']
  
  let lastIndex = parts.length - 1
  while (lastIndex > 0 && prepositions.includes(parts[lastIndex].toLowerCase())) {
    lastIndex--
  }

  if (lastIndex === 0) {
    return firstName
  }

  return `${firstName} ${parts[lastIndex]}`
}

function getSellerProfile(campoRevenue: number, totalRevenue: number) {
  if (totalRevenue === 0) return 'Inativo'
  const share = (campoRevenue / totalRevenue) * 100
  if (share === 0) return 'Especialista Filial'
  if (share > 50) return 'Especialista Campo'
  return 'Perfil Híbrido'
}

function getProfileBadgeStyle(profile: string) {
  switch (profile) {
    case 'Especialista Filial':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Especialista Campo':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Perfil Híbrido':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export function SellersTab({ summary }: SellersTabProps) {
  const [search, setSearch] = useState('')

  // Top 10 vendedores faturamento geral (já ordenado por totalRevenue decrescente)
  const top10Sellers = useMemo(() => {
    return summary.sellerAnalysis.slice(0, 10)
  }, [summary.sellerAnalysis])

  // Top 10 vendedores em campo (ordenado por campoRevenue decrescente)
  const topFieldSellers = useMemo(() => {
    return [...summary.sellerAnalysis]
      .sort((a, b) => b.campoRevenue - a.campoRevenue)
      .slice(0, 10)
  }, [summary.sellerAnalysis])

  // Top 10 vendedores por quantidade de pedidos (geral)
  const top10SellersByOrders = useMemo(() => {
    return [...summary.sellerAnalysis]
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 10)
  }, [summary.sellerAnalysis])

  // Top 10 vendedores por quantidade de pedidos em campo
  const topFieldSellersByOrders = useMemo(() => {
    return [...summary.sellerAnalysis]
      .sort((a, b) => b.campoOrders - a.campoOrders)
      .slice(0, 10)
  }, [summary.sellerAnalysis])

  // Tabela filtrada por nome de vendedor
  const filteredSellers = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return summary.sellerAnalysis
    return summary.sellerAnalysis.filter((s) => s.name.toLowerCase().includes(term))
  }, [summary.sellerAnalysis, search])

  // Mostrar apenas os primeiros 30 vendedores
  const visibleSellers = useMemo(() => {
    return filteredSellers.slice(0, 30)
  }, [filteredSellers])

  // Função para exportar os dados dos vendedores em formato XLSX
  const handleExportXLSX = () => {
    const dataToExport = filteredSellers.map((row) => {
      const profile = getSellerProfile(row.campoRevenue, row.totalRevenue)
      
      let share = 0
      let shareLabel = ''
      if (profile === 'Especialista Filial') {
        share = summary.balcaoRevenue > 0 ? (row.balcaoRevenue / summary.balcaoRevenue) : 0
        shareLabel = 'do Filial'
      } else if (profile === 'Especialista Campo') {
        share = summary.campoRevenue > 0 ? (row.campoRevenue / summary.campoRevenue) : 0
        shareLabel = 'do Campo'
      } else {
        share = summary.totalRevenue > 0 ? (row.totalRevenue / summary.totalRevenue) : 0
        shareLabel = 'do Geral'
      }

      return {
        'Vendedor': row.name,
        'Perfil Comercial': profile,
        'Pedidos Totais': row.totalOrders,
        'Pedidos Filial': row.balcaoOrders,
        'Pedidos Campo': row.campoOrders,
        '% Faturamento Campo': (row.totalRevenue > 0 ? (row.campoRevenue / row.totalRevenue) * 100 : 0).toFixed(1) + '%',
        'Representação': (share * 100).toFixed(1) + '% ' + shareLabel,
        'Faturamento Total (R$)': row.totalRevenue,
        'Faturamento Filial (R$)': row.balcaoRevenue,
        'Faturamento Campo (R$)': row.campoRevenue,
        'Ticket Médio (R$)': row.avgTicket,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Perfil Vendedores')
    XLSX.writeFile(workbook, 'analise_perfil_vendedores.xlsx')
  }

  return (
    <div className="grid gap-6">
      {/* Linha 1: Faturamento - Top 10 geral e Top 10 em campo */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Top 10 vendedores faturamento geral */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 vendedores — Faturamento geral</h3>
            <p className="text-xs text-slate-400">Faturamento total acumulado (Filial + Campo)</p>
          </div>
          <div className="mt-6 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10Sellers}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${formatNumber(val / 1_000_000)}M`}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={formatShortName}
                  width={130}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'balcaoRevenue' ? 'Faturamento Filial' : 'Faturamento Campo',
                  ]}
                />
                <Bar dataKey="balcaoRevenue" fill={COLOR_BALCAO} name="Filial" radius={[0, 4, 4, 0]} />
                <Bar dataKey="campoRevenue" fill={COLOR_CAMPO} name="Campo" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded bg-[#1b432e]" /> Filial
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded bg-[#ea580c]" /> Campo
            </span>
          </div>
        </div>

        {/* Top 10 vendedores em CAMPO (Faturamento) */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 vendedores — Faturamento em Campo</h3>
            <p className="text-xs text-slate-400">Faturamento gerado fora da filial (Campo)</p>
          </div>
          <div className="mt-6 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topFieldSellers}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
                    return `${(val / 1000).toFixed(0)}k`
                  }}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={formatShortName}
                  width={130}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento Campo']}
                />
                <Bar dataKey="campoRevenue" fill={COLOR_CAMPO} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Linha 2: Quantidade (Pedidos) - Top 10 geral e Top 10 em campo */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Top 10 vendedores pedidos geral */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 vendedores — Pedidos gerais</h3>
            <p className="text-xs text-slate-400">Quantidade total de pedidos (Filial + Campo)</p>
          </div>
          <div className="mt-6 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10SellersByOrders}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNumber}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={formatShortName}
                  width={130}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === 'balcaoOrders' ? 'Pedidos Filial' : 'Pedidos Campo',
                  ]}
                />
                <Bar dataKey="balcaoOrders" fill={COLOR_BALCAO} name="Filial" radius={[0, 4, 4, 0]} />
                <Bar dataKey="campoOrders" fill={COLOR_CAMPO} name="Campo" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded bg-[#1b432e]" /> Filial
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded bg-[#ea580c]" /> Campo
            </span>
          </div>
        </div>

        {/* Top 10 vendedores em Campo (Pedidos) */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 vendedores — Pedidos em Campo</h3>
            <p className="text-xs text-slate-400">Quantidade de pedidos realizados fora da filial (Campo)</p>
          </div>
          <div className="mt-6 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topFieldSellersByOrders}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNumber}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={formatShortName}
                  width={130}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Pedidos Campo']}
                />
                <Bar dataKey="campoOrders" fill={COLOR_CAMPO} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Linha 3: Análise de Perfil e Desempenho Comercial */}
      <div className="rounded-3xl glass-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Análise de Perfil e Desempenho Comercial (Apenas os 30 primeiros)</h3>
            <p className="text-xs text-slate-400">
              Visão consolidada da equipe de vendas baseada no canal de atuação. Para extrair todos os {filteredSellers.length} vendedores localizados, utilize a exportação para XLSX.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar vendedor..."
              className="w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-[#1b432e]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={handleExportXLSX}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-[#2E7D32] shadow-sm transition-all duration-200 hover:border-[#2E7D32] hover:bg-[#2E7D32] hover:text-white whitespace-nowrap"
              title="Exportar dados para Excel (.xlsx)"
            >
              <FileSpreadsheet className="h-4 w-4 transition-colors duration-200" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Vendedor</th>
                <th className="pb-3 pr-4">Perfil Comercial</th>
                <th className="pb-3 pr-4 text-right">Pedidos (B/C)</th>
                <th className="pb-3 pr-4 text-right">% Faturamento Campo</th>
                <th className="pb-3 pr-4 text-right">Representação</th>
                <th className="pb-3 pr-4 text-right">Faturamento Total</th>
                <th className="pb-3 text-right">Ticket Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {visibleSellers.map((row) => {
                const profile = getSellerProfile(row.campoRevenue, row.totalRevenue)
                const pctCampo = row.totalRevenue > 0 ? (row.campoRevenue / row.totalRevenue) * 100 : 0
                
                let share = 0
                let shareLabel = ''
                if (profile === 'Especialista Filial') {
                  share = summary.balcaoRevenue > 0 ? (row.balcaoRevenue / summary.balcaoRevenue) : 0
                  shareLabel = 'do Filial'
                } else if (profile === 'Especialista Campo') {
                  share = summary.campoRevenue > 0 ? (row.campoRevenue / summary.campoRevenue) : 0
                  shareLabel = 'do Campo'
                } else {
                  share = summary.totalRevenue > 0 ? (row.totalRevenue / summary.totalRevenue) : 0
                  shareLabel = 'do Geral'
                }

                return (
                  <tr key={row.name} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{row.name}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold border ${getProfileBadgeStyle(profile)}`}>
                        {profile}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-500">
                      <strong className="text-slate-800">{row.totalOrders}</strong> ({row.balcaoOrders} / {row.campoOrders})
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                        pctCampo > 10 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pctCampo.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-800">{(share * 100).toFixed(1)}%</span>
                        <span className="text-[9px] text-slate-400 font-medium leading-none">{shareLabel}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-bold text-slate-800">
                      {formatCurrency(row.totalRevenue)}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-500">
                      {formatCurrency(row.avgTicket)}
                    </td>
                  </tr>
                )
              })}
              {visibleSellers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Nenhum vendedor localizado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
