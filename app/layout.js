import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  Bricolage_Grotesque,
  Inter,
} from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "TATALOKA | Warehouse Management System",
  description: "Kelola gudang, lebih tertata.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${bricolage.variable} ${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
