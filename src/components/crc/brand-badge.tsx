import { Sparkles } from 'lucide-react'

export function BrandBadge() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#113127]/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d9c7a4] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9c7a4] text-[#113127]">
        <Sparkles className="h-4 w-4" />
      </span>
      CRC Intelligence Suite
    </div>
  )
}
