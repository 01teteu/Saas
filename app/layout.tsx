import type {Metadata} from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css'; // Global styles

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Mr. Duque | Barbearia Premium',
  description: 'Barbearia Mr. Duque — Av. Atlântico, 94, Cohab, Cabo de Santo Agostinho, PE',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-black text-slate-200">{children}</body>
    </html>
  );
}
