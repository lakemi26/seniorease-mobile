import { z } from 'zod'

export const passwordRecoverySchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Digite um endereço de e-mail válido.'),
})

export type PasswordRecoveryFormData = z.infer<typeof passwordRecoverySchema>
