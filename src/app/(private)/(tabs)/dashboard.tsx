import { View, ScrollView, RefreshControl } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { DashboardHeader } from '@/components/dashboard/header'
import { Greeting } from '@/components/dashboard/greeting'
import { NextActivityCard } from '@/components/dashboard/next-activity-card'
import { TodayActivities } from '@/components/dashboard/today-activities'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { WeeklySummaryCard } from '@/components/dashboard/weekly-summary'
import { Reminders } from '@/components/dashboard/reminders'
import { RecentCompleted } from '@/components/dashboard/recent-completed'
import { HelpCard } from '@/components/dashboard/help-card'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { DashboardError } from '@/components/dashboard/dashboard-error'
import { useDashboard } from '@/hooks/use-dashboard'

export default function DashboardScreen() {
  const {
    nextActivity,
    todayActivitiesSorted,
    recentCompleted,
    weeklySummary,
    reminders,
    isLoading,
    error,
    refetch,
  } = useDashboard()
  const { spacing, interfaceMode } = useTheme()

  if (error && !isLoading) {
    return (
      <ThemeView style={{ flex: 1 }}>
        <DashboardHeader />
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg }}>
          <DashboardError message={error} onRetry={refetch} />
        </View>
      </ThemeView>
    )
  }

  const isComplete = interfaceMode === 'complete'
  const showSummary = isComplete && weeklySummary != null
  const showRecent = isComplete && recentCompleted.length > 0

  return (
    <ThemeView style={{ flex: 1 }}>
      <DashboardHeader />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <View style={{ gap: spacing.xl }}>
            <Greeting />
            <NextActivityCard activity={nextActivity} />
            <TodayActivities
              activities={todayActivitiesSorted}
              maxItems={isComplete ? 5 : 3}
            />
            <QuickActions isComplete={isComplete} />
            {showSummary && <WeeklySummaryCard summary={weeklySummary} />}
            <Reminders
              reminders={reminders}
              maxItems={isComplete ? 3 : 2}
            />
            {showRecent && (
              <RecentCompleted
                activities={recentCompleted}
                maxItems={isComplete ? 5 : 3}
              />
            )}
            <HelpCard />
          </View>
        )}
      </ScrollView>
    </ThemeView>
  )
}
