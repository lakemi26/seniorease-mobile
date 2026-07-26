import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/theme-context'
import { AppButton } from '@/components/ui/app-button'

interface SettingsActionFooterProps {
  hasUnsavedChanges: boolean
  saving: boolean
  onDiscard: () => void
  onSave: () => void
}

export function SettingsActionFooter({ hasUnsavedChanges, saving, onDiscard, onSave }: SettingsActionFooterProps) {
  const { colors, spacing, fontSizeMultiplier, contrast } = useTheme()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const isNarrow = width < 380 || fontSizeMultiplier > 1.2
  const isDarkContrast = contrast === 'dark' || contrast === 'high'

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: Math.max(insets.bottom, spacing.md),
          gap: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
      ]}
      accessibilityLabel="Rodapé de ações"
    >
      <View
        style={[
          styles.row,
          isNarrow ? styles.column : styles.row,
          { gap: spacing.sm },
        ]}
      >
        <AppButton
          title="Salvar alterações"
          onPress={onSave}
          loading={saving}
          disabled={!hasUnsavedChanges || saving}
          variant="primary"
          fullWidth={isNarrow}
          accessibilityLabel={`Salvar alterações${!hasUnsavedChanges || saving ? ', desabilitado' : ''}`}
          accessibilityHint="Salva as configurações alteradas"
        />
        <AppButton
          title="Descartar"
          onPress={onDiscard}
          disabled={!hasUnsavedChanges || saving}
          variant={isDarkContrast ? 'outline' : 'ghost'}
          fullWidth={isNarrow}
          accessibilityLabel={`Descartar alterações${!hasUnsavedChanges || saving ? ', desabilitado' : ''}`}
          accessibilityHint="Descarta as alterações não salvas"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
})
