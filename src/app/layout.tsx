import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UNE Expert Business",
    template: "%s | UNE Expert Business",
  },
  description:
    "Sistema operacional comercial com IA para aquisição, conteúdo e vendas na área da educação.",
  keywords: ["IA", "educação", "marketing", "vendas", "automação", "Mestre Inova"],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${urbanist.variable} h-full`}>
      <body className="h-full bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
