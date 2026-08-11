function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function shouldEscalateToHuman(message: string) {
  const text = normalizeText(message)

  return [
    'humano',
    'atendente',
    'urgente',
    'reclamacao',
    'erro',
    'financeiro',
    'cancelamento',
    'nao resolveu',
  ].some((keyword) => text.includes(keyword))
}

export function buildAssistantReply(message: string) {
  const text = normalizeText(message)

  if (text.includes('salesforce') || text.includes('crm')) {
    return 'Consigo orientar no Salesforce, revisar fluxo comercial e indicar o passo seguinte. Se você me contar o erro, eu já resumo a análise para o CRC assumir com contexto.'
  }

  if (text.includes('senha') || text.includes('acesso')) {
    return 'Posso ajudar com acesso. Primeiro confirme qual ambiente está tentando usar e se o bloqueio acontece no login, na autenticação multifator ou na permissão da tela.'
  }

  if (text.includes('pedido') || text.includes('protocolo')) {
    return 'Já posso registrar essa consulta no CRC e manter o histórico centralizado. Me envie o número do pedido ou protocolo para eu contextualizar a conversa.'
  }

  if (text.includes('obrigado') || text.includes('valeu')) {
    return 'Perfeito. Se surgir algo novo, sigo por aqui e, quando necessário, transfiro para um atendente com todo o histórico resumido.'
  }

  return 'Estou analisando sua solicitação como Assistente do Salesforce. Posso orientar agora e, se o caso exigir ação humana, transfiro para a fila do CRC com o contexto já organizado.'
}
