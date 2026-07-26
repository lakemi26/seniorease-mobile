import { Modal, View, StyleSheet, AccessibilityInfo } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'

interface UnsavedChangesDialogProps {
  visible: boolean
  onContinueEditing: () => void
  onDiscard: () => void
}

export function UnsavedChangesDialog({ visible, onContinueEditing, onDiscard }: UnsavedChangesDialogProps) {
  const { colors, spacing } = useTheme()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinueEditing}
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
          accessibilityLabel="Descartar alterações?"
        >
          <ThemeText variant="title" style={{ textAlign: 'center' }}>
            Descartar alterações?
          </ThemeText>
          <ThemeText variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
            As configurações modificadas ainda não foram salvas.
          </ThemeText>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <AppButton
              title="Continuar editando"
              onPress={() => {
                AccessibilityInfo.announceForAccessibility('Continuar editando')
                onContinueEditing()
              }}
              variant="primary"
            />
            <AppButton
              title="Descartar alterações"
              onPress={() => {
                AccessibilityInfo.announceForAccessibility('Alterações descartadas')
                onDiscard()
              }}
              variant="danger"
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
