const COOXUPE_DOMAIN_REGEX = /^[a-z0-9._%+-]+@cooxupe\.com\.br$/i

export function isCooxupeEmail(email: string) {
  return COOXUPE_DOMAIN_REGEX.test(email.trim())
}

export function getAuthFeedback(email: string) {
  if (!email.trim()) {
    return 'Informe seu e-mail corporativo.'
  }

  if (!isCooxupeEmail(email)) {
    return 'Use obrigatoriamente um e-mail com domínio @cooxupe.com.br.'
  }

  return 'Domínio corporativo validado.'
}
