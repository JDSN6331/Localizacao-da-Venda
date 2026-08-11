import { useMemo, useState } from 'react'
import { MessageSquareMore, Send, ShieldAlert } from 'lucide-react'

import { StatusChip } from '@/components/crc/status-chip'
import type { Conversation } from '@/types/crc'

type ChatWindowProps = {
  conversation: Conversation
  currentActorName: string
  composerLabel: string
  onSubmit: (content: string) => void
}

export function ChatWindow({ conversation, currentActorName, composerLabel, onSubmit }: ChatWindowProps) {
  const [draft, setDraft] = useState('')
  const orderedMessages = useMemo(
    () => [...conversation.messages].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
    [conversation.messages],
  )

  return (
    <div className="flex h-full min-h-[560px] flex-col rounded-[28px] border border-white/8 bg-[#0f241d]/85 shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-[30px] text-[#f8f3e8]">{conversation.customer.name}</h2>
            <StatusChip status={conversation.status} />
            <StatusChip priority={conversation.priority} />
          </div>
          <p className="mt-2 text-sm text-[#b7c7be]">
            {conversation.subject} · {conversation.protocol} · {conversation.customer.city ?? 'Atendimento digital'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#8fb8a8]">Origem atual</p>
          <p className="mt-2 text-sm font-semibold text-[#f8f3e8]">{currentActorName}</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {orderedMessages.map((message) => {
          const fromCustomer = message.origin === 'cliente'
          const fromSystem = message.origin === 'sistema'

          return (
            <div key={message.id} className={`flex ${fromCustomer ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-[24px] px-4 py-4 text-sm leading-7 shadow-[0_12px_30px_rgba(0,0,0,0.16)] ${
                  fromCustomer
                    ? 'bg-[#d9c7a4] text-[#10241d]'
                    : fromSystem
                      ? 'border border-[#80573a]/50 bg-[#38271c] text-[#f8d7be]'
                      : 'border border-white/8 bg-[#17352b] text-[#ebf2ed]'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] opacity-80">
                  {fromSystem ? <ShieldAlert className="h-3.5 w-3.5" /> : <MessageSquareMore className="h-3.5 w-3.5" />}
                  {message.authorName}
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          )
        })}
      </div>

      <form
        className="border-t border-white/8 px-6 py-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!draft.trim()) return
          onSubmit(draft.trim())
          setDraft('')
        }}
      >
        <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fb8a8]">{composerLabel}</label>
        <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-2">
          <input
            className="h-12 flex-1 rounded-[20px] border-0 bg-transparent px-4 text-sm text-[#f8f3e8] outline-none placeholder:text-[#7ea293]"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escreva a próxima mensagem"
            value={draft}
          />
          <button
            className="inline-flex h-12 items-center gap-2 rounded-[18px] bg-[#d9c7a4] px-5 text-sm font-semibold text-[#10241d] transition hover:brightness-105"
            type="submit"
          >
            Enviar
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
