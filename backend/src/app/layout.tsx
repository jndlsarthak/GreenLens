import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GreenLens',
  description: 'AI-powered environmental impact assistant',
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
