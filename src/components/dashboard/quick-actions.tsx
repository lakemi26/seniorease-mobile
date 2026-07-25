import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
  href: string
}

interface QuickActionsProps {
  isComplete: boolean
}

const COMPLETE_ACTIONS: QuickAction[] = [
  {
    icon: 'add-circle-outline',
    title: 'Nova atividade',
    description: 'Criar um novo compromisso',
    href: '/atividades/nova',
  },
  {
    icon: 'list-outline',
    title: 'Minhas atividades',
    description: 'Ver todas as atividades',
    href: '/atividades',
  },
  {
    icon: 'calendar-outline',
    title: 'Calendário',
    description: 'Visão mensal dos dias',
    href: '/calendario',
  },
  {
    icon: 'time-outline',
    title: 'Histórico',
    description: 'Atividades concluídas',
    href: '/historico',
  },
  {
    icon: 'settings-outline',
    title: 'Ajustar experiência',
    description: 'Personalizar o aplicativo',
    href: '/configuracoes',
  },
]

const BASIC_ACTIONS: QuickAction[] = [
  {
    icon: 'add-circle-outline',
    title: 'Nova atividade',
    description: 'Criar um novo compromisso',
    href: '/atividades/nova',
  },
  {
    icon: 'list-outline',
    title: 'Minhas atividades',
    description: 'Ver todas as atividades',
    href: '/atividades',
  },
  {
    icon: 'settings-outline',
    title: 'Ajustar experiência',
    description: 'Personalizar o aplicativo',
    href: '/configuracoes',
  },
]

export function QuickActions({ isComplete }: QuickActionsProps) {
  const { colors, spacing, radius, shadows } = useTheme()
  const router = useRouter()
  const actions = isComplete ? COMPLETE_ACTIONS : BASIC_ACTIONS

  const nav = (href: string) => router.push(href as any)

  return (
    <View style={{ gap: spacing.md }}>
      <ThemeText variant="subtitle" style={{ color: colors.text }}>
        Ações rápidas
      </ThemeText>

      <View style={{ gap: spacing.sm }}>
        {actions.map((action) => (
          <ThemeView
            key={action.href}
            surface
            style={[
              styles.card,
              {
                padding: spacing.md,
                borderRadius: radius.md,
                borderColor: colors.border,
                ...Platform.select({ web: shadows.sm, default: shadows.sm }),
              },
            ]}
          >
            <Pressable
              onPress={() => nav(action.href)}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              accessibilityHint={action.description}
              style={{ minHeight: 48, justifyContent: 'center' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name={action.icon} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemeText variant="body" style={{ color: colors.text }}>
                    {action.title}
                  </ThemeText>
                  <ThemeText variant="caption" style={{ color: colors.textMuted }}>
                    {action.description}
                  </ThemeText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </Pressable>
          </ThemeView>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
