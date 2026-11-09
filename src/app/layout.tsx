import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { SiteHeader } from "@/components/site/SiteHeader";
import "./globals.css";

const ui = Instrument_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
});

// Your own words are set in this serif, like a proof on an editor's desk.
const proof = Newsreader({
  variable: "--font-proof",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const DESCRIPTION = "Practice explaining tech out loud, get corrected on the spot, and watch your score go up in three tries.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolo-kohl.vercel.app"),
  title: "Bolo: speaking coach for engineers",
  description: DESCRIPTION,
  openGraph: {
    title: "Bolo: speaking coach for engineers",
    description: DESCRIPTION,
    siteName: "Bolo",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Bolo: speaking coach for engineers", description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ui.variable} ${proof.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
