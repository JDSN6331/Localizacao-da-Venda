import type { Conversation, DashboardMetric } from '@/types/crc'

function formatMinutes(value: number) {
  return `${value} min`
}

function differenceInMinutes(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000))
}

export function buildDashboardMetrics(conversations: Conversation[]): DashboardMetric[] {
  const total = conversations.length
  const resolvedByAI = conversations.filter((item) => item.status === 'finalizada' && !item.assignedTo).length
  const waitingHuman = conversations.filter((item) => item.status === 'aguardando_humano').length
  const satisfactionValues = conversations.flatMap((item) => (item.satisfaction ? [item.satisfaction] : []))
  const averageSatisfaction = satisfactionValues.length
    ? (satisfactionValues.reduce((sum, value) => sum + value, 0) / satisfactionValues.length).toFixed(1)
    : '0.0'

  const firstResponseSamples = conversations.flatMap((item) =>
    item.firstResponseAt ? [differenceInMinutes(item.createdAt, item.firstResponseAt)] : [],
  )

  const averageFirstResponse = firstResponseSamples.length
    ? Math.round(firstResponseSamples.reduce((sum, value) => sum + value, 0) / firstResponseSamples.length)
    : 0

  return [
    {
      label: 'Conversas no período',
      value: total.toString(),
      highlight: `${waitingHuman} aguardando humano agora`,
      tone: 'forest',
    },
    {
      label: 'Resolução pela IA',
      value: `${Math.round((resolvedByAI / Math.max(total, 1)) * 100)}%`,
      highlight: `${resolvedByAI} casos concluídos sem handoff`,
      tone: 'copper',
    },
    {
      label: 'Primeira resposta',
      value: formatMinutes(averageFirstResponse),
      highlight: 'Meta operacional abaixo de 5 min',
      tone: 'sand',
    },
    {
      label: 'CSAT médio',
      value: `${averageSatisfaction}/5`,
      highlight: 'Avaliação após encerramento',
      tone: 'forest',
    },
  ]
}

export function buildStatusSeries(conversations: Conversation[]) {
  const labels: Conversation['status'][] = [
    'nova',
    'em_atendimento_ia',
    'aguardando_humano',
    'em_atendimento_humano',
    'aguardando_cliente',
    'finalizada',
  ]

  return labels.map((status) => ({
    status: status.replaceAll('_', ' '),
    quantidade: conversations.filter((item) => item.status === status).length,
  }))
}

export function buildAgentSeries(conversations: Conversation[]) {
  const groups = new Map<string, { agent: string; resolvidas: number; transferidas: number }>()

  conversations.forEach((conversation) => {
    const current = groups.get(conversation.agentName) ?? {
      agent: conversation.agentName,
      resolvidas: 0,
      transferidas: 0,
    }

    if (conversation.status === 'finalizada' && !conversation.assignedTo) {
      current.resolvidas += 1
    }

    if (conversation.status === 'aguardando_humano' || conversation.assignedTo) {
      current.transferidas += 1
    }

    groups.set(conversation.agentName, current)
  })

  return Array.from(groups.values())
}

export function buildHourlyLoad(conversations: Conversation[]) {
  const hours = ['08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h']

  return hours.map((hour, index) => ({
    faixa: hour,
    novas: conversations.filter((item) => new Date(item.createdAt).getHours() === index + 8).length,
    backlog: Math.max(1, (index * 2) % 5),
  }))
}
