import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/theme-context'
import { AppButton } from '@/components/ui/app-button'

interface StickyActionFooterProps {
  showBack: boolean
  nextLabel: string
  onBack: () => void
  onNext: () => void
  saving?: boolean
  nextDisabled?: boolean
}

export function StickyActionFooter({ showBack, nextLabel, onBack, onNext, saving, nextDisabled }: StickyActionFooterProps) {
  const { colors, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const isSmallScreen = height < 700

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: isSmallScreen ? Math.max(insets.bottom, spacing.sm) : Math.max(insets.bottom, spacing.lg),
          gap: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
      ]}
    >
      <AppButton
        title={nextLabel}
        onPress={onNext}
        loading={saving}
        disabled={nextDisabled}
      />
      {showBack ? (
        <AppButton
          title="Voltar"
          onPress={onBack}
          variant="ghost"
          disabled={saving}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
})
