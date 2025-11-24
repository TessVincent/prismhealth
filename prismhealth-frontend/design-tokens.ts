/**
 * Design Tokens for PrismHealth
 * Generated from deterministic seed: sha256("PrismHealth" + "Sepolia" + "202501" + "PrismHealth.sol")
 * Seed: 20bf6618693e02884340456806d0c7ba3909d74711ce68cf7a6c9af4fc45aeaa
 */

export const designTokens = {
  colors: {
    light: {
      primary: {
        50: "#e6f4f8",
        100: "#b3dde8",
        200: "#80c6d8",
        300: "#4dafc8",
        400: "#1a98b8",
        500: "#0c7ba3", // Main primary color
        600: "#0a6283",
        700: "#084963",
        800: "#063043",
        900: "#041723",
      },
      secondary: {
        50: "#f0f9f4",
        100: "#d4ede0",
        200: "#b8e1cc",
        300: "#9cd5b8",
        400: "#80c9a4",
        500: "#4caf50", // Health green
        600: "#3d8b40",
        700: "#2e6730",
        800: "#1f4320",
        900: "#101f10",
      },
      accent: {
        50: "#fff0f0",
        100: "#ffcccc",
        200: "#ff9999",
        300: "#ff6666",
        400: "#ff3333",
        500: "#ff6b6b", // Warning red
        600: "#cc5555",
        700: "#994040",
        800: "#662b2b",
        900: "#331515",
      },
      neutral: {
        50: "#f8f9fa",
        100: "#ecf0f1",
        200: "#d5dbdc",
        300: "#bdc3c7",
        400: "#95a5a6",
        500: "#7f8c8d",
        600: "#34495e",
        700: "#2c3e50", // Dark gray
        800: "#1a252f",
        900: "#0f1419",
      },
      background: "#ffffff",
      surface: "#f8f9fa",
      text: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
        disabled: "#bdc3c7",
        inverse: "#ffffff",
      },
    },
    dark: {
      primary: {
        50: "#041723",
        100: "#063043",
        200: "#084963",
        300: "#0a6283",
        400: "#0c7ba3",
        500: "#1a98b8", // Main primary color (dark mode)
        600: "#4dafc8",
        700: "#80c6d8",
        800: "#b3dde8",
        900: "#e6f4f8",
      },
      secondary: {
        50: "#101f10",
        100: "#1f4320",
        200: "#2e6730",
        300: "#3d8b40",
        400: "#4caf50",
        500: "#80c9a4", // Health green (dark mode)
        600: "#9cd5b8",
        700: "#b8e1cc",
        800: "#d4ede0",
        900: "#f0f9f4",
      },
      accent: {
        50: "#331515",
        100: "#662b2b",
        200: "#994040",
        300: "#cc5555",
        400: "#ff6b6b",
        500: "#ff9999", // Warning red (dark mode)
        600: "#ffcccc",
        700: "#fff0f0",
        800: "#fff5f5",
        900: "#fffafa",
      },
      neutral: {
        50: "#0f1419",
        100: "#1a252f",
        200: "#2c3e50",
        300: "#34495e",
        400: "#7f8c8d",
        500: "#95a5a6",
        600: "#bdc3c7",
        700: "#d5dbdc",
        800: "#ecf0f1",
        900: "#f8f9fa",
      },
      background: "#1a1f2e",
      surface: "#252b3d",
      text: {
        primary: "#e8f4f8",
        secondary: "#b8c5d0",
        disabled: "#7f8c8d",
        inverse: "#2c3e50",
      },
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5' }],
      sm: ['0.875rem', { lineHeight: '1.6' }],
      base: ['1rem', { lineHeight: '1.6' }],
      lg: ['1.125rem', { lineHeight: '1.6' }],
      xl: ['1.25rem', { lineHeight: '1.5' }],
      '2xl': ['1.5rem', { lineHeight: '1.4' }],
      '3xl': ['1.875rem', { lineHeight: '1.3' }],
      '4xl': ['2.25rem', { lineHeight: '1.2' }],
      '5xl': ['3rem', { lineHeight: '1.1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    compact: {
      xs: '0.25rem', // 4px
      sm: '0.5rem',  // 8px
      md: '1rem',    // 16px
      lg: '1.5rem',  // 24px
      xl: '2rem',    // 32px
    },
    comfortable: {
      xs: '0.5rem',  // 8px
      sm: '1rem',    // 16px
      md: '1.5rem',  // 24px
      lg: '2rem',    // 32px
      xl: '3rem',    // 48px
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    lg: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
    xl: '0 8px 24px 0 rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1280px',
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
} as const;

// WCAG AA contrast ratios
export const contrastRatios = {
  normal: {
    large: 3,      // 18pt+ or 14pt+ bold
    regular: 4.5,  // Regular text
  },
  enhanced: {
    large: 3,     // 18pt+ or 14pt+ bold
    regular: 7,   // Regular text (AAA)
  },
} as const;


