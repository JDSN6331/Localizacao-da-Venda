import { Navigate, Outlet } from 'react-router-dom'

import { useCrcStore } from '@/store/crc-store'

export function ProtectedRoute() {
  const currentUser = useCrcStore((state) => state.currentUser)

  if (!currentUser) {
    return <Navigate replace to="/entrar" />
  }

  return <Outlet />
}
