import type { Metadata } from "next";
import { Source_Serif_4, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeScript } from "@/components/providers/ThemeScript";
import { LocaleScript } from "@/components/providers/LocaleScript";
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

// Variable on Google Fonts, so one file covers every weight.
const mono = JetBrains_Mono({
  variable: "--font-mono-var",
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
    // list, and LocaleScript its `lang`, before React sees them. Do not spread
    // this elsewhere — it masks real bugs.
    <html
      lang="en"
      // globals.css sets scroll-behavior:smooth for in-page anchors; this tells
      // Next to suspend it during route changes so a new page opens at its top
      // instead of animating up from wherever the last one was left.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
        <LocaleScript />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AppChrome>
          <StorageBanner />
          <TopBar />
          {/* Skip-link target. Pages own their <main>; this only anchors it. */}
          <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <Footer />
        </AppChrome>
      </body>
    </html>
  );
}
