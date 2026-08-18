import './globals.css';
import StyledJsxRegistry from '../components/styled-jsx-registry';

export const metadata = {
  title: 'stream.new',
  icons: { icon: '/stream-new-asterisk.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><StyledJsxRegistry>{children}</StyledJsxRegistry></body>
    </html>
  );
}
