import { useState, useEffect, useCallback } from 'react'
import { View, TextInput, Pressable, Platform, Modal, StyleSheet } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
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

  const openDatePicker = useCallback(() => {
    const initialDate = dateValue ? new Date(dateValue + 'T12:00:00') : new Date()

    if (Platform.OS === 'web') {
      const input = document.createElement('input')
      input.type = 'date'
      input.value = dateValue || ''
      input.addEventListener('input', () => {
        if (input.value) {
          onDateChange(input.value)
        }
      })
      input.showPicker()
      return
    }

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        display: 'default',
        onChange: (_event, selectedDate) => {
          if (selectedDate) {
            const y = selectedDate.getFullYear()
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
            const d = String(selectedDate.getDate()).padStart(2, '0')
            onDateChange(`${y}-${m}-${d}`)
          }
        },
      })
    } else {
      setShowDatePicker(true)
    }
  }, [dateValue, onDateChange])

  const handleDatePickerChange = useCallback((_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      const y = selectedDate.getFullYear()
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const d = String(selectedDate.getDate()).padStart(2, '0')
      onDateChange(`${y}-${m}-${d}`)
    }
  }, [onDateChange])

  const handleTimeSelected = useCallback(() => {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    if (!timeValue) {
      onTimeChange(`${h}:${m}`)
    }
    setShowTimePicker(false)
  }, [timeValue, onTimeChange])

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <ThemeText variant="label">
          Data <ThemeText variant="caption" color={colors.danger}>*</ThemeText>
        </ThemeText>
        <View style={[styles.dateRow, { gap: spacing.sm }]}>
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
          <Pressable
            onPress={openDatePicker}
            accessibilityRole="button"
            accessibilityLabel="Abrir calendário"
            accessibilityHint="Toque para abrir o calendário e selecionar uma data"
            style={[
              styles.calButton,
              {
                backgroundColor: colors.primary,
                borderRadius: 12,
                width: touchSize.min,
                height: touchSize.min,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={24} color={colors.surface} />
          </Pressable>
        </View>
        {dateError && (
          <ThemeText variant="caption" color={colors.danger} accessibilityRole="alert">
            {dateError}
          </ThemeText>
        )}
      </View>

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: 16 }]}>
              <DateTimePicker
                value={dateValue ? new Date(dateValue + 'T12:00:00') : new Date()}
                mode="date"
                display="spinner"
                onChange={handleDatePickerChange}
                locale="pt-BR"
              />
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={{ padding: spacing.md, alignItems: 'center' }}
              >
                <ThemeText variant="body" color={colors.primary}>Confirmar</ThemeText>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
  },
  calButton: {
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
  },
})
