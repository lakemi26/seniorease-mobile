import type { OnboardingStep } from '@/modules/onboarding/domain/entities'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, title: 'Boas-vindas', description: 'Vamos preparar o SeniorEase para você.' },
  { id: 2, title: 'Tamanho do texto', description: 'Qual tamanho de texto fica mais confortável?' },
  { id: 3, title: 'Contraste e espaçamento', description: 'Como você prefere visualizar a tela?' },
  { id: 4, title: 'Modo da interface', description: 'Quanto conteúdo você prefere ver?' },
  { id: 5, title: 'Segurança e feedback', description: 'Escolha como o SeniorEase deve orientar você.' },
  { id: 6, title: 'Revisão', description: 'Confira suas escolhas.' },
]

export const STEP_LABELS = ONBOARDING_STEPS.map(s => ({
  id: s.id,
  label: s.title,
}))
