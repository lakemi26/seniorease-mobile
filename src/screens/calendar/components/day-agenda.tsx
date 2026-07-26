import type { ReactElement } from 'react'
import { FlatList, type ListRenderItemInfo } from 'react-native'
import type { Activity } from '@/modules/activities/domain/entities'
import { CalendarActivityItem } from './calendar-activity-item'
import { CalendarEmptyState, CalendarLoadingState } from './calendar-states'

interface DayAgendaProps {
  activities: Activity[]
  isLoading: boolean
  header: ReactElement
  onActivityPress: (id: string) => void
  onCreatePress: () => void
  contentPaddingHorizontal: number
  contentPaddingBottom: number
  itemGap: number
}

export function DayAgenda({
  activities,
  isLoading,
  header,
  onActivityPress,
  onCreatePress,
  contentPaddingHorizontal,
  contentPaddingBottom,
  itemGap,
}: DayAgendaProps) {
  const renderItem = ({ item }: ListRenderItemInfo<Activity>) => (
    <CalendarActivityItem activity={item} onPress={() => onActivityPress(item.id)} />
  )

  return (
    <FlatList
      data={isLoading ? [] : activities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListEmptyComponent={
        isLoading
          ? <CalendarLoadingState message="Carregando atividades do mês..." />
          : <CalendarEmptyState onCreatePress={onCreatePress} />
      }
      contentContainerStyle={{
        paddingHorizontal: contentPaddingHorizontal,
        paddingBottom: contentPaddingBottom,
        gap: itemGap,
      }}
      initialNumToRender={20}
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  )
}
