export type InternalRole = 'admin' | 'supervisor' | 'atendente'

export type ConversationStatus =
  | 'nova'
  | 'em_atendimento_ia'
  | 'aguardando_humano'
  | 'em_atendimento_humano'
  | 'aguardando_cliente'
  | 'finalizada'

export type MessageOrigin = 'cliente' | 'ia' | 'atendente' | 'sistema'

export type PriorityLevel = 'baixa' | 'normal' | 'alta'

export type InternalUser = {
  id: string
  name: string
  email: string
  role: InternalRole
  avatar: string
  status: 'online' | 'ocupado' | 'ausente'
}

export type CustomerProfile = {
  id: string
  name: string
  email?: string
  phone?: string
  registration?: string
  city?: string
}

export type ChatMessage = {
  id: string
  conversationId: string
  origin: MessageOrigin
  authorName: string
  content: string
  createdAt: string
  visibleToCustomer: boolean
}

export type Conversation = {
  id: string
  protocol: string
  customer: CustomerProfile
  status: ConversationStatus
  priority: PriorityLevel
  subject: string
  category: string
  channel: 'portal_crc'
  assignedTo?: string
  assignedTeam: string
  agentName: string
  mood: 'positivo' | 'neutro' | 'sensivel'
  satisfaction?: 1 | 2 | 3 | 4 | 5
  createdAt: string
  updatedAt: string
  firstResponseAt?: string
  resolvedAt?: string
  tags: string[]
  summary: string
  messages: ChatMessage[]
}

export type AgentProfile = {
  id: string
  name: string
  slug: string
  tone: string
  model: string
  transferRate: number
  resolutionRate: number
  knowledgeCoverage: number
  status: 'ativo' | 'ajuste' | 'pausado'
}

export type KnowledgeItem = {
  id: string
  title: string
  agentId: string
  source: string
  status: 'ativo' | 'rascunho'
  updatedAt: string
  summary: string
}

export type AuditEntry = {
  id: string
  title: string
  detail: string
  actor: string
  createdAt: string
  type: 'seguranca' | 'configuracao' | 'atendimento'
}

export type DashboardMetric = {
  label: string
  value: string
  highlight: string
  tone: 'forest' | 'copper' | 'sand'
}
