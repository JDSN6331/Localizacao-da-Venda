import { type ReactNode } from 'react'
import { BarChart3, Bot, BookOpenText, ClipboardList, LogOut, ShieldCheck, Users } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { BrandBadge } from '@/components/crc/brand-badge'
import { useCrcStore } from '@/store/crc-store'

const navigation = [
  { label: 'Fila', to: '/app/fila', icon: ClipboardList },
  { label: 'Gestão', to: '/app/gestao', icon: BarChart3 },
  { label: 'Agentes', to: '/app/agentes', icon: Bot },
  { label: 'Conhecimento', to: '/app/conhecimento', icon: BookOpenText },
  { label: 'Usuários', to: '/app/usuarios', icon: Users },
  { label: 'Auditoria', to: '/app/auditoria', icon: ShieldCheck },
]

type AppShellProps = {
  heading: string
  subtitle: string
  children: ReactNode
}

export function AppShell({ heading, subtitle, children }: AppShellProps) {
  const user = useCrcStore((state) => state.currentUser)
  const logout = useCrcStore((state) => state.logout)

  return (
    <div className="min-h-screen bg-[#08130f] px-4 py-4 text-[#f8f3e8] lg:px-6">
      <div className="mx-auto grid max-w-[1680px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-white/8 bg-[#0f241d] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.26)]">
          <Link to="/" className="block">
            <BrandBadge />
          </Link>

          <div className="mt-8 rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#8fb8a8]">Sessão interna</p>
            <p className="mt-3 font-display text-[26px]">{user?.name ?? 'Usuário CRC'}</p>
            <p className="mt-2 text-sm text-[#97ad9f]">{user?.email ?? 'Faça login novamente'}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                      isActive ? 'bg-[#d9c7a4] text-[#10241d]' : 'text-[#c6d2cc] hover:bg-white/8'
                    }`
                  }
                  key={item.to}
                  to={item.to}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <button
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#f8f3e8] transition hover:bg-white/10"
            onClick={logout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Encerrar sessão
          </button>
        </aside>

        <main className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0d1f19_0%,#091410_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] lg:p-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#8fb8a8]">Operação CRC</p>
              <h1 className="mt-3 font-display text-4xl">{heading}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b7c7be]">{subtitle}</p>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  )
}
