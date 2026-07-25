import { useCallback } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/modules/authentication/application/schemas/login.schema'
import { useAuth } from '@/contexts/auth-context'
import { AuthScreenLayout } from '@/components/ui/auth-screen-layout'
import { AuthCard } from '@/components/ui/auth-card'
import { BrandMark } from '@/components/ui/brand-mark'
import { ThemeText } from '@/components/theme/theme-text'
import { FormField } from '@/components/ui/form-field'
import { PasswordInput } from '@/components/ui/password-input'
import { AppButton } from '@/components/ui/app-button'
import { ErrorMessage } from '@/components/ui/error-message'
import { useTheme } from '@/contexts/theme-context'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, authError, clearError } = useAuth()
  const { spacing } = useTheme()

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = useCallback(async (data: LoginFormData) => {
    clearError()
    try {
      await signIn(data.email, data.password, data.rememberMe)
    } catch {
      // error handled by context
    }
  }, [signIn, clearError])

  return (
    <AuthScreenLayout>
      <View style={[styles.inner, { gap: spacing.xxl }]}>
        <BrandMark />

        <AuthCard>
          <View style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.sm }}>
              <ThemeText variant="title">Entre no SeniorEase</ThemeText>
              <ThemeText variant="body" color={undefined}>
                Acesse suas atividades e continue de onde parou.
              </ThemeText>
            </View>

            {authError ? <ErrorMessage message={authError} /> : null}

            <FormField
              control={control}
              name="email"
              label="E-mail"
              required
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <PasswordInput
                  label="Senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  required
                  placeholder="Digite sua senha"
                />
              )}
            />

            <Pressable
              onPress={() => router.push('/(public)/recuperar-senha')}
              hitSlop={8}
              style={styles.forgotRow}
            >
              <ThemeText variant="link">Esqueci minha senha</ThemeText>
            </Pressable>

            <AppButton
              title="Entrar"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            />
          </View>
        </AuthCard>

        <View style={[styles.footer, { gap: spacing.xs }]}>
          <ThemeText variant="body" color={undefined}>
            Não tem uma conta?
          </ThemeText>
          <Pressable onPress={() => router.push('/(public)/cadastro')} hitSlop={8}>
            <ThemeText variant="link">Criar conta</ThemeText>
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backRow}>
          <ThemeText variant="link">Voltar para a página inicial</ThemeText>
        </Pressable>
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  inner: {},
  forgotRow: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backRow: {
    alignItems: 'center',
    paddingBottom: 16,
  },
})
