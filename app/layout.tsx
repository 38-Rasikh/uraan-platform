import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Uraan — Igniting Minds, Empowering Futures',
  description:
    'Uraan Outreach Platform — Rahbar Project Division, UET Lahore. Orphanage directory, projects, and volunteer programmes.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, playfair.variable, jetbrains.variable)}
      suppressHydrationWarning
    >
      {/* No-flash script: reads a11y prefs from localStorage before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem('uraan-a11y')||'{}');var h=document.documentElement;h.setAttribute('data-theme',s.theme||'dark');h.setAttribute('data-text-size',s.textSize||'md');if(s.highContrast)h.setAttribute('data-high-contrast','true');if(s.colorblind&&s.colorblind!=='none')h.setAttribute('data-colorblind',s.colorblind);if(s.showAltText)h.setAttribute('data-alt-text','true');}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* SVG colorblind filters — invisible, referenced by CSS filter: url(#id) */}
        <svg
          aria-hidden="true"
          focusable="false"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <defs>
            <filter id="a11y-filter-deuteranopia" colorInterpolationFilters="linearRGB">
              <feColorMatrix
                type="matrix"
                values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"
              />
            </filter>
            <filter id="a11y-filter-protanopia" colorInterpolationFilters="linearRGB">
              <feColorMatrix
                type="matrix"
                values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"
              />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  )
}
