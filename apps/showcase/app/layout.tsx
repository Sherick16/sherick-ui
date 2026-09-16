import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "sherick-ui/styles.css";
import "./globals.css";

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
