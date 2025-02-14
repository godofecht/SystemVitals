import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Performance Dashboard",
  description: "Real-time data visualization and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              font-family: "${spaceGrotesk.style.fontFamily}", system-ui, sans-serif !important;
            }
            h1 { font-size: 48px !important; font-weight: 700; }
            h2 { font-size: 36px !important; font-weight: 600; }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
} 