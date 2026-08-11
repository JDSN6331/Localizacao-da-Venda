import { type ReactNode } from 'react'

import { BrandBadge } from '@/components/crc/brand-badge'

type PageHeroProps = {
  title: string
  description: string
  actions?: ReactNode
}

export function PageHero({ title, description, actions }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(217,199,164,0.16),transparent_35%),linear-gradient(135deg,#10271f_0%,#173428_45%,#10241d_100%)] p-8 shadow-[0_40px_120px_rgba(9,19,16,0.35)]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]" />
      <div className="relative">
        <BrandBadge />
        <h1 className="mt-8 max-w-4xl font-display text-5xl leading-tight text-[#f8f3e8]">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#b7c7be]">{description}</p>
        {actions && <div className="mt-8 flex flex-wrap gap-4">{actions}</div>}
      </div>
    </div>
  )
}
