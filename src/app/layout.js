import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "material-symbols/outlined.css";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import "@/lib/network/initOutboundProxy"; // Auto-initialize outbound proxy env
import { initConsoleLogCapture } from "@/lib/consoleLogBuffer";
import { RuntimeI18nProvider } from "@/i18n/RuntimeI18nProvider";

// Hook console immediately at module load time (server-side only, runs once)
initConsoleLogCapture();

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Relay AI - AI API Plans",
  description: "Use one OpenAI-compatible endpoint with one API key and simple monthly plan tiers.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Relay AI - The easiest way to use an AI endpoint",
    description: "Copy one OpenAI-compatible URL, add one API key, and send requests. Start free, upgrade when you need more tokens.",
    type: "website",
    siteName: "Relay AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relay AI - The easiest way to use an AI endpoint",
    description: "Copy one OpenAI-compatible URL, add one API key, and send requests. Start free, upgrade when you need more tokens.",
  },
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL ? new URL(process.env.NEXT_PUBLIC_BASE_URL) : undefined,
};

export const viewport = {
  themeColor: "#0a0a0a",
};

function MaybeClerkProvider({ children }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return children;
  return <ClerkProvider>{children}</ClerkProvider>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){document.documentElement.classList.add('fonts-loaded')})}else{document.documentElement.classList.add('fonts-loaded')}`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <MaybeClerkProvider>
          <ThemeProvider>
            <RuntimeI18nProvider>
              {children}
            </RuntimeI18nProvider>
          </ThemeProvider>
        </MaybeClerkProvider>
      </body>
    </html>
  );
}
