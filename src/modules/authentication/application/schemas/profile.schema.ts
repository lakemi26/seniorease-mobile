import { z } from 'zod'

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe seu nome.')
    .min(2, 'Use pelo menos 2 caracteres.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.')
    .transform((val) => val.replace(/\s+/g, ' ')),
})

export type ProfileFormData = z.input<typeof profileSchema>
