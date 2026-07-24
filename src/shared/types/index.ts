export interface NavLink {
  label: string
  href: string
}

export interface Benefit {
  icon: string
  title: string
  description: string
}

export interface Step {
  stepNumber: number
  title: string
  description: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface AccessibilityFeature {
  icon: string
  title: string
  description: string
}

export type FontSize = 'normal' | 'large' | 'x-large'
export type ContrastMode = 'normal' | 'high' | 'dark'
export type SpacingMode = 'normal' | 'wide'
export type InterfaceMode = 'basic' | 'complete'
export type MotionMode = 'normal' | 'reduced'

export interface AccessibilityPreferences {
  fontSize: FontSize
  contrast: ContrastMode
  spacing: SpacingMode
  interface: InterfaceMode
  motion: MotionMode
}
