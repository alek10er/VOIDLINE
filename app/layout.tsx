import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VOIDLINE',
  description: 'Private premium messenger with audio calls',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
