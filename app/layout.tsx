// app/layout.tsx
import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "Mondodorto Gioielleria",
  description: "La tua gioielleria online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log("👉 RootLayout attivo");

  return (
    <html lang="it">
      <body className="bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}