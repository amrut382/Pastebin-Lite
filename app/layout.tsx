import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pastebin-Lite',
  description: 'A simple pastebin service',
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
