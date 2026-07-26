import { Pressable, StyleSheet, View } from 'react-native'
import { ThemeText } from '@/components/theme/theme-text'
import { useTheme } from '@/contexts/theme-context'
import type { CalendarDay } from '@/screens/calendar/hook/use-calendar'

const MIN_TOUCH_SIZE = 48

interface CalendarDayCellProps {
  day: CalendarDay
  onPress: () => void
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getCalendarDayAccessibilityLabel(day: CalendarDay): string {
  const weekday = capitalize(day.date.toLocaleDateString('pt-BR', { weekday: 'long' }))
  const date = day.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const today = day.isToday ? 'Hoje.' : ''
  const count = day.activities.length === 1 ? '1 atividade.' : `${day.activities.length} atividades.`
  const selected = day.isSelected ? 'Selecionado.' : 'Não selecionado.'
  const outsideMonth = day.isCurrentMonth ? '' : 'Fora do mês exibido.'

  return [
    `${weekday}, ${date}.`,
    today,
    count,
    selected,
    outsideMonth,
  ].filter(Boolean).join(' ')
}

export function CalendarDayCell({ day, onPress }: CalendarDayCellProps) {
  const { colors, spacing, radius, contrast, reduceMotion } = useTheme()
  const hasActivities = day.activities.length > 0
  const borderWidth = contrast === 'high' ? 2 : 1

  const backgroundColor = day.isSelected
    ? colors.primary
    : day.isCurrentMonth
      ? colors.surface
      : colors.surfaceMuted

  const textColor = day.isSelected
    ? colors.background
    : day.isCurrentMonth
      ? colors.text
      : colors.textSubtle

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={getCalendarDayAccessibilityLabel(day)}
      accessibilityState={{ selected: day.isSelected }}
      accessibilityHint="Seleciona este dia e atualiza a agenda"
      hitSlop={6}
      style={({ pressed }) => [
        styles.container,
        {
          borderRadius: radius.md,
          backgroundColor,
          borderColor: day.isToday ? colors.primary : colors.border,
          borderWidth,
          paddingVertical: spacing.sm,
        },
        pressed && !reduceMotion && styles.pressed,
      ]}
    >
      <ThemeText
        variant="label"
        allowFontScaling={false}
        style={{ color: textColor, fontWeight: day.isSelected || day.isToday ? '700' : '500' }}
      >
        {day.dayNumber}
      </ThemeText>

      <View style={styles.markerSlot}>
        {day.isToday && day.isSelected && (
          <View testID="today-selected-marker" style={[styles.todaySelectedMarker, { backgroundColor: colors.focus }]} />
        )}
        {hasActivities && (
          <View
            style={[
              styles.marker,
              {
                backgroundColor: day.isSelected ? colors.background : colors.primary,
                minWidth: day.activities.length > 1 ? 18 : 7,
              },
            ]}
          >
            {day.activities.length > 1 && (
              <ThemeText
                variant="caption"
                allowFontScaling={false}
                style={[styles.markerText, { color: day.isSelected ? colors.primary : colors.background }]}
              >
                {day.activities.length > 9 ? '9+' : day.activities.length}
              </ThemeText>
            )}
          </View>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: `${100 / 7}%`,
    minHeight: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSlot: {
    height: 14,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    height: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  todaySelectedMarker: {
    width: 18,
    height: 3,
    borderRadius: 2,
    marginBottom: 2,
  },
  markerText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
})
