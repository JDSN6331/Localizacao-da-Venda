import type { ConversationStatus, PriorityLevel } from '@/types/crc'

type StatusChipProps = {
  status?: ConversationStatus
  priority?: PriorityLevel
}

const statusMap: Record<ConversationStatus, string> = {
  nova: 'bg-[#203c32] text-[#d1ead8]',
  em_atendimento_ia: 'bg-[#2d3c27] text-[#ebdfbf]',
  aguardando_humano: 'bg-[#55311f] text-[#f8d5b6]',
  em_atendimento_humano: 'bg-[#264245] text-[#c5eef3]',
  aguardando_cliente: 'bg-[#3d3a25] text-[#e9dfa8]',
  finalizada: 'bg-[#24342b] text-[#bbdec6]',
}

const priorityMap: Record<PriorityLevel, string> = {
  baixa: 'bg-white/8 text-[#b7c7be]',
  normal: 'bg-[#21352e] text-[#d8e7df]',
  alta: 'bg-[#603623] text-[#ffd6b8]',
}

export function StatusChip({ status, priority }: StatusChipProps) {
  const label = status ? status.replaceAll('_', ' ') : priority
  const tone = status ? statusMap[status] : priority ? priorityMap[priority] : 'bg-white/10 text-white'

  return <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${tone}`}>{label}</span>
}
