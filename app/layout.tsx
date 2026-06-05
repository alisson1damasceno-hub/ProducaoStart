import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Start Solidarium",
  description: "Controle integrado de produção: produto, ficha técnica, ordem e Kanban."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
