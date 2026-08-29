import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZapIA | Atendente de IA no WhatsApp que responde 24h por dia",
  description:
    "Transforme seu WhatsApp em um atendente de IA que responde, qualifica leads, agenda e vende automaticamente, 24 horas por dia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
