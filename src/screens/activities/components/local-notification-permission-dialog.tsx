import { Modal, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'

interface LocalNotificationPermissionDialogProps {
  visible: boolean
  onAllow: () => void
  onDismiss: () => void
  isRequesting?: boolean
}

export function LocalNotificationPermissionDialog({
  visible,
  onAllow,
  onDismiss,
  isRequesting = false,
}: LocalNotificationPermissionDialogProps) {
  const { colors, spacing, radius } = useTheme()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}> 
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg }]}> 
          <ThemeText variant="subtitle" style={{ color: colors.text }}>
            Permitir lembretes neste dispositivo?
          </ThemeText>
          <ThemeText variant="body" style={{ color: colors.textMuted }}>
            O SeniorEase pode enviar lembretes das suas atividades neste dispositivo.
          </ThemeText>
          <View style={{ gap: spacing.sm }}>
            <AppButton title="Permitir lembretes" onPress={onAllow} loading={isRequesting} disabled={isRequesting} />
            <AppButton title="Agora não" onPress={onDismiss} variant="ghost" disabled={isRequesting} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
  },
})
