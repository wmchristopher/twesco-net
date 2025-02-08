import type { Metadata } from "next";
import { Grenze, Montserrat_Alternates } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const montserrat = Montserrat_Alternates({
  subsets: ['latin'],
  weight: "500"
})

const grenze = Grenze({
  variable: "--font-grenze",
  weight: "300",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TWESCO",
  description: "personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body
        className={`${grenze.className}`}
      >
        <header className={`${montserrat.className} text-center`}>
          <span className="logo">
            TWESCO
          </span>
        </header>
        {children}
      </body>
    </html>
  );
}
