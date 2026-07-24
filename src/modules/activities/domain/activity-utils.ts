import type { Activity, ActivityCategory } from './entities'
export { isActivityDelayed, isActivityScheduledBefore } from './activity-date'

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function getStatusLabel(status: Activity['status']): string {
  const map: Record<Activity['status'], string> = {
    pending: 'A fazer',
    inProgress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  }
  return map[status]
}

export function getPriorityLabel(priority: Activity['priority']): string {
  const map: Record<Activity['priority'], string> = {
    low: 'Baixa',
    medium: 'Normal',
    high: 'Alta',
  }
  return map[priority]
}

export function completedStepsCount(steps: Activity['steps']): number {
  return steps.filter((s) => s.completed).length
}

export function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const aTime = a.scheduledAt.getTime()
    const bTime = b.scheduledAt.getTime()
    if (aTime !== bTime) return aTime - bTime
    if (a.hasTime && !b.hasTime) return -1
    if (!a.hasTime && b.hasTime) return 1
    return 0
  })
}

export function formatCharacterCount(current: number, max: number): string {
  return `${current} de ${max} caracteres`
}

export const CATEGORY_OPTIONS: { value: ActivityCategory; label: string }[] = [
  { value: 'health', label: 'Saúde' },
  { value: 'studies', label: 'Estudos' },
  { value: 'work', label: 'Trabalho' },
  { value: 'appointments', label: 'Compromissos' },
  { value: 'documents', label: 'Documentos' },
  { value: 'home', label: 'Casa' },
  { value: 'shopping', label: 'Compras' },
  { value: 'personal', label: 'Tarefas pessoais' },
  { value: 'other', label: 'Outros' },
]

export function getCategoryLabel(category: ActivityCategory): string {
  return CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? category
}
