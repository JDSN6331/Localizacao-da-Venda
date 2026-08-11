import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SectionCardProps = {
  title: string
  subtitle?: string
  extra?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({
  title,
  subtitle,
  extra,
  children,
  className,
}: SectionCardProps) {
  return (
    <section className={cn('py-4', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#133c24]/70 font-bold">Leitura gerencial</p>
          <h2 className="mt-1 font-sans text-2xl font-bold text-[#133c24]">{title}</h2>
          {subtitle ? <p className="mt-1 max-w-2xl text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {extra}
      </div>
      {children}
    </section>
  )
}
