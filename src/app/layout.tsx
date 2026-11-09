import { ClerkProvider } from "@clerk/nextjs";
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

// Clerk's sign-in card in Bolo's colours.
const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#f2b33d",
    colorPrimaryForeground: "#1b1814",
    colorBackground: "#25211c",
    colorForeground: "#f3eee4",
    colorMutedForeground: "#9a9284",
    colorInput: "#1b1814",
    colorInputForeground: "#f3eee4",
    colorNeutral: "#f3eee4",
    colorDanger: "#e5705f",
    borderRadius: "14px",
    fontFamily: "var(--font-ui), system-ui, sans-serif",
  },
};

// Our own wording on the sign-in card, so it never shows Clerk's generated app name.
const CLERK_LOCALIZATION = {
  signIn: {
    start: {
      title: "Sign in to Bolo",
      titleCombined: "Sign in to Bolo",
      subtitle: "One free try per account",
      subtitleCombined: "One free try per account",
    },
  },
  signUp: {
    start: {
      title: "Create your Bolo account",
      titleCombined: "Create your Bolo account",
      subtitle: "One free try per account",
      subtitleCombined: "One free try per account",
    },
  },
};

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
        <ClerkProvider signInUrl="/sign-in" appearance={CLERK_APPEARANCE} localization={CLERK_LOCALIZATION}>
          <SiteHeader />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
