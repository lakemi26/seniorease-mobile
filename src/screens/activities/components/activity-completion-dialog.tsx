import { Modal, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { usePreferences } from '@/contexts/preferences-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { radius } from '@/shared/theme/radius'

interface ActivityCompletionDialogProps {
  visible: boolean
  onReviewSteps: () => void
  onComplete: () => void
  isProcessing?: boolean
}

export function ActivityCompletionDialog({ visible, onReviewSteps, onComplete, isProcessing = false }: ActivityCompletionDialogProps) {
  const { colors, spacing } = useTheme()
  const { preferences } = usePreferences()
  const confirmCritical = preferences.confirmCriticalActions

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onReviewSteps}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.xl,
              gap: spacing.lg,
            },
          ]}
        >
          <ThemeText variant="subtitle">Todas as etapas foram concluídas.</ThemeText>
          <ThemeText variant="body" color="muted">
            Deseja concluir esta atividade?
          </ThemeText>
          <View style={[styles.actions, { gap: spacing.md }]}>
            <AppButton
              title="Revisar etapas"
              onPress={onReviewSteps}
              variant={confirmCritical ? 'primary' : 'secondary'}
              disabled={isProcessing}
            />
            <AppButton
              title="Concluir atividade"
              onPress={onComplete}
              variant={confirmCritical ? 'secondary' : 'primary'}
              loading={isProcessing}
              disabled={isProcessing}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
  },
  actions: {
    flexDirection: 'row',
  },
})
