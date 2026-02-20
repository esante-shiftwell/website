import './globals.css';
import type { Metadata } from 'next';
import AppFooter from '@/components/AppFooter';
import { getAppVersion } from '@/lib/appVersion';

export const metadata: Metadata = {
  title: 'Shiftwell',
  description: 'Shiftwell - analyse travail / sommeil (chronobiologie)',
  icons: {
    icon: '/shiftwell-icon.png',
    shortcut: '/shiftwell-icon.png',
    apple: '/shiftwell-icon.png',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appVersion = getAppVersion();
  
  return (
    <html lang="en">
      <body>
        {children}
        <AppFooter scoringVersion={appVersion} />
      </body>
    </html>
  );
}