import { Modal, View, StyleSheet, AccessibilityInfo } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'

interface RestoreDialogProps {
  visible: boolean
  onCancel: () => void
  onRestore: () => void
}

export function RestoreDialog({ visible, onCancel, onRestore }: RestoreDialogProps) {
  const { colors, spacing } = useTheme()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: spacing.xl,
              gap: spacing.lg,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLabel="Restaurar configurações?"
        >
          <ThemeText variant="title" style={{ textAlign: 'center' }}>
            Restaurar configurações?
          </ThemeText>
          <ThemeText variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
            O tamanho do texto, contraste, espaçamento e demais preferências voltarão ao padrão.
          </ThemeText>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <AppButton
              title="Restaurar"
              onPress={() => {
                AccessibilityInfo.announceForAccessibility('Preferências restauradas para o padrão. Salve as alterações para confirmar.')
                onRestore()
              }}
              variant="danger"
            />
            <AppButton
              title="Cancelar"
              onPress={() => {
                AccessibilityInfo.announceForAccessibility('Cancelar')
                onCancel()
              }}
              variant="ghost"
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
    borderWidth: 1,
  },
})
