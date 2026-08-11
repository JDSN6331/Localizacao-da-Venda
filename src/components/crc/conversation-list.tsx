import { Link } from 'react-router-dom'

import { StatusChip } from '@/components/crc/status-chip'
import type { Conversation } from '@/types/crc'

type ConversationListProps = {
  conversations: Conversation[]
}

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Link
          className="block rounded-[24px] border border-white/8 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
          key={conversation.id}
          to={`/app/conversas/${conversation.id}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-[#f8f3e8]">{conversation.customer.name}</p>
              <p className="mt-1 text-sm text-[#9fb5ab]">
                {conversation.subject} · {conversation.protocol}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusChip status={conversation.status} />
              <StatusChip priority={conversation.priority} />
            </div>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#c7d2cd]">{conversation.summary}</p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.28em] text-[#779687]">
            <span>{conversation.assignedTeam}</span>
            <span>{conversation.tags.join(' · ')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
