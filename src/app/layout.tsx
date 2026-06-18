import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { SessionProvider } from "@/context/session-context";
import { ThemeProvider } from "@/components/ui/theme-provider";

export const metadata: Metadata = {
  title: "Comunidad Campesina de Asia",
  description: "Sistema de gestión comunal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
          <Toaster richColors closeButton position="top-right" duration={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
