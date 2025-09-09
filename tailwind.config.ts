import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Legacy shadcn/ui compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          light: "hsl(var(--primary-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PhotoFlow brand colors
        brand: {
          charcoal: "hsl(var(--brand-charcoal))",
          'warm-gray': "hsl(var(--brand-warm-gray))",
          sage: "hsl(var(--brand-sage))",
          cream: "hsl(var(--brand-cream))",
          gold: "hsl(var(--brand-gold))",
        },
        // Semantic text colors
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          inverse: "hsl(var(--text-inverse))",
        },
        // Status colors with light variants
        success: {
          DEFAULT: "hsl(var(--success))",
          light: "hsl(var(--success-light))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          light: "hsl(var(--warning-light))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          light: "hsl(var(--error-light))",
          foreground: "hsl(var(--error-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          light: "hsl(var(--info-light))",
          foreground: "hsl(var(--info-foreground))",
        },
        // Photography-specific colors
        gallery: {
          backdrop: "hsl(var(--gallery-backdrop))",
          overlay: "hsl(var(--gallery-overlay))",
          controls: "hsl(var(--gallery-controls))",
          metadata: "hsl(var(--gallery-metadata))",
        },
        photo: {
          border: "hsl(var(--photo-border))",
          shadow: "hsl(var(--photo-shadow))",
        },
        // Surface colors
        surface: {
          DEFAULT: "hsl(var(--surface))",
          muted: "hsl(var(--surface-muted))",
        },
      },
      borderRadius: {
        // Legacy compatibility
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // PhotoFlow design system
        none: "var(--radius-none)",
        xs: "var(--radius-sm)",
        base: "var(--radius-base)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
        // Component-specific
        photo: "var(--photo-radius)",
        gallery: "var(--gallery-radius)",
      },
      fontFamily: {
        brand: "var(--font-brand)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        '2xl': "var(--text-2xl)",
        '3xl': "var(--text-3xl)",
        '4xl': "var(--text-4xl)",
      },
      fontWeight: {
        light: "var(--font-light)",
        normal: "var(--font-normal)",
        medium: "var(--font-medium)",
        semibold: "var(--font-semibold)",
        bold: "var(--font-bold)",
      },
      lineHeight: {
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
      },
      spacing: {
        px: "var(--space-px)",
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)",
        // Component-specific spacing
        'gallery-gap': "var(--gallery-gap)",
        'gallery-padding': "var(--gallery-padding)",
        'card-padding': "var(--card-padding)",
        'button-x': "var(--button-padding-x)",
        'button-y': "var(--button-padding-y)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        'photo-sm': "var(--photo-shadow-sm)",
        'photo-lg': "var(--photo-shadow-lg)",
        gallery: "var(--gallery-shadow)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        photo: "var(--duration-photo)",
      },
      transitionTimingFunction: {
        ease: "var(--easing-ease)",
        in: "var(--easing-in)",
        out: "var(--easing-out)",
        bounce: "var(--easing-bounce)",
      },
      zIndex: {
        below: "var(--z-below)",
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
        'gallery-controls': "var(--z-gallery-controls)",
        'photo-overlay': "var(--z-photo-overlay)",
        lightbox: "var(--z-lightbox)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { 
            opacity: "0",
            transform: "translateY(1rem)" 
          },
          to: { 
            opacity: "1",
            transform: "translateY(0)" 
          },
        },
        photoHover: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.02)" },
        },
        // Photography-themed whimsical animations
        shutterClick: {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(0.95) rotate(-2deg)" },
          "50%": { transform: "scale(1.05) rotate(1deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        developPhoto: {
          "0%": { opacity: "0", filter: "blur(4px)" },
          "50%": { opacity: "0.5", filter: "blur(2px)" },
          "100%": { opacity: "1", filter: "blur(0px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        confetti: {
          "0%": {
            transform: "translateY(-100vh) rotate(0deg)",
            opacity: "1"
          },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0"
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn var(--duration-normal) var(--easing-out)",
        "slide-up": "slideUp var(--duration-normal) var(--easing-out)",
        "photo-hover": "photoHover var(--duration-photo) var(--easing-out)",
        // Photography-themed whimsical animations
        "shutter-click": "shutterClick 0.3s ease-out",
        "develop-photo": "developPhoto 1s ease-out",
        "shimmer": "shimmer 2s infinite",
        "heartbeat": "heartbeat 1s ease-in-out infinite",
        "wiggle": "wiggle 0.5s ease-in-out infinite",
        "confetti": "confetti 3s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config