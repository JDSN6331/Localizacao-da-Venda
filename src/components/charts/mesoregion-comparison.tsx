import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DashboardSummary } from '@/types/dashboard'
import { getMesoregion, getAnalystByMesoregion, type MesoregionAnalysis } from '@/utils/mesoregion'
import { formatCurrency, formatNumber } from '@/utils/format'

type MesoregionComparisonProps = {
  summary: DashboardSummary
}

const MESO_COLORS = [
  '#1b432e',  // Verde floresta
  '#ea580c',  // Laranja
  '#0369a1',  // Azul
  '#7c3aed',  // Roxo
  '#dc2626',  // Vermelho
]

const MESO_COLORS_LIGHT = [
  '#dcfce7',
  '#ffedd5',
  '#e0f2fe',
  '#ede9fe',
  '#fee2e2',
]

export function MesoregionComparison({ summary }: MesoregionComparisonProps) {
  // Aggregate branch-level data by mesoregion
  const mesoregionData = useMemo((): MesoregionAnalysis[] => {
    const mesoMap = new Map<string, MesoregionAnalysis>()

    for (const branch of summary.branchAnalysis) {
      const mesoName = getMesoregion(branch.name)
      const analyst = getAnalystByMesoregion(mesoName)

      let item = mesoMap.get(mesoName)
      if (!item) {
        item = {
          name: mesoName,
          analyst,
          orders: 0,
          balcaoOrders: 0,
          campoOrders: 0,
          balcaoRevenue: 0,
          campoRevenue: 0,
          totalRevenue: 0,
          avgTicket: 0,
          campoPercent: 0,
          branchCount: 0,
        }
        mesoMap.set(mesoName, item)
      }

      item.orders += branch.orders
      item.balcaoOrders += branch.balcaoOrders
      item.campoOrders += branch.campoOrders
      item.balcaoRevenue += branch.balcaoRevenue
      item.campoRevenue += branch.campoRevenue
      item.totalRevenue += branch.totalRevenue
      item.branchCount += 1
    }

    // Finalize calculated fields
    for (const item of mesoMap.values()) {
      item.avgTicket = item.orders > 0 ? item.totalRevenue / item.orders : 0
      item.campoPercent = item.orders > 0 ? (item.campoOrders / item.orders) * 100 : 0
    }

    return Array.from(mesoMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [summary.branchAnalysis])

  // Only the mapped regionals (excluding "Sem Regional")
  const mappedRegionals = useMemo(
    () => mesoregionData.filter((m) => m.name !== 'Sem Regional'),
    [mesoregionData],
  )

  const semRegional = useMemo(
    () => mesoregionData.find((m) => m.name === 'Sem Regional'),
    [mesoregionData],
  )

  // Prepare pie chart data for revenue share
  const revenuePieData = useMemo(() => {
    return mesoregionData.map((m, i) => ({
      name: m.name,
      value: m.totalRevenue,
      color: MESO_COLORS[i % MESO_COLORS.length],
    }))
  }, [mesoregionData])

  // Prepare radar chart data (normalized for comparison)
  const radarData = useMemo(() => {
    if (mappedRegionals.length === 0) return []

    const maxOrders = Math.max(...mappedRegionals.map((m) => m.orders))
    const maxRevenue = Math.max(...mappedRegionals.map((m) => m.totalRevenue))
    const maxTicket = Math.max(...mappedRegionals.map((m) => m.avgTicket))
    const maxCampo = Math.max(...mappedRegionals.map((m) => m.campoPercent))
    const maxBranches = Math.max(...mappedRegionals.map((m) => m.branchCount))

    return [
      {
        metric: 'Pedidos',
        ...Object.fromEntries(
          mappedRegionals.map((m) => [m.name, maxOrders > 0 ? (m.orders / maxOrders) * 100 : 0])
        ),
      },
      {
        metric: 'Faturamento',
        ...Object.fromEntries(
          mappedRegionals.map((m) => [m.name, maxRevenue > 0 ? (m.totalRevenue / maxRevenue) * 100 : 0])
        ),
      },
      {
        metric: 'Ticket Médio',
        ...Object.fromEntries(
          mappedRegionals.map((m) => [m.name, maxTicket > 0 ? (m.avgTicket / maxTicket) * 100 : 0])
        ),
      },
      {
        metric: '% Campo',
        ...Object.fromEntries(
          mappedRegionals.map((m) => [m.name, maxCampo > 0 ? (m.campoPercent / maxCampo) * 100 : 0])
        ),
      },
      {
        metric: 'Filiais',
        ...Object.fromEntries(
          mappedRegionals.map((m) => [m.name, maxBranches > 0 ? (m.branchCount / maxBranches) * 100 : 0])
        ),
      },
    ]
  }, [mappedRegionals])

  // Stacked bar chart data for Filial vs Campo by mesoregion
  const stackedData = useMemo(() => {
    return mesoregionData.map((m) => ({
      name: m.name,
      balcaoRevenue: m.balcaoRevenue,
      campoRevenue: m.campoRevenue,
      balcaoOrders: m.balcaoOrders,
      campoOrders: m.campoOrders,
    }))
  }, [mesoregionData])

  const totalMappedRevenue = mappedRegionals.reduce((acc, m) => acc + m.totalRevenue, 0)
  const totalAllRevenue = mesoregionData.reduce((acc, m) => acc + m.totalRevenue, 0)

  // Helper to format values in Millions or Thousands nicely
  const formatMillions = (value: number) => {
    if (value >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `R$ ${(value / 1_000).toFixed(0)}k`
    }
    return `R$ ${value.toFixed(0)}`
  }

  return (
    <div className="grid gap-6">
      {/* Header section */}
      <div className="py-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#133c24]/70 font-bold">Leitura gerencial</p>
        <h3 className="mt-1 font-sans text-2xl font-bold text-[#133c24]">
          Comparativo por Mesorregião (Regional)
        </h3>
        <p className="mt-1 max-w-2xl text-xs text-slate-500">
          Consolidação dos indicadores por regional · {mappedRegionals.length} regionais mapeadas · {mesoregionData.reduce((acc, m) => acc + m.branchCount, 0)} filiais
        </p>
      </div>

      {/* KPI cards per mesoregion */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mappedRegionals.map((meso, i) => {
          const revenueShare = totalAllRevenue > 0 ? (meso.totalRevenue / totalAllRevenue) * 100 : 0
          const balcaoRevenuePercent = meso.totalRevenue > 0 ? ((meso.balcaoRevenue / meso.totalRevenue) * 100) : 0
          const campoRevenuePercent = meso.totalRevenue > 0 ? ((meso.campoRevenue / meso.totalRevenue) * 100) : 0
          
          const balcaoOrdersPercent = meso.orders > 0 ? ((meso.balcaoOrders / meso.orders) * 100) : 0
          const campoOrdersPercent = meso.orders > 0 ? ((meso.campoOrders / meso.orders) * 100) : 0

          return (
            <div
              key={meso.name}
              className="rounded-2xl glass-card p-5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: MESO_COLORS[i % MESO_COLORS.length] }}
                  />
                  <span className="text-sm font-bold text-slate-700">{meso.name}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400 truncate">{meso.analyst}</p>
                
                <div className="mt-4 space-y-4">
                  {/* Faturamento */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Faturamento</span>
                      <span className="text-slate-500 font-semibold">{revenueShare.toFixed(1)}% do total</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 leading-tight">
                      {formatCurrency(meso.totalRevenue)}
                    </p>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="bg-[#1b432e]"
                          style={{ width: `${balcaoRevenuePercent}%` }}
                        />
                        <div
                          className="bg-[#ea580c]"
                          style={{ width: `${campoRevenuePercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1b432e]" />
                          Filial: {formatMillions(meso.balcaoRevenue)} ({balcaoRevenuePercent.toFixed(0)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ea580c]" />
                          Campo: {formatMillions(meso.campoRevenue)} ({campoRevenuePercent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pedidos */}
                  <div className="pt-3 border-t border-slate-100/85">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Pedidos</span>
                      <span className="text-slate-500 font-semibold">{meso.branchCount} filiais</span>
                    </div>
                    <p className="text-base font-bold text-slate-700 leading-tight">
                      {formatNumber(meso.orders)} <span className="text-xs font-normal text-slate-400">pedidos</span>
                    </p>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="bg-[#1b432e]"
                          style={{ width: `${balcaoOrdersPercent}%` }}
                        />
                        <div
                          className="bg-[#ea580c]"
                          style={{ width: `${campoOrdersPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-[#1b432e]" />
                          Filial: {formatNumber(meso.balcaoOrders)} ({balcaoOrdersPercent.toFixed(0)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-[#ea580c]" />
                          Campo: {formatNumber(meso.campoOrders)} ({campoOrdersPercent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Layout: Two parallel columns (Bar charts on the left, Pie/Radar on the right) */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column: Bar Charts (Faturamento & Pedidos) */}
        <div className="flex flex-col gap-6 h-full">
          {/* Faturamento Filial x Campo por Regional */}
          <div className="rounded-3xl glass-card p-6 shadow-sm flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Faturamento por regional — Filial x Campo
              </h3>
              <p className="text-xs text-slate-400">
                Composição do faturamento em cada mesorregião (R$)
              </p>
            </div>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stackedData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1_000_000
                        ? `${(val / 1_000_000).toFixed(0)}M`
                        : val >= 1_000
                        ? `${(val / 1_000).toFixed(0)}k`
                        : `${val}`
                    }
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
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
                      name,
                    ]}
                  />
                  <Bar
                    dataKey="balcaoRevenue"
                    fill="#1b432e"
                    name="Filial"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="campoRevenue"
                    fill="#ea580c"
                    name="Campo"
                    radius={[4, 4, 0, 0]}
                  />
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

          {/* Pedidos Filial x Campo por Regional */}
          <div className="rounded-3xl glass-card p-6 shadow-sm flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Pedidos por regional — Filial x Campo
              </h3>
              <p className="text-xs text-slate-400">
                Volume de pedidos em cada mesorregião (qtd.)
              </p>
            </div>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stackedData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatNumber}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
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
                      name,
                    ]}
                  />
                  <Bar
                    dataKey="balcaoOrders"
                    fill="#1b432e"
                    name="Filial"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="campoOrders"
                    fill="#ea580c"
                    name="Campo"
                    radius={[4, 4, 0, 0]}
                  />
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
        </div>

        {/* Right Column: Pie Chart (Participação) & Radar Chart (Perfil) */}
        <div className="flex flex-col gap-6 h-full">
          {/* Pie chart: share de faturamento */}
          <div className="rounded-3xl glass-card p-6 shadow-sm flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Participação no faturamento
              </h3>
              <p className="text-xs text-slate-400">
                Distribuição percentual por regional
              </p>
            </div>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenuePieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {revenuePieData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar chart: Perfil comparativo */}
          <div className="rounded-3xl glass-card p-6 shadow-sm flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Perfil comparativo</h3>
              <p className="text-xs text-slate-400">
                Radar normalizado: Pedidos, Faturamento, Ticket, % Campo e Filiais
              </p>
            </div>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  {mappedRegionals.map((meso, i) => (
                    <Radar
                      key={meso.name}
                      name={meso.name}
                      dataKey={meso.name}
                      stroke={MESO_COLORS[i % MESO_COLORS.length]}
                      fill={MESO_COLORS[i % MESO_COLORS.length]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)}%`, '']}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table: detailed comparison */}
      <div className="rounded-3xl glass-card p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Tabela comparativa por mesorregião
          </h3>
          <p className="text-xs text-slate-400">
            Visão consolidada de indicadores por regional
          </p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Regional</th>
                <th className="pb-3 pr-4">Analista</th>
                <th className="pb-3 pr-4 text-center">Filiais</th>
                <th className="pb-3 pr-4 text-right">Pedidos</th>
                <th className="pb-3 pr-4 text-right">Filial</th>
                <th className="pb-3 pr-4 text-right">Campo</th>
                <th className="pb-3 pr-4 text-right">% Campo</th>
                <th className="pb-3 pr-4 text-right">Fat. Total</th>
                <th className="pb-3 text-right">Ticket Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {mesoregionData.map((row, i) => (
                <tr key={row.name} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: MESO_COLORS[i % MESO_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-800">{row.name}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-500 max-w-[180px] truncate">
                    {row.analyst}
                  </td>
                  <td className="py-3 pr-4 text-center">{row.branchCount}</td>
                  <td className="py-3 pr-4 text-right">{formatNumber(row.orders)}</td>
                  <td className="py-3 pr-4 text-right">{formatNumber(row.balcaoOrders)}</td>
                  <td className="py-3 pr-4 text-right">{formatNumber(row.campoOrders)}</td>
                  <td className="py-3 pr-4 text-right">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                        row.campoPercent > 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
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
              {/* Totals row */}
              <tr className="border-t-2 border-slate-200/60 font-bold">
                <td className="py-3 pr-4 text-slate-800">Total</td>
                <td className="py-3 pr-4" />
                <td className="py-3 pr-4 text-center text-slate-800">
                  {mesoregionData.reduce((acc, m) => acc + m.branchCount, 0)}
                </td>
                <td className="py-3 pr-4 text-right text-slate-800">
                  {formatNumber(mesoregionData.reduce((acc, m) => acc + m.orders, 0))}
                </td>
                <td className="py-3 pr-4 text-right text-slate-800">
                  {formatNumber(mesoregionData.reduce((acc, m) => acc + m.balcaoOrders, 0))}
                </td>
                <td className="py-3 pr-4 text-right text-slate-800">
                  {formatNumber(mesoregionData.reduce((acc, m) => acc + m.campoOrders, 0))}
                </td>
                <td className="py-3 pr-4 text-right">
                  {(() => {
                    const totalOrders = mesoregionData.reduce((acc, m) => acc + m.orders, 0)
                    const totalCampo = mesoregionData.reduce((acc, m) => acc + m.campoOrders, 0)
                    const pct = totalOrders > 0 ? (totalCampo / totalOrders) * 100 : 0
                    return (
                      <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                        {pct.toFixed(1)}%
                      </span>
                    )
                  })()}
                </td>
                <td className="py-3 pr-4 text-right font-bold text-slate-800">
                  {formatCurrency(totalAllRevenue)}
                </td>
                <td className="py-3 text-right text-slate-800">
                  {(() => {
                    const totalOrders = mesoregionData.reduce((acc, m) => acc + m.orders, 0)
                    return formatCurrency(totalOrders > 0 ? totalAllRevenue / totalOrders : 0)
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info about unmapped branches */}
      {semRegional && semRegional.orders > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">
            ⚠️ {semRegional.branchCount} filiais ({formatNumber(semRegional.orders)} pedidos, {formatCurrency(semRegional.totalRevenue)}) não estão mapeadas no arquivo de mesorregiões.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            São depósitos, centros de distribuição ou filiais não listadas no "FILIAL - MESOREGIÃO v1".
          </p>
        </div>
      )}
    </div>
  )
}
