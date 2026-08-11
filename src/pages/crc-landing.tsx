import { ArrowRight, Bot, ChartColumnIncreasing, ShieldCheck, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHero } from '@/components/crc/page-hero'
import { PanelCard } from '@/components/crc/panel-card'

const highlights = [
  {
    icon: Bot,
    title: 'IA com contexto do CRC',
    description: 'O atendimento começa com um agente orientado por prompt e base de conhecimento, sem perder histórico quando houver handoff.',
  },
  {
    icon: UsersRound,
    title: 'Handoff humano em tempo real',
    description: 'Atendentes assumem conversas diretamente da fila, com resumo contextual, prioridade e trilha de auditoria.',
  },
  {
    icon: ChartColumnIncreasing,
    title: 'Gestão no mesmo ambiente',
    description: 'SLA, CSAT, taxa de automação e gargalos operacionais ficam visíveis em dashboards feitos para decisão.',
  },
  {
    icon: ShieldCheck,
    title: 'Governança e segurança',
    description: 'Login corporativo com domínio @cooxupe.com.br, agentes versionados e configuração preparada para EasyPanel.',
  },
]

export default function CrcLandingPage() {
  return (
    <main className="min-h-screen bg-[#08130f] px-4 py-4 text-[#f8f3e8] lg:px-6">
      <div className="mx-auto max-w-[1680px] space-y-6">
        <PageHero
          title="CRC conversacional, gestão executiva e IA no mesmo produto."
          description="Uma experiência própria, profissional e moderna para substituir a dependência do WhatsApp como canal principal. Cliente conversa, IA atende, humano assume e a gestão acompanha tudo em tempo real."
          actions={
            <>
              <Link
                className="inline-flex items-center gap-2 rounded-[20px] bg-[#d9c7a4] px-6 py-4 text-sm font-semibold text-[#10241d] transition hover:brightness-105"
                to="/atendimento"
              >
                Iniciar atendimento
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-[#f8f3e8] transition hover:bg-white/10"
                to="/entrar"
              >
                Acessar área interna
              </Link>
            </>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon

            return (
              <article
                className="rounded-[28px] border border-white/8 bg-[#10261e]/90 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
                key={item.title}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9c7a4] text-[#10241d]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-[28px]">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#b7c7be]">{item.description}</p>
              </article>
            )
          })}
        </section>

        <PanelCard
          eyebrow="Jornada do produto"
          title="Canal do cliente, console CRC e gestão executiva já desenhados em uma única navegação."
          subtitle="O portal do cliente foi pensado para mobile e baixa fricção. Já o ambiente interno privilegia densidade, priorização e leitura operacional para o CRC."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#8fb8a8]">1. Portal do cliente</p>
              <p className="mt-3 text-sm leading-7 text-[#d7e0db]">
                Conversa simples, contexto claro e continuidade mesmo quando o caso migra da IA para o atendente.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#8fb8a8]">2. Operação CRC</p>
              <p className="mt-3 text-sm leading-7 text-[#d7e0db]">
                Fila viva, prioridade, assunção rápida, resumo do caso e ações de encerramento com registro analítico.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#8fb8a8]">3. Gestão e governança</p>
              <p className="mt-3 text-sm leading-7 text-[#d7e0db]">
                Indicadores operacionais, comparação entre agentes e rastreabilidade das mudanças mais sensíveis do sistema.
              </p>
            </div>
          </div>
        </PanelCard>
      </div>
    </main>
  )
}
