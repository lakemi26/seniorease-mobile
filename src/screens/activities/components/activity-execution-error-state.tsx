import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'

interface ActivityExecutionErrorStateProps {
  message: string
  onRetry: () => void
}

export function ActivityExecutionErrorState({ message, onRetry }: ActivityExecutionErrorStateProps) {
  const { spacing } = useTheme()
  return (
    <ThemeView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg }}>
      <ThemeText variant="title">Não foi possível carregar a atividade.</ThemeText>
      <ThemeText variant="body" color="muted" style={{ textAlign: 'center' }}>
        {message}
      </ThemeText>
      <AppButton title="Tentar novamente" onPress={onRetry} variant="primary" />
    </ThemeView>
  )
}
