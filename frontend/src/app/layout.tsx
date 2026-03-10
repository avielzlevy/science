import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ResearchReels — Enter the lab.",
  description: "An immersive digital theater for science discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} font-body bg-background text-foreground antialiased`}
      >
        {/* Clean background established, SVG noise removed to prevent pixelation engine artifacts */}
        
        {children}
      </body>
    </html>
  );
}
