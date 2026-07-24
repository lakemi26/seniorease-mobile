const errorMessages: Record<string, string> = {
  'auth/invalid-email': 'Digite um endereço de e-mail válido.',
  'auth/invalid-credential': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
  'auth/user-disabled': 'Esta conta está temporariamente indisponível. Entre em contato com o suporte.',
  'auth/user-not-found': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
  'auth/wrong-password': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
  'auth/too-many-requests': 'Foram realizadas muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Não foi possível conectar. Verifique sua internet e tente novamente.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail. Entre com sua senha ou recupere o acesso.',
  'auth/weak-password': 'Crie uma senha com pelo menos 8 caracteres, incluindo uma letra e um número.',
  'auth/requires-recent-login': 'Por segurança, faça login novamente antes de alterar esta informação.',
  'auth/operation-not-allowed': 'Esta operação não está disponível no momento. Tente novamente mais tarde.',
}

const defaultMessage = 'Não foi possível entrar agora. Tente novamente em alguns instantes.'

const recoveryDefaultMessage = 'Não foi possível enviar as instruções. Tente novamente em alguns instantes.'

const registrationDefaultMessage = 'Não foi possível criar sua conta agora. Tente novamente em alguns instantes.'

export function translateAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return errorMessages[code] || defaultMessage
  }
  return defaultMessage
}

export function translateRecoveryError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return errorMessages[code] || recoveryDefaultMessage
  }
  return recoveryDefaultMessage
}

export function translateRegistrationError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return errorMessages[code] || registrationDefaultMessage
  }
  return registrationDefaultMessage
}
