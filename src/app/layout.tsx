import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BONESMASH: the looksmaxxing simulator",
  description: "Click a 3D face with a hammer to bone smash it into a chiseled jawline. An ironic looksmaxxing parody game.",
  metadataBase: new URL("https://bonesmash.fun"),
  openGraph: {
    title: "BONESMASH: the looksmaxxing simulator",
    description: "I just ASCENDED. Can you do it?",
    url: "https://bonesmash.fun",
    siteName: "BONESMASH",
    images: [
      {
        url: "/share-image.png",
        width: 1200,
        height: 630,
        alt: "BONESMASH — You Ascended!",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BONESMASH: the looksmaxxing simulator",
    description: "I just ASCENDED. Can you do it?",
    images: ["/share-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased overflow-hidden bg-black">
        {children}
      </body>
    </html>
  );
}
