import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'

interface ActivityEmptyStateProps {
  hasFilters: boolean
  onCreatePress?: () => void
  onClearFilters?: () => void
}

export function ActivityEmptyState({ hasFilters, onCreatePress, onClearFilters }: ActivityEmptyStateProps) {
  const { spacing } = useTheme()

  if (hasFilters) {
    return (
      <View style={[styles.container, { gap: spacing.lg, padding: spacing.xl }]}>
        <ThemeText variant="title" style={styles.center}>
          Nenhuma atividade encontrada.
        </ThemeText>
        <ThemeText variant="body" color="muted" style={styles.center}>
          Tente alterar os filtros ou a busca.
        </ThemeText>
        {onClearFilters && (
          <AppButton
            title="Limpar filtros"
            onPress={onClearFilters}
            variant="outline"
          />
        )}
        {onCreatePress && (
          <AppButton
            title="Criar atividade"
            onPress={onCreatePress}
            variant="primary"
          />
        )}
      </View>
    )
  }

  return (
    <View style={[styles.container, { gap: spacing.lg, padding: spacing.xl }]}>
      <ThemeText variant="title" style={styles.center}>
        Você ainda não possui atividades.
      </ThemeText>
      <ThemeText variant="body" color="muted" style={styles.center}>
        Crie sua primeira atividade para começar a organizar sua rotina.
      </ThemeText>
      {onCreatePress && (
        <AppButton
          title="Criar atividade"
          onPress={onCreatePress}
          variant="primary"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
})
