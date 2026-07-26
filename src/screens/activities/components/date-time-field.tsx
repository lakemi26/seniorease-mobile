import { useState } from 'react'
import { View, Pressable, Platform, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'

interface DateTimeFieldProps {
  dateValue: string
  hasTime: boolean
  timeValue: string
  onDateChange: (date: string) => void
  onHasTimeChange: (hasTime: boolean) => void
  onTimeChange: (time: string) => void
  dateError?: string
  timeError?: string
}

function toDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Selecionar data'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function toDisplayTime(timeStr: string): string {
  if (!timeStr) return 'Selecionar horário'
  return timeStr
}

export function DateTimeField({
  dateValue,
  hasTime,
  timeValue,
  onDateChange,
  onHasTimeChange,
  onTimeChange,
  dateError,
  timeError,
}: DateTimeFieldProps) {
  const { colors, spacing } = useTheme()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const handleDateSelected = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const time = `${y}-${m}-${d}`

    if (!dateValue) {
      onDateChange(time)
    }
    setShowDatePicker(false)
  }

  const handleTimeSelected = () => {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    if (!timeValue) {
      onTimeChange(`${h}:${m}`)
    }
    setShowTimePicker(false)
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <ThemeText variant="label">
          Data <ThemeText variant="caption" color={colors.danger}>*</ThemeText>
        </ThemeText>
        <Pressable
          onPress={handleDateSelected}
          accessibilityRole="button"
          accessibilityLabel={`Data: ${toDisplayDate(dateValue)}`}
          accessibilityHint="Toque para definir a data"
          style={[
            styles.field,
            {
              backgroundColor: colors.surface,
              borderColor: dateError ? colors.danger : colors.border,
              borderRadius: 12,
              paddingHorizontal: spacing.lg,
              minHeight: touchSize.min,
            },
          ]}
        >
          <ThemeText
            variant="body"
            color={dateValue ? colors.text : colors.textMuted}
          >
            {toDisplayDate(dateValue)}
          </ThemeText>
        </Pressable>
        {dateError && (
          <ThemeText variant="caption" color={colors.danger} accessibilityRole="alert">
            {dateError}
          </ThemeText>
        )}
      </View>

      <View style={[styles.switchRow, { gap: spacing.sm }]}>
        <Pressable
          onPress={() => onHasTimeChange(!hasTime)}
          accessibilityRole="switch"
          accessibilityState={{ checked: hasTime }}
          accessibilityLabel={`Atividade com horário: ${hasTime ? 'sim' : 'não'}`}
          style={[
            styles.switchChip,
            {
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              minHeight: touchSize.min,
            },
            hasTime
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ThemeText
            variant="label"
            color={hasTime ? colors.surface : colors.text}
          >
            Possui horário
          </ThemeText>
        </Pressable>

        {hasTime && (
          <Pressable
            onPress={handleTimeSelected}
            accessibilityRole="button"
            accessibilityLabel={`Horário: ${toDisplayTime(timeValue)}`}
            accessibilityHint="Toque para definir o horário"
            style={[
              styles.field,
              {
                backgroundColor: colors.surface,
                borderColor: timeError ? colors.danger : colors.border,
                borderRadius: 12,
                paddingHorizontal: spacing.lg,
                minHeight: touchSize.min,
                flex: 1,
              },
            ]}
          >
            <ThemeText
              variant="body"
              color={timeValue ? colors.text : colors.textMuted}
            >
              {toDisplayTime(timeValue)}
            </ThemeText>
          </Pressable>
        )}
      </View>

      {timeError && hasTime && (
        <ThemeText variant="caption" color={colors.danger} accessibilityRole="alert">
          {timeError}
        </ThemeText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchChip: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
})
