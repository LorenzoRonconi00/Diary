import { Platform } from 'react-native';

export const FONTS = {
  regular: Platform.select({
    ios: 'HelloValentica',
    android: 'HelloValentica',
    default: 'HelloValentica',
  })
} as const;

// Funzione helper per applicare font facilmente
export const fontStyle = (variant: keyof typeof FONTS = 'regular') => ({
  fontFamily: FONTS[variant],
});