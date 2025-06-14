export const Colors = {
    darkBrown: '#C0A08B',
    mediumBrown: '#DAB9A4',
    lightBrown: '#FFE9D0',
    textBrown: '#3A2824',
    pink: '#FFBFBE',
    green: '#4D7B72',
    cream: '#FFF7EF',
    black: '#000000',
    white: '#FFFFFF',
 } as const;

export type ColorKey = keyof typeof Colors;