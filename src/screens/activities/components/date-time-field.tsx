import { useState, useEffect, useCallback } from 'react'
import { View, TextInput, Pressable, StyleSheet } from 'react-native'
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
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function toStorageDate(displayStr: string): string {
  const cleaned = displayStr.replace(/\D/g, '')
  if (cleaned.length !== 8) return ''
  return `${cleaned.slice(4, 8)}-${cleaned.slice(2, 4)}-${cleaned.slice(0, 2)}`
}

function formatTimeInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
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
  const [inputValue, setInputValue] = useState(dateValue ? toDisplayDate(dateValue) : '')

  useEffect(() => {
    setInputValue(dateValue ? toDisplayDate(dateValue) : '')
  }, [dateValue])

  const handleTextChange = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8)
    let formatted = ''
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 4) formatted += '/'
      formatted += digits[i]
    }
    setInputValue(formatted)

    if (formatted.length === 10) {
      const storage = toStorageDate(formatted)
      const y = parseInt(storage.slice(0, 4), 10)
      const m = parseInt(storage.slice(5, 7), 10) - 1
      const d = parseInt(storage.slice(8, 10), 10)
      const date = new Date(y, m, d)
      if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
        onDateChange(storage)
      }
    }
  }, [onDateChange])

  const handleTimeChange = useCallback((text: string) => {
    onTimeChange(formatTimeInput(text))
  }, [onTimeChange])

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <ThemeText variant="label">
          Data <ThemeText variant="caption" color={colors.danger}>*</ThemeText>
        </ThemeText>
        <TextInput
          value={inputValue}
          onChangeText={handleTextChange}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
          accessibilityLabel="Data"
          accessibilityHint="Digite a data no formato dia, mês, ano"
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: dateError ? colors.danger : colors.border,
              borderRadius: 12,
              paddingHorizontal: spacing.lg,
              color: colors.text,
              minHeight: touchSize.min,
              fontSize: 16,
            },
          ]}
        />
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
          <TextInput
            value={timeValue}
            onChangeText={handleTimeChange}
            placeholder="HH:MM"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={5}
            accessibilityLabel="Horário"
            accessibilityHint="Digite o horário no formato hora e minuto"
            style={[
              styles.field,
              {
                backgroundColor: colors.surface,
                borderColor: timeError ? colors.danger : colors.border,
                borderRadius: 12,
                paddingHorizontal: spacing.lg,
                minHeight: touchSize.min,
                flex: 1,
                color: colors.text,
                fontSize: 16,
              },
            ]}
          />
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
  input: {
    borderWidth: 1.5,
  },
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
