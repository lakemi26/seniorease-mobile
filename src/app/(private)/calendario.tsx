import { useCallback } from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemeView } from '@/components/theme/theme-view'
import { Screen } from '@/components/ui/screen'
import { useTheme } from '@/contexts/theme-context'
import { CalendarErrorState } from '@/screens/calendar/components/calendar-states'
import { CalendarHeader } from '@/screens/calendar/components/calendar-header'
import { DayAgenda } from '@/screens/calendar/components/day-agenda'
import { MonthGrid } from '@/screens/calendar/components/month-grid'
import { MonthNavigator } from '@/screens/calendar/components/month-navigator'
import { SelectedDateHeader } from '@/screens/calendar/components/selected-date-header'
import { useCalendar } from '@/screens/calendar/hook/use-calendar'

export default function CalendarioScreen() {
  const { colors, spacing, radius, contrast } = useTheme()
  const router = useRouter()
  const {
    days,
    selectedDateLabel,
    selectedActivities,
    monthLabel,
    isLoading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    retry,
  } = useCalendar()

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleActivityPress = useCallback(
    (id: string) => {
      router.push(`/atividades/${id}` as any)
    },
    [router],
  )

  const handleCreatePress = useCallback(() => {
    router.push('/atividades/nova')
  }, [router])

  if (error) {
    return (
      <Screen scroll={false} padded={false}>
        <ThemeView style={styles.screen}>
          <CalendarHeader onBack={handleBack} />
          <CalendarErrorState error={error} onRetry={retry} onBack={handleBack} />
        </ThemeView>
      </Screen>
    )
  }

  const listHeader = (
    <View style={{ gap: spacing.xl }}>
      <CalendarHeader onBack={handleBack} />

      <View
        style={[
          styles.monthCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.xl,
            borderWidth: contrast === 'high' ? 2 : 1,
            padding: spacing.md,
            gap: spacing.lg,
          },
        ]}
      >
        <MonthNavigator
          monthLabel={monthLabel}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />
        <MonthGrid days={days} onSelectDate={selectDate} />
      </View>

      <SelectedDateHeader
        dateLabel={selectedDateLabel}
        activityCount={isLoading ? 0 : selectedActivities.length}
        onCreatePress={handleCreatePress}
      />
    </View>
  )

  return (
    <Screen scroll={false} padded={false}>
      {Platform.OS !== 'web' && (
        <StatusBar
          barStyle={contrast === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
      )}
      <ThemeView style={styles.screen}>
        <DayAgenda
          activities={selectedActivities}
          isLoading={isLoading}
          header={listHeader}
          onActivityPress={handleActivityPress}
          onCreatePress={handleCreatePress}
          contentPaddingHorizontal={spacing.lg}
          contentPaddingBottom={spacing.xxxl}
          itemGap={spacing.md}
        />
      </ThemeView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  monthCard: {
    overflow: 'hidden',
  },
})
