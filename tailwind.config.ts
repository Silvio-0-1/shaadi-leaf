
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				rose: {
					50: 'hsl(327 73% 97%)',
					100: 'hsl(326 78% 95%)',
					200: 'hsl(326 85% 90%)',
					300: 'hsl(327 87% 81%)',
					400: 'hsl(329 86% 70%)',
					500: 'hsl(330 81% 60%)',
					600: 'hsl(333 71% 51%)',
					700: 'hsl(335 78% 42%)',
					800: 'hsl(336 74% 35%)',
					900: 'hsl(336 69% 30%)',
				},
				gold: {
					50: 'hsl(48 100% 96%)',
					100: 'hsl(48 96% 89%)',
					200: 'hsl(48 97% 77%)',
					300: 'hsl(46 97% 65%)',
					400: 'hsl(43 96% 56%)',
					500: 'hsl(var(--gold-500))',
					600: 'hsl(var(--gold-600))',
					700: 'hsl(32 95% 44%)',
					800: 'hsl(28 92% 37%)',
					900: 'hsl(24 84% 32%)',
				},
				lavender: {
					50: 'hsl(var(--lavender-light))',
					100: 'hsl(var(--lavender-medium))',
					200: 'hsl(var(--lavender-deep))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				serif: ['Playfair Display', 'serif'],
				sans: ['Inter', 'sans-serif'],
				script: ['Dancing Script', 'cursive'],
				'premium-serif': ['Playfair Display', 'Cormorant Garamond', 'serif'],
				'premium-sans': ['Inter', 'Poppins', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'premium-entrance': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.8) translateY(40px) rotateX(10deg)',
						filter: 'blur(10px)'
					},
					'60%': {
						opacity: '0.8',
						transform: 'scale(1.02) translateY(-5px) rotateX(-2deg)',
						filter: 'blur(2px)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) translateY(0) rotateX(0deg)',
						filter: 'blur(0px)'
					}
				},
				'text-fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)',
						filter: 'blur(5px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)',
						filter: 'blur(0px)'
					}
				},
				'floating-sparkles': {
					'0%, 100%': {
						opacity: '0.6',
						transform: 'translateY(0px) scale(1) rotate(0deg)'
					},
					'25%': {
						opacity: '1',
						transform: 'translateY(-15px) scale(1.2) rotate(90deg)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'translateY(-8px) scale(1.1) rotate(180deg)'
					},
					'75%': {
						opacity: '1',
						transform: 'translateY(-20px) scale(1.3) rotate(270deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.6s ease-out',
				'premium-entrance': 'premium-entrance 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
				'text-fade-in': 'text-fade-in 0.8s ease-out forwards',
				'floating-sparkles': 'floating-sparkles 4s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
