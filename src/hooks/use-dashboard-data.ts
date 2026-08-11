import { useEffect, useMemo, useState } from 'react'

import { useDashboardStore } from '@/store/dashboard-store'
import { parseOrdersCsv } from '@/utils/csv'
import { buildDashboardSummary, filterOrders } from '@/utils/dashboard'

export function useDashboardData() {
  const { orders, setOrders, filters } = useDashboardStore()
  const [isLoading, setIsLoading] = useState(orders.length === 0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orders.length > 0) {
      return
    }

    let active = true

    const loadOrders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/data/pedidos-localizacao.csv?t=${Date.now()}`)

        if (!response.ok) {
          throw new Error('Não foi possível carregar o arquivo CSV.')
        }

        const csvText = await response.text()

        if (!active) {
          return
        }

        setOrders(parseOrdersCsv(csvText))
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao ler os dados.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      active = false
    }
  }, [orders.length, setOrders])

  const filteredOrders = useMemo(() => filterOrders(orders, filters), [filters, orders])
  const summary = useMemo(() => buildDashboardSummary(filteredOrders), [filteredOrders])
  const dateRange = useMemo(() => {
    if (orders.length === 0) {
      return { minDate: '', maxDate: '' }
    }

    const dates = orders.map((record) => record.date).sort()
    return {
      minDate: dates[0],
      maxDate: dates[dates.length - 1],
    }
  }, [orders])

  const branchOptions = useMemo(
    () => Array.from(new Set(orders.map((record) => record.branch))).sort(),
    [orders],
  )
  const sellerOptions = useMemo(
    () => Array.from(new Set(orders.map((record) => record.sellerName))).sort(),
    [orders],
  )
  const statusOptions = useMemo(
    () => Array.from(new Set(orders.map((record) => record.status))).sort(),
    [orders],
  )
  const saleLocationOptions = useMemo(
    () => Array.from(new Set(orders.map((record) => record.saleLocation))).sort(),
    [orders],
  )

  return {
    isLoading,
    error,
    filters,
    orders,
    filteredOrders,
    summary,
    branchOptions,
    sellerOptions,
    statusOptions,
    saleLocationOptions,
    dateRange,
  }
}
