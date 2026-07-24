export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message = 'Sua sessão expirou. Faça login novamente.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}
