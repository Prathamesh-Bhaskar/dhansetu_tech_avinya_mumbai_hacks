// Design System - Based on test2.html
export const colors = {
    // Dark backgrounds
    midnight: '#111827',
    midnightLight: '#1F2937',

    // Accent colors
    electricCyan: '#22D3EE',
    neonMint: '#34D399',
    alertRed: '#F87171',
    alertYellow: '#FBBF24',

    // Light surfaces
    surfaceWhite: '#FFFFFF',
    surfaceOff: '#F3F4F6',

    // Text colors
    textMain: '#111827',
    textMuted: '#9CA3AF',
    textLight: '#FFFFFF',

    // Grays
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    full: 9999,
};

export const typography = {
    fontFamily: 'System', // React Native uses system fonts by default

    sizes: {
        xs: 10,
        sm: 12,
        base: 14,
        lg: 16,
        xl: 18,
        xxl: 24,
        xxxl: 32,
        hero: 48,
    },

    weights: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    glow: {
        shadowColor: '#22D3EE',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
};
export const theme = {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};

export default theme;

