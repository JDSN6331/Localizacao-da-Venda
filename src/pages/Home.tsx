import { useState } from 'react'
import {
  Wheat,
  Building2,
  Tractor,
  Target,
  Package,
  DollarSign,
  Users,
} from 'lucide-react'

import { useDashboardData } from '@/hooks/use-dashboard-data'
import { formatCurrency, formatNumber, formatPercent, formatFullDate } from '@/utils/format'
import { OverviewTab } from '@/components/tabs/overview-tab'
import { BranchesTab } from '@/components/tabs/branches-tab'
import { SellersTab } from '@/components/tabs/sellers-tab'
import { OrdersTable } from '@/components/orders-table'
import { SectionCard } from '@/components/section-card'

export default function Home() {
  const {
    isLoading,
    error,
    filteredOrders,
    summary,
    dateRange,
  } = useDashboardData()

  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'sellers'>('overview')

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f3ef] px-6 py-24 text-slate-800">
        <div className="w-full max-w-3xl animate-pulse rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-[#1b432e] font-bold">AgroDash</p>
          <div className="mt-4 h-8 w-2/3 rounded-full bg-slate-100" />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-[20px] bg-slate-100" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f3ef] px-6 py-24">
        <div className="max-w-lg rounded-[32px] border border-rose-200 bg-white p-8 text-slate-800 shadow-sm">
          <h1 className="font-display text-4xl text-rose-600">Falha ao carregar o dashboard</h1>
          <p className="mt-4 text-sm text-slate-600">{error}</p>
        </div>
      </main>
    )
  }

  const ticketMultiple = summary.balcaoAvgTicket > 0 ? summary.campoAvgTicket / summary.balcaoAvgTicket : 0
  const pctBalcaoPed = summary.totalOrders > 0 ? (summary.balcaoOrders / summary.totalOrders) * 100 : 0
  const pctBalcaoFat = summary.totalRevenue > 0 ? (summary.balcaoRevenue / summary.totalRevenue) * 100 : 0
  const pctCampoPed = summary.totalOrders > 0 ? (summary.campoOrders / summary.totalOrders) * 100 : 0
  const pctCampoFat = summary.totalRevenue > 0 ? (summary.campoRevenue / summary.totalRevenue) * 100 : 0
  
  // Cálculo de capilaridade de filiais em campo
  const fieldBranchesCount = new Set(filteredOrders.filter(o => o.saleLocation === 'Fora da Filial').map(o => o.branch)).size
  const totalBranchesCount = new Set(filteredOrders.map(o => o.branch)).size
  const capilaridadePercent = totalBranchesCount > 0 ? (fieldBranchesCount / totalBranchesCount) * 100 : 0

  // Obter datas de início e fim do período filtrado
  const sortedDates = [...filteredOrders].map(o => o.date).sort()
  const minDateFormatted = sortedDates[0] ? formatFullDate(sortedDates[0]) : ''
  const maxDateFormatted = sortedDates[sortedDates.length - 1] ? formatFullDate(sortedDates[sortedDates.length - 1]) : ''

  return (
    <main className="min-h-screen text-slate-800 pb-16">
      {/* Cabeçalho Verde Floresta */}
      <header className="sticky top-0 z-50 bg-[#133c24] text-white pt-3 pb-3 px-4 lg:px-10 shadow-lg">
        <div className="mx-auto max-w-[1600px]">
          {/* Linha superior: Logo + Abas */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo e Info */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="rounded-lg bg-[#f5a623] p-1.5 text-[#133c24] flex items-center justify-center">
                <Wheat className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h1 className="font-sans text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
                  Pedidos Filial x Campo
                </h1>
                <p className="text-[10px] md:text-[11px] text-[#a3c4ae] font-medium">
                  Painel executivo · {minDateFormatted} a {maxDateFormatted}
                </p>
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="flex rounded-xl bg-[#17462c]/70 border border-[#23583c] p-0.5 shrink-0">
              <button
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#f5a623] text-[#133c24] shadow-sm'
                    : 'text-[#9cc4aa] hover:text-white'
                }`}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                Visão geral
              </button>
              <button
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'branches'
                    ? 'bg-[#f5a623] text-[#133c24] shadow-sm'
                    : 'text-[#9cc4aa] hover:text-white'
                }`}
                onClick={() => setActiveTab('branches')}
                type="button"
              >
                Filiais
              </button>
              <button
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'sellers'
                    ? 'bg-[#f5a623] text-[#133c24] shadow-sm'
                    : 'text-[#9cc4aa] hover:text-white'
                }`}
                onClick={() => setActiveTab('sellers')}
                type="button"
              >
                Vendedores
              </button>
            </div>
          </div>

          {/* Grid de KPIs */}
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* KPI 1 */}
            <div className="rounded-lg bg-[#17462c]/85 border border-[#23583c] px-4 py-3">
              <div className="flex items-center gap-1.5 text-[#9cc4aa] text-[9px] uppercase tracking-wider font-bold">
                <Package className="h-3.5 w-3.5" />
                <span>Pedidos Totais</span>
              </div>
              <p className="mt-1.5 text-xl font-bold text-white leading-none">
                {formatNumber(summary.totalOrders)}
              </p>
              <p className="mt-1.5 text-[10px] text-[#81a68d] font-semibold">
                {minDateFormatted} – {maxDateFormatted}
              </p>
            </div>

            {/* KPI 2 */}
            <div className="rounded-lg bg-[#17462c]/85 border border-[#23583c] px-4 py-3">
              <div className="flex items-center gap-1.5 text-[#9cc4aa] text-[9px] uppercase tracking-wider font-bold">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Faturamento</span>
              </div>
              <p className="mt-1.5 text-xl font-bold text-white leading-none">
                {formatCurrency(summary.totalRevenue)}
              </p>
              <p className="mt-1.5 text-[10px] text-[#81a68d] font-semibold">
                Ticket médio {formatCurrency(summary.avgTicket)}
              </p>
            </div>

            {/* KPI 3 */}
            <div className="rounded-lg bg-[#17462c]/85 border border-[#23583c] px-4 py-3">
              <div className="flex items-center gap-1.5 text-[#9cc4aa] text-[9px] uppercase tracking-wider font-bold">
                <Users className="h-3.5 w-3.5" />
                <span>Cooperados Atendidos</span>
              </div>
              <p className="mt-1.5 text-xl font-bold text-white leading-none">
                {formatNumber(summary.uniqueClients)}
              </p>
              <p className="mt-1.5 text-[10px] text-[#81a68d] font-semibold">
                {summary.uniqueSellers} vendedores ativos
              </p>
            </div>

            {/* KPI 4 */}
            <div className="rounded-lg bg-[#17462c]/85 border border-[#23583c] px-4 py-3">
              <div className="flex items-center gap-1.5 text-[#9cc4aa] text-[9px] uppercase tracking-wider font-bold">
                <Target className="h-3.5 w-3.5" />
                <span>Ticket Médio Campo</span>
              </div>
              <p className="mt-1.5 text-xl font-bold text-white leading-none">
                R$ {formatNumber(Math.round(summary.campoAvgTicket))}
              </p>
              <p className="mt-1.5 text-[10px] text-[#81a68d] font-semibold">
                {ticketMultiple.toFixed(1)}x vs Filial (R$ {formatNumber(Math.round(summary.balcaoAvgTicket))})
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Área Bege Claro */}
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-8">
        {/* Cards de Insights */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-3xl glass-card p-6 flex flex-col gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] border border-[#d1fae5] px-3 py-1 text-xs font-bold text-[#065f46] w-fit">
              <Building2 className="h-4 w-4 text-[#047857]" />
              Filial domina o volume
            </span>
            <p className="text-sm leading-6 text-slate-600 font-medium">
              <span className="font-bold text-slate-800">{pctBalcaoPed.toFixed(1)}% dos pedidos</span> e{' '}
              <span className="font-bold text-slate-800">{pctBalcaoFat.toFixed(1)}% do faturamento</span> passam pela
              filial. Operação recorrente e capilarizada.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl glass-card p-6 flex flex-col gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7ed] border border-[#ffedd5] px-3 py-1 text-xs font-bold text-[#c2410c] w-fit">
              <Tractor className="h-4 w-4 text-[#ea580c]" />
              Campo é onde está o ticket alto
            </span>
            <p className="text-sm leading-6 text-slate-600 font-medium">
              Apenas <span className="font-bold text-slate-800">{pctCampoPed.toFixed(1)}%</span> dos pedidos vêm de campo,
              mas geram <span className="font-bold text-slate-800">{pctCampoFat.toFixed(1)}% do faturamento</span> —
              ticket médio <span className="font-bold text-slate-800">{ticketMultiple.toFixed(1)}x maior</span>.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl glass-card p-6 flex flex-col gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f9ff] border border-[#e0f2fe] px-3 py-1 text-xs font-bold text-[#0369a1] w-fit">
              <Target className="h-4 w-4 text-[#0284c7]" />
              Capilaridade de atendimento externo
            </span>
            <p className="text-sm leading-6 text-slate-600 font-medium">
              <span className="font-bold text-slate-800">{fieldBranchesCount} de {totalBranchesCount} filiais</span> possuem vendas ativas em campo no período, representando <span className="font-bold text-slate-800">{capilaridadePercent.toFixed(1)}% de capilaridade</span> comercial fora da sede física. Filiais sem vendas ativas em campo podem ser depósitos e centros de distribuição.
            </p>
          </div>
        </div>



        {/* Área dinâmica baseada na aba ativa */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <>
              <OverviewTab summary={summary} />
              {/* Detalhamento de Pedidos (Apenas na aba de Visão Geral) */}
              <div className="mt-8">
                <SectionCard
                  title="Detalhamento dos pedidos"
                  subtitle="Tabela para validação rápida do recorte atual com busca textual e ordenação natural do CSV."
                >
                  <OrdersTable records={filteredOrders} />
                </SectionCard>
              </div>
            </>
          )}
          {activeTab === 'branches' && <BranchesTab summary={summary} />}
          {activeTab === 'sellers' && <SellersTab summary={summary} />}
        </div>
      </div>
    </main>
  )
}

