import './globals.css';
import { ReactNode } from 'react';
import Head from 'next/head';

export const metadata = {
  title: 'LooQueue',
  description: 'Manage bathroom queues easily',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#317EFB" />
      </Head>
      <body>{children}</body>
    </html>
  );
}
