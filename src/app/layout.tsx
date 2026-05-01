import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, Space_Mono } from 'next/font/google';
import { AppProviders } from '@/components/shvasa/AppProviders';
import './globals.css';

// Environment validation is handled lazily in routes

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-dm-serif',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'Shvasa | AI Execution Coach',
  description: 'Three daily tasks, focused sessions, short AI coaching, and Bloom rewards.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${dmSans.variable} ${spaceMono.variable}`}>
      <body className="bg-surface text-on-surface font-body antialiased min-h-screen overflow-x-hidden" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #F5F3EF 0%, #FDFBF7 100%)' }}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
