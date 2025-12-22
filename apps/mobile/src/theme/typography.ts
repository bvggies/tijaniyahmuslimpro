export const typography = {
  headingLg: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800' as const,
  },
  bodyMd: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  buttonMd: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
  buttonSm: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
} as const;

export type TypographyTokens = typeof typography;


