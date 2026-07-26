import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, ScrollView, StyleSheet, BackHandler, AccessibilityInfo } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { usePreferences } from '@/contexts/preferences-context'
import { profileSchema, type ProfileFormData } from '@/modules/authentication/application/schemas/profile.schema'
import { createFirebaseAuthRepository } from '@/modules/authentication/infrastructure/firebase-auth.repository'
import { createAuthUseCases } from '@/modules/authentication/application/use-cases'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import { AppButton } from '@/components/ui/app-button'
import { AppTextInput } from '@/components/ui/app-text-input'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { ErrorMessage } from '@/components/ui/error-message'
import { UserAvatar } from '@/screens/profile/user-avatar'
import { ProfileSection } from '@/screens/profile/profile-section'
import { ProfileActionRow } from '@/screens/profile/profile-action-row'
import { PreferencesSummary } from '@/screens/profile/preferences-summary'
import { ConfirmationDialog } from '@/screens/profile/confirmation-dialog'

export default function PerfilScreen() {
  const authUseCases = useMemo(() => createAuthUseCases(createFirebaseAuthRepository()), [])
  const { colors, spacing, contrast } = useTheme()
  const { profile, user, isLoading, signOut, sendPasswordReset, refreshProfile } = useAuth()
  const { effectivePreferences } = usePreferences()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const ongoingLogoutRef = useRef(false)
  const originalNameRef = useRef('')
  const saveSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const passwordSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSaveSuccessTimer = useCallback(() => {
    if (saveSuccessTimerRef.current) {
      clearTimeout(saveSuccessTimerRef.current)
      saveSuccessTimerRef.current = null
    }
  }, [])

  const clearPasswordSuccessTimer = useCallback(() => {
    if (passwordSuccessTimerRef.current) {
      clearTimeout(passwordSuccessTimerRef.current)
      passwordSuccessTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearSaveSuccessTimer()
      clearPasswordSuccessTimer()
    }
  }, [clearPasswordSuccessTimer, clearSaveSuccessTimer])

  const displayName = useMemo(() => {
    const profileName = profile?.name?.trim()
    if (profileName) return profileName
    if (user?.displayName?.trim()) return user.displayName.trim()
    return 'Usuário SeniorEase'
  }, [profile?.name, user?.displayName])

  const userEmail = useMemo(() => user?.email?.trim() || profile?.email?.trim() || '', [user?.email, profile?.email])

  const maskedEmail = useMemo(() => {
    if (!userEmail) return ''
    const [local, domain] = userEmail.split('@')
    if (!domain) return userEmail
    if (local.length <= 1) return local + '@' + domain
    return local[0] + '*'.repeat(Math.min(local.length - 2, 3)) + local[local.length - 1] + '@' + domain
  }, [userEmail])

  const isBasicMode = effectivePreferences.interfaceMode === 'basic'

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  })

  const currentName = watch('name')
  const avatarName = useMemo(() => {
    const n = isEditing && currentName ? currentName : displayName
    return n === 'Usuário SeniorEase' ? '' : n
  }, [displayName, isEditing, currentName])
  const hasNameChanged = useMemo(() => {
    const trimmed = currentName?.trim() ?? ''
    return trimmed !== originalNameRef.current
  }, [currentName])

  const startEditing = useCallback(() => {
    const n = displayName === 'Usuário SeniorEase' ? '' : displayName
    originalNameRef.current = n
    reset({ name: n })
    setError(null)
    clearSaveSuccessTimer()
    setSaveSuccess(false)
    setIsEditing(true)
  }, [clearSaveSuccessTimer, displayName, reset])

  const cancelEditing = useCallback(() => {
    if (hasNameChanged) {
      setShowDiscardDialog(true)
      return
    }
    setIsEditing(false)
    setError(null)
  }, [hasNameChanged])

  const discardChanges = useCallback(() => {
    reset({ name: originalNameRef.current })
    setIsEditing(false)
    setShowDiscardDialog(false)
    setError(null)
  }, [reset])

  const onSave = useCallback(async (data: ProfileFormData) => {
    if (!user) return
    setError(null)
    setSaving(true)
    try {
      await authUseCases.updateUserName(user.uid, data.name)
      setIsEditing(false)
      originalNameRef.current = data.name.trim()
      clearSaveSuccessTimer()
      setSaveSuccess(true)
      AccessibilityInfo.announceForAccessibility('Perfil atualizado com sucesso.')
      saveSuccessTimerRef.current = setTimeout(() => {
        setSaveSuccess(false)
        saveSuccessTimerRef.current = null
      }, 3000)
    } catch {
      setError('Não foi possível atualizar seu perfil. Verifique sua conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }, [clearSaveSuccessTimer, user])

  const handlePasswordReset = useCallback(async () => {
    if (!userEmail) return
    setPasswordLoading(true)
    setError(null)
    try {
      await sendPasswordReset(userEmail)
      setShowPasswordDialog(false)
      clearPasswordSuccessTimer()
      setPasswordSuccess(true)
      AccessibilityInfo.announceForAccessibility('Enviamos as instruções para o seu e-mail.')
      passwordSuccessTimerRef.current = setTimeout(() => {
        setPasswordSuccess(false)
        passwordSuccessTimerRef.current = null
      }, 5000)
    } catch {
      setError('Não foi possível enviar o e-mail de redefinição. Verifique sua conexão e tente novamente.')
    } finally {
      setPasswordLoading(false)
    }
  }, [clearPasswordSuccessTimer, userEmail, sendPasswordReset])

  const handleLogout = useCallback(async () => {
    if (ongoingLogoutRef.current) return
    setLogoutLoading(true)
    ongoingLogoutRef.current = true
    setError(null)
    try {
      await signOut()
    } catch {
      setError('Não foi possível sair da conta. Tente novamente.')
      setShowLogoutDialog(false)
    } finally {
      setLogoutLoading(false)
      ongoingLogoutRef.current = false
    }
  }, [signOut])

  const handleRetry = useCallback(() => {
    setError(null)
    refreshProfile()
  }, [refreshProfile])

  if (!profile && !isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.flex, { justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg }]}>
          <ThemeText variant="subtitle" style={{ color: colors.text, textAlign: 'center' }}>
            Não foi possível carregar seu perfil.
          </ThemeText>
          <ThemeText variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
            Verifique sua conexão e tente novamente.
          </ThemeText>
          <AppButton
            title="Tentar novamente"
            onPress={handleRetry}
            variant="outline"
            accessibilityLabel="Tentar carregar perfil novamente"
          />
        </View>
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return <LoadingScreen message="Carregando perfil..." />
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.flex}>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: colors.surface,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
              gap: spacing.xs,
            },
          ]}
        >
          <ThemeText variant="title" style={{ color: colors.text }}>
            Perfil
          </ThemeText>
          <ThemeText variant="caption" color={colors.textMuted}>
            Veja e atualize as informações da sua conta.
          </ThemeText>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xxxl + 60,
            gap: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <ErrorMessage message={error} />
          ) : null}

          {saveSuccess ? (
            <View
              style={[
                styles.successBanner,
                {
                  backgroundColor: colors.successLight,
                  borderRadius: 10,
                  padding: spacing.md,
                  borderColor: colors.success,
                  borderWidth: 1,
                },
              ]}
              accessibilityRole="alert"
              accessibilityLabel="Perfil atualizado"
            >
              <ThemeText variant="body" color={colors.success}>
                Perfil atualizado.
              </ThemeText>
            </View>
          ) : null}

          {passwordSuccess ? (
            <View
              style={[
                styles.successBanner,
                {
                  backgroundColor: colors.successLight,
                  borderRadius: 10,
                  padding: spacing.md,
                  borderColor: colors.success,
                  borderWidth: 1,
                },
              ]}
              accessibilityRole="alert"
              accessibilityLabel="E-mail enviado"
            >
              <ThemeText variant="body" color={colors.success}>
                Enviamos as instruções para o seu e-mail.
              </ThemeText>
            </View>
          ) : null}

          <View
            style={[
              styles.identityCard,
              {
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: contrast === 'high' ? 2 : 1,
                borderColor: colors.border,
                padding: spacing.xl,
                gap: spacing.lg,
              },
            ]}
          >
            <View style={styles.identityTop}>
              <UserAvatar
                name={avatarName}
                size={72}
                accessibilityLabel={'Avatar de ' + displayName}
              />
              <View style={[styles.identityText, { gap: spacing.xs }]}>
                <ThemeText variant="title" style={{ color: colors.text }}>
                  {isEditing && currentName ? currentName : displayName}
                </ThemeText>
                {userEmail ? (
                  <ThemeText variant="body" color={colors.textMuted}>
                    {userEmail}
                  </ThemeText>
                ) : null}
              </View>
            </View>

            {isEditing ? (
              <View style={{ gap: spacing.md }}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppTextInput
                      label="Nome completo"
                      placeholder="Digite seu nome"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.name?.message}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="done"
                      allowFontScaling
                    />
                  )}
                />
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <AppButton
                      title="Cancelar"
                      onPress={cancelEditing}
                      variant="ghost"
                      disabled={saving}
                      accessibilityLabel="Cancelar edição"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppButton
                      title="Salvar"
                      onPress={handleSubmit(onSave)}
                      variant="primary"
                      loading={saving}
                      disabled={saving || !hasNameChanged}
                      accessibilityLabel="Salvar nome do perfil"
                    />
                  </View>
                </View>
              </View>
            ) : (
              <AppButton
                title="Editar perfil"
                onPress={startEditing}
                variant="outline"
                accessibilityLabel="Editar nome do perfil"
                accessibilityHint="Abre o formulário para editar seu nome"
              />
            )}
          </View>

          <ProfileSection title="Conta">
            {userEmail ? (
              <ProfileActionRow
                label="E-mail"
                value={userEmail}
                icon="mail-outline"
              />
            ) : null}
            <ProfileActionRow
              label="Alterar senha"
              description="Proteja sua conta com uma senha segura."
              icon="lock-closed-outline"
              onPress={() => setShowPasswordDialog(true)}
              accessibilityHint="Envia um link de redefinição por e-mail"
            />
          </ProfileSection>

          <ProfileSection
            title="Sua experiência"
            description="Estas configurações definem como o SeniorEase aparece para você."
          >
            <PreferencesSummary />
          </ProfileSection>

          <ProfileSection title="Ajuda">
            <ProfileActionRow
              label="Central de ajuda"
              description="Veja orientações para usar o SeniorEase."
              icon="help-circle-outline"
              onPress={() => router.push('/ajuda')}
              accessibilityHint="Navega para a central de ajuda"
            />
          </ProfileSection>

          <ProfileSection title="Sessão">
            <ProfileActionRow
              label="Sair da conta"
              description="Você precisará entrar novamente para acessar suas atividades."
              icon="log-out-outline"
              onPress={() => setShowLogoutDialog(true)}
              accessibilityHint="Sair da conta do SeniorEase"
            />
          </ProfileSection>
        </ScrollView>
      </View>

      <ConfirmationDialog
        visible={showLogoutDialog}
        title="Sair da conta?"
        message="Você precisará entrar novamente para acessar suas atividades."
        confirmLabel="Sair"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
        loading={logoutLoading}
        destructive
      />

      <ConfirmationDialog
        visible={showPasswordDialog}
        title="Alterar senha"
        message={'Enviaremos um link de redefinição para o seu e-mail' + (maskedEmail ? ' (' + maskedEmail + ').' : '.')}
        confirmLabel="Enviar link"
        onConfirm={handlePasswordReset}
        onCancel={() => setShowPasswordDialog(false)}
        loading={passwordLoading}
      />

      <ConfirmationDialog
        visible={showDiscardDialog}
        title="Descartar alteração?"
        message="O nome modificado ainda não foi salvo."
        confirmLabel="Descartar"
        onConfirm={discardChanges}
        onCancel={() => setShowDiscardDialog(false)}
        destructive
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {},
  identityCard: {},
  identityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  identityText: {
    flex: 1,
  },
  successBanner: {},
})
