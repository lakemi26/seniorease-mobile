import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Digite um endereço de e-mail válido.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.')
    .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  rememberMe: z.boolean().default(false),
})

export type LoginFormData = z.input<typeof loginSchema>
