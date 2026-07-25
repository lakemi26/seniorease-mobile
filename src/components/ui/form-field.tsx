import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { TextInputProps, View, StyleSheet } from 'react-native'
import { spacing } from '@/shared/theme/spacing'
import { AppTextInput } from './app-text-input'

interface FormFieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>
  name: Path<T>
  label: string
  required?: boolean
  secureTextEntry?: boolean
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  secureTextEntry,
  ...rest
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          <AppTextInput
            label={label}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            secureTextEntry={secureTextEntry}
            required={required}
            {...rest}
          />
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
})
