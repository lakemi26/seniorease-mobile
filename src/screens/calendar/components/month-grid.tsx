import { StyleSheet, View } from 'react-native'
import { ThemeText } from '@/components/theme/theme-text'
import { useTheme } from '@/contexts/theme-context'
import type { CalendarDay } from '@/screens/calendar/hook/use-calendar'
import { CalendarDayCell } from './calendar-day-cell'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface MonthGridProps {
  days: CalendarDay[]
  onSelectDate: (date: Date) => void
}

export function MonthGrid({ days, onSelectDate }: MonthGridProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.weekHeader}>
        {WEEK_DAYS.map((day) => (
          <ThemeText key={day} variant="label" allowFontScaling={false} style={[styles.weekDay, { color: colors.textMuted }]}>
            {day}
          </ThemeText>
        ))}
      </View>

      <View style={styles.grid}>
        {days.slice(0, 42).map((day) => (
          <CalendarDayCell key={day.key} day={day} onPress={() => onSelectDate(day.date)} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  weekHeader: {
    flexDirection: 'row',
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
})
