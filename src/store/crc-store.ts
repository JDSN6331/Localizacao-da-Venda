import { create } from 'zustand'

import { agents, auditEntries, conversations, internalUsers, knowledgeItems } from '@/data/crc-demo'
import type { ChatMessage, Conversation, CustomerProfile, InternalUser } from '@/types/crc'
import { buildAssistantReply, shouldEscalateToHuman } from '@/utils/crc-assistant'

type LoginPayload = {
  name: string
  email: string
}

type CustomerPayload = {
  name: string
  email?: string
  phone?: string
  registration?: string
}

type CrcStore = {
  currentUser: InternalUser | null
  users: InternalUser[]
  agents: typeof agents
  knowledgeItems: typeof knowledgeItems
  auditEntries: typeof auditEntries
  conversations: Conversation[]
  portalConversationId: string | null
  login: (payload: LoginPayload) => void
  logout: () => void
  startCustomerConversation: (payload: CustomerPayload) => string
  sendCustomerMessage: (conversationId: string, content: string) => void
  sendInternalMessage: (conversationId: string, content: string) => void
  assumeConversation: (conversationId: string) => void
  finalizeConversation: (conversationId: string, satisfaction?: 1 | 2 | 3 | 4 | 5) => void
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function createMessage(
  conversationId: string,
  origin: ChatMessage['origin'],
  authorName: string,
  content: string,
): ChatMessage {
  return {
    id: createId('msg'),
    conversationId,
    origin,
    authorName,
    content,
    createdAt: new Date().toISOString(),
    visibleToCustomer: true,
  }
}

function createConversation(customer: CustomerProfile): Conversation {
  const createdAt = new Date().toISOString()

  return {
    id: createId('conv'),
    protocol: `CRC-${new Date().toISOString().slice(2, 10).replaceAll('-', '')}-${Math.floor(Math.random() * 900 + 100)}`,
    customer,
    status: 'em_atendimento_ia',
    priority: 'normal',
    subject: 'Nova conversa no portal CRC',
    category: 'Triagem inicial',
    channel: 'portal_crc',
    assignedTeam: 'Salesforce',
    agentName: 'Assistente do Salesforce',
    mood: 'neutro',
    createdAt,
    updatedAt: createdAt,
    firstResponseAt: createdAt,
    tags: ['portal_crc'],
    summary: 'Conversa iniciada no portal do CRC aguardando contexto do cliente.',
    messages: [
      createMessage(
        `placeholder-${createdAt}`,
        'ia',
        'Assistente do Salesforce',
        'Olá. Eu sou o Assistente do Salesforce do CRC. Pode me contar o que aconteceu para eu analisar e, se necessário, transferir com contexto para um atendente.',
      ),
    ],
  }
}

function updateConversation(list: Conversation[], conversationId: string, updater: (item: Conversation) => Conversation) {
  return list.map((item) => (item.id === conversationId ? updater(item) : item))
}

export const useCrcStore = create<CrcStore>((set, get) => ({
  currentUser: internalUsers[0],
  users: internalUsers,
  agents,
  knowledgeItems,
  auditEntries,
  conversations,
  portalConversationId: null,
  login: ({ name, email }) => {
    const existingUser = get().users.find((item) => item.email.toLowerCase() === email.toLowerCase())

    set({
      currentUser:
        existingUser ??
        {
          id: createId('user'),
          name,
          email,
          role: 'atendente',
          avatar: name
            .split(' ')
            .slice(0, 2)
            .map((chunk) => chunk[0])
            .join('')
            .toUpperCase(),
          status: 'online',
        },
    })
  },
  logout: () => set({ currentUser: null }),
  startCustomerConversation: (payload) => {
    const customer: CustomerProfile = {
      id: createId('cust'),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      registration: payload.registration,
    }

    const conversation = createConversation(customer)
    conversation.messages = conversation.messages.map((message) => ({
      ...message,
      conversationId: conversation.id,
    }))

    set((state) => ({
      portalConversationId: conversation.id,
      conversations: [conversation, ...state.conversations],
    }))

    return conversation.id
  },
  sendCustomerMessage: (conversationId, content) => {
    const state = get()
    const escalation = shouldEscalateToHuman(content)
    const conversation = state.conversations.find((item) => item.id === conversationId)

    if (!conversation) return

    const customerMessage = createMessage(conversationId, 'cliente', conversation.customer.name, content)
    const aiMessage = escalation
      ? createMessage(
          conversationId,
          'sistema',
          'Sistema CRC',
          'Recebi seu pedido e transferi a conversa para um atendente humano com o histórico já resumido.',
        )
      : createMessage(conversationId, 'ia', conversation.agentName, buildAssistantReply(content))

    set((current) => ({
      conversations: updateConversation(current.conversations, conversationId, (item) => ({
        ...item,
        status: escalation ? 'aguardando_humano' : 'em_atendimento_ia',
        updatedAt: new Date().toISOString(),
        subject: escalation ? 'Solicitação com necessidade de humano' : item.subject,
        priority: escalation ? 'alta' : item.priority,
        summary: escalation
          ? 'Cliente pediu humano ou reportou situação sensível. Conversa pronta para assunção do CRC.'
          : 'IA respondeu no portal e manteve a conversa em autoatendimento.',
        messages: [...item.messages, customerMessage, aiMessage],
      })),
    }))
  },
  sendInternalMessage: (conversationId, content) => {
    const user = get().currentUser
    if (!user) return

    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (item) => ({
        ...item,
        status: 'em_atendimento_humano',
        assignedTo: user.id,
        updatedAt: new Date().toISOString(),
        messages: [...item.messages, createMessage(conversationId, 'atendente', user.name, content)],
      })),
    }))
  },
  assumeConversation: (conversationId) => {
    const user = get().currentUser
    if (!user) return

    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (item) => ({
        ...item,
        status: 'em_atendimento_humano',
        assignedTo: user.id,
        updatedAt: new Date().toISOString(),
        messages: [
          ...item.messages,
          createMessage(conversationId, 'sistema', 'Sistema CRC', `${user.name} assumiu a conversa em tempo real.`),
        ],
      })),
    }))
  },
  finalizeConversation: (conversationId, satisfaction) => {
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (item) => ({
        ...item,
        status: 'finalizada',
        updatedAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString(),
        satisfaction: satisfaction ?? item.satisfaction ?? 5,
        messages: [
          ...item.messages,
          createMessage(conversationId, 'sistema', 'Sistema CRC', 'Atendimento finalizado e enviado para avaliação.'),
        ],
      })),
    }))
  },
}))
