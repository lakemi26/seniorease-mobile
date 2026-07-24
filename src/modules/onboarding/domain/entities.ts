export interface OnboardingStep {
  id: number
  title: string
  description: string
}

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  preferences: OnboardingPreferences
  isCompleted: boolean
}

export interface OnboardingPreferences {
  fontSize: 'normal' | 'large' | 'extraLarge'
  contrast: 'default' | 'high' | 'dark'
  spacing: 'normal' | 'expanded'
  interfaceMode: 'basic' | 'complete'
  enhancedFeedback: boolean
  confirmCriticalActions: boolean
  reduceMotion: boolean
  remindersEnabled: boolean
}

export const DEFAULT_ONBOARDING_PREFERENCES: OnboardingPreferences = {
  fontSize: 'normal',
  contrast: 'default',
  spacing: 'normal',
  interfaceMode: 'complete',
  enhancedFeedback: true,
  confirmCriticalActions: true,
  reduceMotion: false,
  remindersEnabled: true,
}
