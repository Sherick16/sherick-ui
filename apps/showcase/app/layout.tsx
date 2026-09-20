import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "sherick-ui/styles.css";
import HydrationMarker from "./hydration-marker";

const inter = Inter({ subsets: ["latin"] });

const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem("sherick-ui-theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.sherickTheme = theme;
    } else {
      document.documentElement.removeAttribute("data-sherick-theme");
    }
  } catch (_) {}
})();`;

export const metadata: Metadata = {
  title: "Sherick UI",
  description: "A soft, expressive React component library with light and dark themes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The theme has to be on the document before the first paint, which means before React — so
            the snippet is `beforeInteractive`, which Next injects into the initial HTML. A plain
            `<script>` in the React tree is neither: React warns that a component-rendered script
            never executes on the client, and by the time React runs, the document is parsed. */}
        <Script
          id="sherick-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className={inter.className}>
        <HydrationMarker />
        {children}
      </body>
    </html>
  );
}
