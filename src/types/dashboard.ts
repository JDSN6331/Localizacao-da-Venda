export type OrderRecord = {
  date: string
  orderNumber: string
  erpOrderNumber: string
  memberId: string
  accountName: string
  branch: string
  sellerCode: string
  sellerName: string
  geoInfo: string | null
  saleLocation: string
  status: string
  orderValue: number
}

export type DashboardFilters = {
  startDate: string
  endDate: string
  branch: string
  seller: string
  status: string
  saleLocation: string
  search: string
}

export type KpiMetric = {
  label: string
  value: number
  type: 'currency' | 'number' | 'percent'
  helper: string
}

export type BreakdownItem = {
  label: string
  value: number
  orders: number
}

export type DailyPoint = {
  date: string
  label: string
  revenue: number
  orders: number
  avgTicket: number
  balcaoRevenue: number
  campoRevenue: number
  balcaoOrders: number
  campoOrders: number
}

export type InsightTone = 'info' | 'success' | 'warning'

export type InsightItem = {
  title: string
  description: string
  tone: InsightTone
}

export type DashboardSummary = {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  uniqueClients: number
  uniqueBranches: number
  uniqueSellers: number
  integratedShare: number
  outsideShare: number
  geoCoverage: number
  statusBreakdown: BreakdownItem[]
  saleLocationBreakdown: BreakdownItem[]
  topBranches: BreakdownItem[]
  topSellers: BreakdownItem[]
  topClients: BreakdownItem[]
  dailySeries: DailyPoint[]
  biggestOrders: OrderRecord[]
  insights: InsightItem[]
  
  balcaoRevenue: number
  balcaoOrders: number
  balcaoAvgTicket: number
  campoRevenue: number
  campoOrders: number
  campoAvgTicket: number

  // Novos campos para AgroDash replica
  weekdaySeries: {
    label: string
    value: number
    orders: number
    balcaoOrders: number
    campoOrders: number
    balcaoRevenue: number
    campoRevenue: number
  }[]
  ticketRanges: { range: string; balcao: number; campo: number }[]
  statusComparison: { status: string; balcao: number; campo: number }[]
  branchAnalysis: {
    name: string
    orders: number
    balcaoOrders: number
    campoOrders: number
    balcaoRevenue: number
    campoRevenue: number
    campoPercent: number
    totalRevenue: number
    avgTicket: number
  }[]
  sellerAnalysis: {
    name: string
    balcaoRevenue: number
    campoRevenue: number
    totalRevenue: number
    balcaoOrders: number
    campoOrders: number
    totalOrders: number
    avgTicket: number
  }[]
  potentialSellers: {
    name: string
    balcaoRevenue: number
    totalOrders: number
  }[]
}

export const EMPTY_FILTERS: DashboardFilters = {
  startDate: '',
  endDate: '',
  branch: 'all',
  seller: 'all',
  status: 'all',
  saleLocation: 'all',
  search: '',
}
