import './globals.css';

export const metadata = {
  title: 'stream.new',
  icons: { icon: '/stream-new-asterisk.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
