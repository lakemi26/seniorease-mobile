import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'
import { useNotifications } from '@/contexts/notifications-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import type { ActivityNotification, NotificationFilter, NotificationType } from '@/modules/notifications/domain/entities'
import { formatTime, isSameDay } from '@/shared/utils/date'

function iconFor(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'overdue':
      return 'alert-circle-outline'
    case 'reminder':
      return 'notifications-outline'
    case 'today':
      return 'calendar-outline'
    case 'upcoming':
      return 'time-outline'
  }
}

function formatNotificationTime(notification: ActivityNotification): string {
  const now = new Date()
  if (isSameDay(notification.relevantAt, now)) {
    return `Hoje às ${formatTime(notification.relevantAt)}`
  }
  return notification.relevantAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function accessibleTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
  })
}

function notificationAccessibilityLabel(notification: ActivityNotification): string {
  return `${notification.title}. ${notification.typeLabel} ${notification.isRead ? 'lida' : 'não lida'}. ${accessibleTime(notification.relevantAt)}.`
}

function NotificationItem({
  notification,
  onOpen,
  onDismiss,
}: {
  notification: ActivityNotification
  onOpen: (notification: ActivityNotification) => void
  onDismiss: (notification: ActivityNotification) => void
}) {
  const { colors, spacing, radius, contrast } = useTheme()
  const borderWidth = contrast === 'high' ? 2 : 1
  const iconColor = notification.type === 'overdue'
    ? colors.danger
    : notification.type === 'reminder'
      ? colors.warning
      : colors.primary

  return (
    <ThemeView
      surface
      style={[
        styles.item,
        {
          borderColor: colors.border,
          borderWidth,
          borderRadius: radius.lg,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={notificationAccessibilityLabel(notification)}
      accessibilityHint="Use os botões da notificação para abrir ou dispensar"
    >
      <View style={[styles.itemTop, { gap: spacing.md }]}> 
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryVerySoft }]}> 
          <Ionicons name={iconFor(notification.type)} size={20} color={iconColor} />
        </View>

        <View style={{ flex: 1, gap: spacing.xs }}>
          <View style={[styles.titleRow, { gap: spacing.sm }]}> 
            <ThemeText variant="label" style={{ flex: 1, color: colors.text }}>
              {notification.title}
            </ThemeText>
            {!notification.isRead ? (
              <View
                style={[
                  styles.unreadPill,
                  {
                    backgroundColor: colors.primaryVerySoft,
                    borderColor: colors.primary,
                  },
                ]}
                accessibilityLabel="Não lida"
              >
                <ThemeText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                  Não lida
                </ThemeText>
              </View>
            ) : null}
          </View>
          <ThemeText variant="body" style={{ color: colors.text }}>
            {notification.description}
          </ThemeText>
          <ThemeText variant="caption" style={{ color: colors.textMuted }}>
            {notification.typeLabel} · {formatNotificationTime(notification)}
          </ThemeText>
        </View>
      </View>

      <View style={[styles.actions, { gap: spacing.sm }]}> 
        <Pressable
          onPress={() => onOpen(notification)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir atividade ${notification.title}`}
          accessibilityHint="Marca a notificação como lida e abre a atividade relacionada"
          style={({ pressed }) => [
            styles.actionButton,
            {
              borderColor: colors.primary,
              minHeight: 48,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemeText variant="link">Abrir</ThemeText>
        </Pressable>
        <Pressable
          onPress={() => onDismiss(notification)}
          accessibilityRole="button"
          accessibilityLabel={`Dispensar notificação ${notification.title}`}
          accessibilityHint="Remove esta notificação da lista sem excluir a atividade"
          style={({ pressed }) => [
            styles.actionButton,
            {
              borderColor: colors.border,
              minHeight: 48,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemeText variant="body" style={{ color: colors.textMuted }}>Dispensar</ThemeText>
        </Pressable>
      </View>
    </ThemeView>
  )
}

function FilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors, spacing, radius, contrast } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Filtro ${label}${active ? ', selecionado' : ''}`}
      style={({ pressed }) => [
        styles.filterButton,
        {
          paddingHorizontal: spacing.lg,
          minHeight: 48,
          borderRadius: radius.full,
          borderWidth: contrast === 'high' ? 2 : 1,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primaryVerySoft : colors.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <ThemeText variant="label" style={{ color: active ? colors.primary : colors.text }}>
        {label}
      </ThemeText>
    </Pressable>
  )
}

export default function NotificacoesScreen() {
  const router = useRouter()
  const { colors, spacing, radius } = useTheme()
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    notice,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh,
    clearNotice,
  } = useNotifications()
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const filtered = useMemo(
    () => filter === 'unread' ? notifications.filter((notification) => !notification.isRead) : notifications,
    [filter, notifications],
  )

  const todayNotifications = filtered.filter((notification) => notification.isToday)
  const previousNotifications = filtered.filter((notification) => !notification.isToday)

  const handleOpen = useCallback(async (notification: ActivityNotification) => {
    await markAsRead(notification)
    router.push(`/atividades/${notification.activityId}` as any)
  }, [markAsRead, router])

  const handleDismiss = useCallback(async (notification: ActivityNotification) => {
    await dismissNotification(notification)
  }, [dismissNotification])

  if (error && !isLoading) {
    return (
      <ThemeView style={{ flex: 1 }}>
        <View style={[styles.header, { padding: spacing.lg, gap: spacing.md }]}> 
          <AppButton title="Voltar" onPress={() => router.back()} variant="ghost" fullWidth={false} />
          <ThemeText variant="title">Notificações</ThemeText>
        </View>
        <View style={[styles.center, { padding: spacing.xl, gap: spacing.md }]}> 
          <ThemeText variant="subtitle">Não foi possível carregar notificações.</ThemeText>
          <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>{error}</ThemeText>
          <AppButton title="Tentar novamente" onPress={refresh} variant="outline" />
        </View>
      </ThemeView>
    )
  }

  return (
    <ThemeView style={{ flex: 1 }}>
      <View style={[styles.header, { padding: spacing.lg, gap: spacing.md }]}> 
        <AppButton title="Voltar" onPress={() => router.back()} variant="ghost" fullWidth={false} />
        <View style={{ flex: 1 }}>
          <ThemeText variant="title">Notificações</ThemeText>
          <ThemeText variant="body" style={{ color: colors.textMuted }}>
            Seus lembretes e avisos de atividades ficam reunidos aqui.
          </ThemeText>
        </View>
      </View>

      {unreadCount > 0 ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <AppButton
            title="Marcar todas como lidas"
            onPress={markAllAsRead}
            variant="outline"
            accessibilityLabel={`Marcar todas as ${unreadCount} notificações não lidas como lidas`}
          />
        </View>
      ) : null}

      {notice ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <ThemeView
            surface
            style={{
              borderColor: colors.warning,
              borderWidth: 1,
              borderRadius: radius.lg,
              padding: spacing.md,
              gap: spacing.sm,
            }}
            accessibilityRole="alert"
          >
            <ThemeText variant="body" style={{ color: colors.text }}>{notice}</ThemeText>
            <Pressable accessibilityRole="button" onPress={clearNotice}>
              <ThemeText variant="link">Entendi</ThemeText>
            </Pressable>
          </ThemeView>
        </View>
      ) : null}

      <View style={[styles.filters, { paddingHorizontal: spacing.lg, gap: spacing.sm }]}> 
        <FilterButton label="Todas" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterButton label="Não lidas" active={filter === 'unread'} onPress={() => setFilter('unread')} />
      </View>

      {isLoading ? (
        <View style={[styles.center, { gap: spacing.md }]}> 
          <ActivityIndicator color={colors.primary} />
          <ThemeText variant="body" style={{ color: colors.textMuted }}>Carregando notificações...</ThemeText>
        </View>
      ) : filtered.length === 0 ? (
        <View style={[styles.center, { padding: spacing.xl, gap: spacing.md }]}> 
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryVerySoft }]}> 
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          </View>
          <ThemeText variant="subtitle" style={{ textAlign: 'center' }}>Tudo em dia por aqui</ThemeText>
          <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
            Seus lembretes e avisos de atividades aparecerão nesta página.
          </ThemeText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl }}
          showsVerticalScrollIndicator={false}
          accessibilityLabel={`${filtered.length} notificações exibidas`}
        >
          {todayNotifications.length > 0 ? (
            <View style={{ gap: spacing.md }}>
              <ThemeText variant="subtitle" accessibilityRole="header">Hoje</ThemeText>
              {todayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={handleOpen}
                  onDismiss={handleDismiss}
                />
              ))}
            </View>
          ) : null}

          {previousNotifications.length > 0 ? (
            <View style={{ gap: spacing.md }}>
              <ThemeText variant="subtitle" accessibilityRole="header">Anteriores</ThemeText>
              {previousNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={handleOpen}
                  onDismiss={handleDismiss}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    width: '100%',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
