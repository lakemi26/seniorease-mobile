import { z } from 'zod'

export const cadastroSchema = z
  .object({
    name: z
      .string()
      .min(1, 'O nome é obrigatório.')
      .min(2, 'O nome deve ter pelo menos 2 caracteres.')
      .trim(),
    email: z
      .string()
      .min(1, 'O e-mail é obrigatório.')
      .email('Digite um endereço de e-mail válido.'),
    password: z
      .string()
      .min(1, 'A senha é obrigatória.')
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .regex(/[a-zA-Z]/, 'A senha deve conter pelo menos uma letra.')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número.'),
    confirmPassword: z.string().min(1, 'A confirmação da senha é obrigatória.'),
    terms: z.literal(true, { message: 'Você precisa aceitar os termos de uso e a política de privacidade.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export type CadastroFormData = z.input<typeof cadastroSchema>
