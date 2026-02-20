import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shiftwell',
  description: 'Shiftwell - analyse travail / sommeil (chronobiologie)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}