import { Modal, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { radius } from '@/shared/theme/radius'

interface DeleteActivityDialogProps {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export function DeleteActivityDialog({ visible, onConfirm, onCancel, isDeleting = false }: DeleteActivityDialogProps) {
  const { colors, spacing } = useTheme()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
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
          <ThemeText variant="subtitle">Excluir atividade?</ThemeText>
          <ThemeText variant="body" style={{ color: colors.textMuted }}>
            Esta ação não poderá ser desfeita.
          </ThemeText>

          <View style={[styles.actions, { gap: spacing.md }]}>
            <AppButton
              title="Cancelar"
              onPress={onCancel}
              variant="secondary"
              disabled={isDeleting}
            />
            <AppButton
              title="Excluir atividade"
              onPress={onConfirm}
              variant="danger"
              loading={isDeleting}
              disabled={isDeleting}
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
    flexDirection: 'column',
  },
})
