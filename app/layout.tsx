import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import { ThemeScript } from "@/components/providers/ThemeScript";
import { AppChrome } from "@/components/providers/AppChrome";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { StorageBanner } from "@/components/layout/StorageBanner";
import { EXAM } from "@/content/exam-facts";
import "./globals.css";

// Anthropic Serif / Sans are proprietary; these are the closest free stand-ins.
// next/font self-hosts them at build time (needs network during `next build`).
const serif = Source_Serif_4({
  variable: "--font-serif-var",
  subsets: ["latin"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${EXAM.code} Study Guide`,
    template: `%s · ${EXAM.code} Study Guide`,
  },
  description: `An unofficial study guide for the ${EXAM.credential} (${EXAM.code}) certification exam: curriculum, spaced-repetition drill, and a timed mock exam.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning on <html> ONLY: ThemeScript mutates its class
    // list before React sees it. Do not spread this elsewhere — it masks real bugs.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AppChrome>
          <StorageBanner />
          <TopBar />
          {children}
          <Footer />
        </AppChrome>
      </body>
    </html>
  );
}
