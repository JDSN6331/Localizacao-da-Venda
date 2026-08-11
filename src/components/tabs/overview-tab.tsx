import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DashboardSummary } from '@/types/dashboard'
import { formatCurrency, formatNumber } from '@/utils/format'

type OverviewTabProps = {
  summary: DashboardSummary
}

const COLOR_BALCAO = '#1b432e'
const COLOR_CAMPO = '#ea580c'

export function OverviewTab({ summary }: OverviewTabProps) {
  // Calcular taxa de integração: status 'Integrado' / totalOrders
  const integradoItem = summary.statusComparison.find((s) => s.status === 'Integrado')
  const totalIntegrados = integradoItem ? integradoItem.balcao + integradoItem.campo : 0
  const integrationRate = summary.totalOrders > 0 ? (totalIntegrados / summary.totalOrders) * 100 : 0

  // Formatador simplificado para M (Milhões) no faturamento acumulado
  const formatMillions = (value: number) => {
    if (value >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `R$ ${(value / 1_000).toFixed(0)}k`
    }
    return `R$ ${value}`
  }

  // Dados para os Donuts de Mix
  const pieDataPedidos = [
    { name: 'Filial', value: summary.balcaoOrders },
    { name: 'Campo', value: summary.campoOrders },
  ]

  const pieDataFaturamento = [
    { name: 'Filial', value: summary.balcaoRevenue },
    { name: 'Campo', value: summary.campoRevenue },
  ]

  const pctBalcaoPed = summary.totalOrders > 0 ? (summary.balcaoOrders / summary.totalOrders) * 100 : 0
  const pctCampoPed = summary.totalOrders > 0 ? (summary.campoOrders / summary.totalOrders) * 100 : 0
  const pctBalcaoFat = summary.totalRevenue > 0 ? (summary.balcaoRevenue / summary.totalRevenue) * 100 : 0
  const pctCampoFat = summary.totalRevenue > 0 ? (summary.campoRevenue / summary.totalRevenue) * 100 : 0

  return (
    <div className="grid gap-6">
      {/* Linha 1: Evolução diária e Mix por canal */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Evolução mensal de pedidos */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Evolução mensal de pedidos</h3>
            <p className="text-xs text-slate-400">Volume Filial x Campo por mês</p>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.dailySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Pedidos']}
                />
                <Bar dataKey="balcaoOrders" fill={COLOR_BALCAO} name="Filial" radius={[4, 4, 0, 0]} />
                <Bar dataKey="campoOrders" fill={COLOR_CAMPO} name="Campo" radius={[4, 4, 0, 0]} />
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

        {/* Mix por canal */}
        <div className="rounded-3xl glass-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Mix por canal</h3>
            <p className="text-xs text-slate-400">Participação em quantidade e valor</p>
          </div>

          <div className="my-6 grid grid-cols-2 gap-4 items-center justify-center">
            {/* Donut Pedidos */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="h-[140px] w-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataPedidos}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill={COLOR_BALCAO} />
                      <Cell fill={COLOR_CAMPO} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute top-[50px] flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Pedidos</span>
                <span className="text-xs font-extrabold text-slate-800">{formatNumber(summary.totalOrders)}</span>
              </div>
            </div>

            {/* Donut Faturamento */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="h-[140px] w-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataFaturamento}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill={COLOR_BALCAO} />
                      <Cell fill={COLOR_CAMPO} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute top-[50px] flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Faturamento</span>
                <span className="text-xs font-extrabold text-slate-800">
                  R$ {(summary.totalRevenue / 1_000_000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>

          {/* Legenda detalhada do canal */}
          <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="h-3 w-3 rounded-full bg-[#1b432e]" /> Filial (Filial)
              </span>
              <span className="font-semibold text-slate-700">
                {pctBalcaoPed.toFixed(1)}% ped · {pctBalcaoFat.toFixed(1)}% R$
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="h-3 w-3 rounded-full bg-[#ea580c]" /> Campo (Fora)
              </span>
              <span className="font-semibold text-slate-700">
                {pctCampoPed.toFixed(1)}% ped · {pctCampoFat.toFixed(1)}% R$
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2: Faturamento acumulado e Padrão semanal */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Faturamento mensal */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Faturamento mensal</h3>
            <p className="text-xs text-slate-400">Faturamento Filial x Campo por mês</p>
          </div>
          <div className="mt-6 h-[530px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.dailySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatMillions}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                />
                <Bar dataKey="balcaoRevenue" fill={COLOR_BALCAO} name="Filial" radius={[4, 4, 0, 0]} />
                <Bar dataKey="campoRevenue" fill={COLOR_CAMPO} name="Campo" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded bg-[#1b432e]" /> Filial R$
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded bg-[#ea580c]" /> Campo R$
            </span>
          </div>
        </div>

        {/* Lado direito: Padrão semanal de pedidos e faturamento */}
        <div className="flex flex-col gap-6">
          {/* Quantidade semanal */}
          <div className="rounded-3xl glass-card p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Quantidade semanal</h3>
              <p className="text-xs text-slate-400">Pedidos por dia da semana — Filial x Campo</p>
            </div>
            <div className="mt-6 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.weekdaySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [formatNumber(value), 'Pedidos']}
                  />
                  <Bar dataKey="balcaoOrders" fill={COLOR_BALCAO} name="Filial" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="campoOrders" fill={COLOR_CAMPO} name="Campo" radius={[4, 4, 0, 0]} />
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

          {/* Faturamento semanal */}
          <div className="rounded-3xl glass-card p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Faturamento semanal</h3>
              <p className="text-xs text-slate-400">Faturamento por dia da semana — Filial x Campo</p>
            </div>
            <div className="mt-6 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.weekdaySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatMillions}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                  />
                  <Bar dataKey="balcaoRevenue" fill={COLOR_BALCAO} name="Filial" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="campoRevenue" fill={COLOR_CAMPO} name="Campo" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded bg-[#1b432e]" /> Filial R$
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded bg-[#ea580c]" /> Campo R$
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 3: Distribuição por faixa de valor e Status dos pedidos */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Distribuição por faixa de valor */}
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Distribuição por faixa de valor</h3>
            <p className="text-xs text-slate-400">Quantidade de pedidos por ticket</p>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.ticketRanges}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  dataKey="range"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  width={80}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Pedidos']}
                />
                <Bar dataKey="balcao" fill={COLOR_BALCAO} name="Filial" radius={[0, 4, 4, 0]} />
                <Bar dataKey="campo" fill={COLOR_CAMPO} name="Campo" radius={[0, 4, 4, 0]} />
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

        {/* Status dos pedidos */}
        <div className="rounded-3xl glass-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Status dos pedidos</h3>
              <p className="text-xs text-slate-400">Integrado x Fechado por canal</p>
            </div>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.statusComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="status"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [formatNumber(value), 'Pedidos']}
                  />
                  <Bar dataKey="balcao" fill={COLOR_BALCAO} name="Filial" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="campo" fill={COLOR_CAMPO} name="Campo" radius={[4, 4, 0, 0]} />
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

          <div className="border-t border-slate-100 pt-4 mt-6 text-sm text-slate-500 font-medium">
            Taxa de integração: <span className="font-bold text-slate-800">{integrationRate.toFixed(1)}%</span> do total de pedidos.
          </div>
        </div>
      </div>
    </div>
  )
}
