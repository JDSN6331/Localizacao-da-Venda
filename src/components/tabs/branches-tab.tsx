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

import type { DashboardSummary } from '@/types/dashboard'
import { formatCurrency, formatNumber } from '@/utils/format'
import { MesoregionComparison } from '@/components/charts/mesoregion-comparison'

type BranchesTabProps = {
  summary: DashboardSummary
}

const COLOR_BALCAO = '#1b432e'
const COLOR_CAMPO = '#ea580c'

export function BranchesTab({ summary }: BranchesTabProps) {
  const [search, setSearch] = useState('')

  // Top 10 filiais por faturamento total (já vem ordenado decrescente de totalRevenue)
  const top10Branches = useMemo(() => {
    return summary.branchAnalysis.slice(0, 10)
  }, [summary.branchAnalysis])

  // Filiais mais "fora da porteira" (ordenado por % de pedidos em campo)
  const topOutsideBranches = useMemo(() => {
    return [...summary.branchAnalysis]
      .sort((a, b) => b.campoPercent - a.campoPercent)
      .slice(0, 10)
  }, [summary.branchAnalysis])

  // Top 10 filiais por quantidade de pedidos
  const top10BranchesByOrders = useMemo(() => {
    return [...summary.branchAnalysis]
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10)
  }, [summary.branchAnalysis])

  // Top 10 filiais com maior ticket médio de campo
  const topBranchesByCampoAvgTicket = useMemo(() => {
    return [...summary.branchAnalysis]
      .filter(b => b.campoOrders > 0)
      .map(b => ({
        ...b,
        campoAvgTicket: b.campoRevenue / b.campoOrders
      }))
      .sort((a, b) => b.campoAvgTicket - a.campoAvgTicket)
      .slice(0, 10)
  }, [summary.branchAnalysis])

  // Tabela filtrada
  const filteredTableData = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return summary.branchAnalysis
    return summary.branchAnalysis.filter((b) => b.name.toLowerCase().includes(term))
  }, [summary.branchAnalysis, search])

  // Formatador simplificado para M (Milhões) no faturamento
  const formatMillions = (value: number) => {
    if (value >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `R$ ${(value / 1_000).toFixed(0)}k`
    }
    return `R$ ${value}`
  }

  return (
    <div className="grid gap-6">
      {/* Seção: Comparativo por Mesorregião */}
      <MesoregionComparison summary={summary} />

      {/* Seção: Análise por filial individual */}
      <div className="py-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#133c24]/70 font-bold">Leitura gerencial</p>
        <h3 className="mt-1 font-sans text-2xl font-bold text-[#133c24]">
          Análise por filial individual
        </h3>
      </div>

      {/* Linha 1: Top 10 filiais por faturamento e Maior % vendas em campo */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Top 10 filiais por faturamento */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 filiais por faturamento</h3>
            <p className="text-xs text-slate-400">R$ Filial x Campo</p>
          </div>
          <div className="mt-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10Branches}
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
                  tickFormatter={(val) => val.replace('Loja ', '').replace('Unidade Avançada ', 'UA ')}
                  width={110}
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

        {/* Maior % vendas em campo */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 filiais — Maior % vendas em campo</h3>
            <p className="text-xs text-slate-400">Filiais com maior percentual de pedidos realizados em campo (%)</p>
          </div>
          <div className="mt-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topOutsideBranches}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  domain={[0, 100]}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={(val) => val.replace('Loja ', '').replace('Unidade Avançada ', 'UA ')}
                  width={110}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentual Campo']}
                />
                <Bar dataKey="campoPercent" fill={COLOR_CAMPO} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Linha 2: Top 10 filiais por quantidade e Maior ticket médio de campo */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Top 10 filiais por quantidade de pedidos */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 filiais por quantidade de pedidos</h3>
            <p className="text-xs text-slate-400">Volume Filial x Campo (Qtd. Pedidos)</p>
          </div>
          <div className="mt-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10BranchesByOrders}
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
                  tickFormatter={(val) => val.replace('Loja ', '').replace('Unidade Avançada ', 'UA ')}
                  width={110}
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

        {/* Maior ticket médio de campo por filial */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Top 10 filiais — Maior ticket médio de campo</h3>
            <p className="text-xs text-slate-400">Filiais com maior ticket médio fora da filial (R$)</p>
          </div>
          <div className="mt-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBranchesByCampoAvgTicket}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${formatNumber(Math.round(val))}`}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={(val) => val.replace('Loja ', '').replace('Unidade Avançada ', 'UA ')}
                  width={110}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Ticket Médio Campo']}
                />
                <Bar dataKey="campoAvgTicket" fill={COLOR_CAMPO} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Linha 2: Tabela de ranking analítico completo */}
      <div className="rounded-3xl glass-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Ranking completo de filiais</h3>
            <p className="text-xs text-slate-400">Ordenado por faturamento total</p>
          </div>
          <div>
            <input
              type="text"
              placeholder="Buscar filial..."
              className="w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-[#1b432e]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Filial</th>
                <th className="pb-3 pr-4 text-right">Pedidos</th>
                <th className="pb-3 pr-4 text-right">Filial</th>
                <th className="pb-3 pr-4 text-right">Campo</th>
                <th className="pb-3 pr-4 text-right">% Campo</th>
                <th className="pb-3 pr-4 text-right">Fat. Total</th>
                <th className="pb-3 text-right">Ticket Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filteredTableData.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 pr-4 font-semibold text-slate-800">{row.name}</td>
                  <td className="py-3 pr-4 text-right">{formatNumber(row.orders)}</td>
                  <td className="py-3 pr-4 text-right">{formatNumber(row.balcaoOrders)}</td>
                  <td className="py-3 pr-4 text-right">{formatNumber(row.campoOrders)}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                      row.campoPercent > 10 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.campoPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-bold text-slate-800">
                    {formatCurrency(row.totalRevenue)}
                  </td>
                  <td className="py-3 text-right text-slate-500">
                    {formatCurrency(row.avgTicket)}
                  </td>
                </tr>
              ))}
              {filteredTableData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Nenhuma filial localizada no filtro de busca.
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
