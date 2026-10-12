import './globals.css';
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ToatProvider } from '@/components/providers/toaster-provider';
import { ConfettiProvider } from '@/components/providers/confetti-provider';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Vidhyapith — Scholarly Knowledge Platform',
  description: 'Master practical disciplines through thoughtfully structured courses and academic curriculum.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
        <body className="font-sans antialiased bg-parchment-50 text-ink-900 selection:bg-ochre-100 selection:text-ink-900">
          {children}
          <ConfettiProvider />
          <ToatProvider />
        </body>
      </html>
    </ClerkProvider>
  );
}
