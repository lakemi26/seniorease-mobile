import { Modal, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { radius } from '@/shared/theme/radius'

interface ReopenStepDialogProps {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ReopenStepDialog({ visible, onConfirm, onCancel, isLoading = false }: ReopenStepDialogProps) {
  const { colors, spacing } = useTheme()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
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
          <ThemeText variant="subtitle">Reabrir esta etapa?</ThemeText>
          <ThemeText variant="body" color="muted">
            O progresso da atividade será atualizado.
          </ThemeText>
          <View style={[styles.actions, { gap: spacing.md }]}>
            <AppButton title="Cancelar" onPress={onCancel} variant="secondary" disabled={isLoading} />
            <AppButton title="Reabrir etapa" onPress={onConfirm} variant="primary" loading={isLoading} disabled={isLoading} />
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
