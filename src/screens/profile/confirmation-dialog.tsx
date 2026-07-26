import { Modal, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'

interface ConfirmationDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  destructive?: boolean
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}: ConfirmationDialogProps) {
  const { colors, spacing, radius, contrast } = useTheme()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: spacing.xl,
              gap: spacing.lg,
              borderWidth: contrast === 'high' ? 2 : 0,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="alert"
        >
          <View style={{ gap: spacing.xs }}>
            <ThemeText variant="subtitle" style={{ color: colors.text }}>
              {title}
            </ThemeText>
            <ThemeText variant="body" color={colors.textMuted}>
              {message}
            </ThemeText>
          </View>
          <View style={{ gap: spacing.sm }}>
            <AppButton
              title={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
              loading={loading}
              disabled={loading}
            />
            <AppButton
              title={cancelLabel}
              onPress={onCancel}
              variant="ghost"
              disabled={loading}
              fullWidth
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
    maxWidth: 360,
  },
})
