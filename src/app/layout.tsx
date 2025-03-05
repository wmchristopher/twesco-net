import type { Metadata } from "next";
import { Ysabeau_Office, Montserrat_Alternates } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const montserrat = Montserrat_Alternates({
  subsets: ['latin'],
  weight: "500"
})

const ysabeau = Ysabeau_Office({
  variable: "--font-ysabeau",
  weight: "400",
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
        className={`${ysabeau.className}`}
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
