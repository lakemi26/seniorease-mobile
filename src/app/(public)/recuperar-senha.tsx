import { useCallback, useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { passwordRecoverySchema, type PasswordRecoveryFormData } from '@/modules/authentication/application/schemas/password-recovery.schema'
import { useAuth } from '@/contexts/auth-context'
import { AuthScreenLayout } from '@/components/ui/auth-screen-layout'
import { BrandMark } from '@/components/ui/brand-mark'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { FormField } from '@/components/ui/form-field'
import { ErrorMessage } from '@/components/ui/error-message'
import { useTheme } from '@/contexts/theme-context'

export default function RecuperarSenhaScreen() {
  const router = useRouter()
  const { sendPasswordReset, authError, clearError } = useAuth()
  const { colors, spacing } = useTheme()
  const [sent, setSent] = useState(false)

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<PasswordRecoveryFormData>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: { email: '' },
  })

  const onSubmit = useCallback(async (data: PasswordRecoveryFormData) => {
    clearError()
    try {
      await sendPasswordReset(data.email)
      setSent(true)
    } catch {
      // error handled by context
    }
  }, [sendPasswordReset, clearError])

  return (
    <AuthScreenLayout>
      <View style={[styles.inner, { gap: spacing.xxl }]}>
        <View style={[styles.header, { gap: spacing.md }]}>
          <BrandMark />
          <ThemeText variant="title">Recuperar senha</ThemeText>
          <ThemeText variant="body" color={undefined}>
            {sent
              ? 'Enviamos as instruções de recuperação para o seu e-mail.'
              : 'Digite seu e-mail para receber instruções de recuperação.'}
          </ThemeText>
        </View>

        {authError ? <ErrorMessage message={authError} /> : null}

        {sent ? (
          <View style={[styles.sentContainer, { gap: spacing.lg }]}>
            <View style={[styles.successBox, { backgroundColor: colors.primarySoft, borderRadius: 8, padding: spacing.md }]}>
              <ThemeText variant="body" color={colors.primaryDark}>
                E-mail enviado com sucesso!
              </ThemeText>
            </View>
            <AppButton
              title="Voltar para o login"
              onPress={() => router.push('/(public)/login')}
            />
          </View>
        ) : (
          <View style={[styles.form, { gap: spacing.lg }]}>
            <FormField
              control={control}
              name="email"
              label="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AppButton
              title="Enviar instruções"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/(public)/login')} hitSlop={8}>
            <ThemeText variant="link">Voltar para o login</ThemeText>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  inner: {},
  header: {
    alignItems: 'center',
  },
  form: {},
  sentContainer: {},
  successBox: {},
  footer: {
    alignItems: 'center',
  },
})
