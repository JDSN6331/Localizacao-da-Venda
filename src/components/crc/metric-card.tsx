type MetricCardProps = {
  label: string
  value: string
  highlight: string
  tone: 'forest' | 'copper' | 'sand'
}

const tones = {
  forest: 'from-[#173b2e] to-[#1f5743] text-[#e8f3ed]',
  copper: 'from-[#4f2e1f] to-[#8a5334] text-[#fff0e6]',
  sand: 'from-[#4a4330] to-[#83775a] text-[#fff7df]',
}

export function MetricCard({ label, value, highlight, tone }: MetricCardProps) {
  return (
    <article className={`rounded-[24px] border border-white/8 bg-gradient-to-br p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-80">{label}</p>
      <p className="mt-4 font-display text-4xl">{value}</p>
      <p className="mt-3 text-sm leading-6 opacity-85">{highlight}</p>
    </article>
  )
}
