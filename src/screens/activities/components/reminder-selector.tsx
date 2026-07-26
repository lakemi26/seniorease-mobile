import { View, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'

const REMINDER_OPTIONS = [
  { value: 'none', label: 'Sem lembrete' },
  { value: 'atTime', label: 'No horário' },
  { value: '15min', label: '15 minutos antes' },
  { value: '30min', label: '30 minutos antes' },
  { value: '1hour', label: '1 hora antes' },
  { value: '1day', label: '1 dia antes' },
  { value: 'custom', label: 'Personalizado' },
] as const

type ReminderOption = (typeof REMINDER_OPTIONS)[number]['value']

interface ReminderSelectorProps {
  value: string
  onChange: (option: string) => void
  hasTime: boolean
  error?: string
}

export function ReminderSelector({ value, onChange, hasTime, error }: ReminderSelectorProps) {
  const { colors, spacing } = useTheme()

  const availableOptions = REMINDER_OPTIONS.filter(
    (opt) => opt.value === 'none' || hasTime,
  )

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemeText variant="label">Lembrete</ThemeText>

      <View style={[styles.grid, { gap: spacing.sm }]} accessibilityRole="radiogroup" accessibilityLabel="Selecionar lembrete">
        {availableOptions.map((opt) => {
          const selected = value === opt.value
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${opt.label}${selected ? ', selecionado' : ''}`}
              style={[
                styles.option,
                {
                  borderRadius: radius.md,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  minHeight: touchSize.min,
                },
                selected
                  ? {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                    }
                  : {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
              ]}
            >
              <ThemeText
                variant="body"
                color={selected ? colors.primary : colors.text}
              >
                {opt.label}
              </ThemeText>
            </Pressable>
          )
        })}
      </View>

      {!hasTime && value !== 'none' && value !== 'custom' && (
        <ThemeText variant="caption" color={colors.warning}>
          Atividades sem horário só podem ter lembrete personalizado.
        </ThemeText>
      )}

      {error && (
        <ThemeText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </ThemeText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    borderWidth: 1.5,
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
