import { z } from 'zod'

export const activityCategoryValues = [
  'health',
  'studies',
  'work',
  'appointments',
  'documents',
  'home',
  'shopping',
  'personal',
  'other',
] as const

export const activityPriorityValues = ['low', 'medium', 'high'] as const

export const reminderOptions = [
  'none',
  'atTime',
  '15min',
  '30min',
  '1hour',
  '1day',
  'custom',
] as const

const stepSchema = z.object({
  _key: z.string(),
  title: z.string().min(1, 'O título da etapa é obrigatório.'),
})

function normalizeToMinute(date: Date): Date {
  const normalized = new Date(date)
  normalized.setSeconds(0, 0)
  return normalized
}

function normalizeToDay(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export const activityFormSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Informe um título para a atividade.')
      .min(3, 'Use pelo menos 3 caracteres.')
      .max(100, 'O título deve ter no máximo 100 caracteres.')
      .transform((v) => v.trim()),
    description: z
      .string()
      .max(500, 'A descrição deve ter no máximo 500 caracteres.')
      .optional()
      .default(''),
    category: z.enum(activityCategoryValues, { message: 'Selecione uma categoria.' }),
    date: z.string().min(1, 'Selecione uma data.'),
    hasTime: z.boolean().default(false),
    time: z.string().optional().default(''),
    priority: z.enum(activityPriorityValues, { message: 'Selecione uma prioridade.' }),
    steps: z.array(stepSchema).default([]),
    reminderOption: z.enum(reminderOptions).default('none'),
    reminderDate: z.string().optional().default(''),
    reminderTime: z.string().optional().default(''),
    confirmPastDate: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.hasTime && !data.time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['time'],
        message: 'Informe o horário.',
      })
    }

    const scheduledDate = new Date(data.date + (data.hasTime && data.time ? `T${data.time}:00` : 'T00:00:00'))
    const now = new Date()

    if (isNaN(scheduledDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date'],
        message: 'Data inválida.',
      })
    }

    if (!isNaN(scheduledDate.getTime())) {
      const scheduledComparable = data.hasTime
        ? normalizeToMinute(scheduledDate)
        : normalizeToDay(scheduledDate)
      const nowComparable = data.hasTime
        ? normalizeToMinute(now)
        : normalizeToDay(now)

      if (scheduledComparable < nowComparable && !data.confirmPastDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPastDate'],
          message: 'Confirme que deseja salvar uma atividade no passado.',
        })
      }
    }

    if (data.reminderOption !== 'none' && data.reminderOption !== 'custom') {
      if (!data.hasTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reminderOption'],
          message: 'Atividades sem horário definido só podem ter lembrete personalizado.',
        })
      }
    }

    if (data.reminderOption === 'custom') {
      if (!data.reminderDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reminderDate'],
          message: 'Selecione a data do lembrete.',
        })
      }
      if (!data.reminderTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reminderTime'],
          message: 'Selecione o horário do lembrete.',
        })
      }
      if (data.reminderDate && data.reminderTime) {
        const reminderDate = new Date(`${data.reminderDate}T${data.reminderTime}:00`)
        if (reminderDate > scheduledDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reminderDate'],
            message: 'O lembrete não pode acontecer depois da atividade.',
          })
        }
      }
    }

    if (data.steps.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['steps'],
        message: 'A atividade pode ter no máximo 20 etapas.',
      })
    }
  })

export type ActivityFormData = z.input<typeof activityFormSchema>
