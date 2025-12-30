import { Platform } from 'react-native';

export const FONTS = {
  regular: Platform.select({
    ios: 'HelloValentica',
    android: 'HelloValentica',
    default: 'HelloValentica',
  })
} as const;

export const fontStyle = (variant: keyof typeof FONTS = 'regular') => ({
  fontFamily: FONTS[variant],
});
