import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Ysabeau+Infant:ital,wght@0,1..1000;1,1..1000&family=Ysabeau:ital,wght@0,1..1000;1,1..1000&display=swap" rel="stylesheet" />
      </head>
      <Analytics />
      <body className="flex flex-col h-screen">
        <header className={`text-center`}>
          <Link className="logo" href='/'>
            TWESCO
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
