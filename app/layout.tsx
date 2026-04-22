import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "FireDoor Network — A network that leads to work",
  description:
    "The UK network connecting verified fire door surveyors and inspectors with the property managers, contractors and clients who need them.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "FireDoor Network — A network that leads to work",
    description:
      "The UK network connecting verified fire door surveyors and inspectors with the property managers, contractors and clients who need them.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FireDoor Network — A network that leads to work",
    description:
      "The UK network connecting verified fire door surveyors and inspectors with the property managers, contractors and clients who need them.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
