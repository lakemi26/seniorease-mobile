import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'

export function HelpCard() {
  const { colors, spacing, radius, shadows } = useTheme()
  const router = useRouter()

  return (
    <ThemeView
      surface
      style={[
        styles.card,
        {
          padding: spacing.lg,
          borderRadius: radius.lg,
          borderColor: colors.border,
          ...Platform.select({ web: shadows.sm, default: shadows.sm }),
        },
      ]}
      accessibilityLabel="Precisa de ajuda?"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="help-circle-outline" size={28} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemeText variant="body" style={{ color: colors.text }}>
            Precisa de ajuda?
          </ThemeText>
          <ThemeText variant="caption" style={{ color: colors.textMuted, marginTop: 2 }}>
            Veja orientações para criar, acompanhar ou concluir uma atividade.
          </ThemeText>
        </View>
      </View>
      <View style={{ marginTop: spacing.md }}>
        <Pressable
          onPress={() => router.push('/ajuda' as any)}
          style={({ pressed }) => [
            {
              borderWidth: 1.5,
              borderColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: spacing.xl,
              borderRadius: radius.md,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Abrir página de ajuda"
        >
          <ThemeText variant="body" style={{ color: colors.primary, fontWeight: '600' }}>
            Abrir ajuda
          </ThemeText>
        </Pressable>
      </View>
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
