import { View, StyleSheet } from 'react-native'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'

export default function DashboardScreen() {
  const { user, profile, signOut } = useAuth()
  const { spacing, interfaceMode } = useTheme()

  return (
    <ThemeView style={styles.root}>
      <View style={[styles.container, { padding: spacing.lg, gap: spacing.lg }]}>
        <View style={{ gap: spacing.sm }}>
          <ThemeText variant="title">Dashboard</ThemeText>
          <ThemeText variant="muted">
            {profile?.name ?? user?.displayName ?? 'Usuário'}
          </ThemeText>
        </View>

        <View style={{ gap: spacing.md, paddingTop: spacing.xl }}>
          <ThemeText variant="body">Bem-vindo ao SeniorEase!</ThemeText>
          {interfaceMode === 'complete' ? (
            <>
              <ThemeText variant="body">
                Aqui você encontrará suas atividades, lembretes e acompanhamento
                de saúde — tudo adaptado para você.
              </ThemeText>
              <ThemeText variant="muted">
                Modo completo ativo. Navegue pelos ícones abaixo para acessar
                todas as funcionalidades.
              </ThemeText>
            </>
          ) : (
            <>
              <ThemeText variant="body">
                Suas principais atividades e lembretes estarão aqui.
              </ThemeText>
              <ThemeText variant="muted">
                Modo básico ativo. Apenas o essencial para facilitar seu dia.
              </ThemeText>
            </>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <AppButton
          title="Sair"
          onPress={() => signOut()}
          variant="danger"
        />
      </View>
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
})
