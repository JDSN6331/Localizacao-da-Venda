import { type ReactNode } from 'react'

type PanelCardProps = {
  title: string
  eyebrow?: string
  subtitle?: string
  children: ReactNode
}

export function PanelCard({ title, eyebrow, subtitle, children }: PanelCardProps) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[#132e25]/90 p-6 shadow-[0_30px_80px_rgba(8,17,14,0.24)] backdrop-blur-xl">
      {(eyebrow || subtitle) && (
        <div className="mb-5">
          {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fb8a8]">{eyebrow}</p>}
          <h2 className="mt-3 font-display text-[28px] text-[#f8f3e8]">{title}</h2>
          {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b7c7be]">{subtitle}</p>}
        </div>
      )}

      {!eyebrow && !subtitle && <h2 className="mb-5 font-display text-2xl text-[#f8f3e8]">{title}</h2>}
      {children}
    </section>
  )
}
