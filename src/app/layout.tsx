import type { Metadata } from "next";
import { Grenze_Gotisch, Montserrat_Alternates } from "@next/font/google";
import "./globals.css";

const grenzeGotisch = Grenze_Gotisch({
  variable: "--font-grenze-gotisch",
  subsets: ["latin"],
});

export const montserrat = Montserrat_Alternates({
  subsets: ['latin'],
  weight: "500"
})

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
      <body
        className={`${grenzeGotisch.className}`}
      >
        {children}
      </body>
    </html>
  );
}
