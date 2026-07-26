import { Modal, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { radius } from '@/shared/theme/radius'

interface PastDateDialogProps {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PastDateDialog({ visible, onConfirm, onCancel }: PastDateDialogProps) {
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
          <ThemeText variant="subtitle">A data escolhida já passou.</ThemeText>
          <ThemeText variant="body" style={{ color: colors.textMuted }}>
            Deseja salvar esta atividade mesmo assim?
          </ThemeText>

          <View style={[styles.actions, { gap: spacing.md }]}>
            <AppButton
              title="Voltar e corrigir"
              onPress={onCancel}
              variant="secondary"
            />
            <AppButton
              title="Salvar mesmo assim"
              onPress={onConfirm}
              variant="primary"
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
