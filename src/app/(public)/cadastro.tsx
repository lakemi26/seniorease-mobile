import { useCallback } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cadastroSchema, type CadastroFormData } from '@/modules/authentication/application/schemas/cadastro.schema'
import { useAuth } from '@/contexts/auth-context'
import { AuthScreenLayout } from '@/components/ui/auth-screen-layout'
import { AuthCard } from '@/components/ui/auth-card'
import { BrandMark } from '@/components/ui/brand-mark'
import { ThemeText } from '@/components/theme/theme-text'
import { FormField } from '@/components/ui/form-field'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordRequirements } from '@/components/ui/password-requirements'
import { CheckboxField } from '@/components/ui/checkbox-field'
import { AppButton } from '@/components/ui/app-button'
import { ErrorMessage } from '@/components/ui/error-message'
import { useTheme } from '@/contexts/theme-context'

export default function CadastroScreen() {
  const router = useRouter()
  const { signUp, authError, clearError } = useAuth()
  const { spacing } = useTheme()

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false as never },
  })

  const passwordValue = useWatch({ control, name: 'password' })

  const onSubmit = useCallback(async (data: CadastroFormData) => {
    clearError()
    try {
      await signUp(data.email, data.password, data.name)
    } catch {
      // error handled by context
    }
  }, [signUp, clearError])

  return (
    <AuthScreenLayout>
      <View style={[styles.inner, { gap: spacing.xxl }]}>
        <BrandMark />

        <AuthCard>
          <View style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.sm }}>
              <ThemeText variant="title">Crie sua conta</ThemeText>
              <ThemeText variant="body" color={undefined}>
                Crie sua conta para organizar suas atividades de um jeito mais claro e confortável.
              </ThemeText>
            </View>

            {authError ? <ErrorMessage message={authError} /> : null}

            <FormField
              control={control}
              name="name"
              label="Nome completo"
              required
              placeholder="Digite seu nome"
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              returnKeyType="next"
            />

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
              returnKeyType="next"
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={{ gap: spacing.xs }}>
                  <PasswordInput
                    label="Senha"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error?.message}
                    required
                    placeholder="Crie uma senha"
                  />
                  <PasswordRequirements password={passwordValue ?? ''} />
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <PasswordInput
                  label="Confirmar senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  required
                  placeholder="Repita a senha"
                />
              )}
            />

            <Controller
              control={control}
              name="terms"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <CheckboxField
                  checked={!!value}
                  onValueChange={onChange}
                  label="Aceito os termos de uso e a política de privacidade"
                  error={error?.message}
                />
              )}
            />

            <AppButton
              title="Criar minha conta"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            />
          </View>
        </AuthCard>

        <View style={[styles.footer, { gap: spacing.xs }]}>
          <ThemeText variant="body" color={undefined}>
            Já tem uma conta?
          </ThemeText>
          <Pressable onPress={() => router.push('/(public)/login')} hitSlop={8}>
            <ThemeText variant="link">Entrar</ThemeText>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  inner: {},
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
