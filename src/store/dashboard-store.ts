import { create } from 'zustand'

import { EMPTY_FILTERS, type DashboardFilters, type OrderRecord } from '@/types/dashboard'

type DashboardStore = {
  filters: DashboardFilters
  orders: OrderRecord[]
  setOrders: (orders: OrderRecord[]) => void
  setFilter: <Key extends keyof DashboardFilters>(key: Key, value: DashboardFilters[Key]) => void
  resetFilters: () => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  filters: EMPTY_FILTERS,
  orders: [],
  setOrders: (orders) => set({ orders }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () => set({ filters: EMPTY_FILTERS }),
}))
