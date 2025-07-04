import './globals.css'
import { Inter, Montserrat } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat'
});

export const metadata = {
  title: 'Leao Talent Bridge',
  description: 'Plataforma de carreiras para brasileiros nos Emirados Árabes Unidos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Leao Careers - Conectando Talentos a Oportunidades nos Emirados Árabes</title>
        <meta name="description" content="A Leao Careers conecta profissionais brasileiros às melhores oportunidades de trabalho nos Emirados Árabes Unidos." />
      </head>
      <body suppressHydrationWarning className={`${inter.className} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  )
}
