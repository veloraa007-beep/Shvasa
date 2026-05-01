import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, DM_Sans, Space_Mono } from 'next/font/google';
import { AppProviders } from '@/components/shvasa/AppProviders';
import './globals.css';

// Optimized Font Configuration
const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shvasa | AI Execution Coach',
  description: 'Three daily tasks, focused sessions, short AI coaching, and Bloom rewards.',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#FDFBF7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased selection:bg-leaf/30 selection:text-forest">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
